/**
 * Command Center Outbound Webhook Service
 * Sends events to the central command center for user/credit sync
 */

import crypto from 'crypto';
import logger from '../utils/logger.js';

// ============================================================================
// CONFIGURATION
// ============================================================================

const config = {
  webhookUrl: process.env.COMMAND_CENTER_WEBHOOK_URL || '',
  webhookSecret: process.env.COMMAND_CENTER_WEBHOOK_SECRET || '',
  serviceKey: process.env.COMMAND_CENTER_SERVICE_KEY || '',
  enabled: process.env.ENABLE_COMMAND_CENTER_WEBHOOKS === 'true',
  retryAttempts: parseInt(process.env.WEBHOOK_RETRY_ATTEMPTS || '3', 10),
  retryDelayMs: parseInt(process.env.WEBHOOK_RETRY_DELAY_MS || '1000', 10),
  timeoutMs: parseInt(process.env.WEBHOOK_TIMEOUT_MS || '10000', 10),
};

// ============================================================================
// EVENT TYPES
// ============================================================================

export const WebhookEventType = {
  // User lifecycle
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_SUSPENDED: 'user.suspended',

  // Credits
  CREDITS_PURCHASED: 'credits.purchased',
  CREDITS_USED: 'credits.used',
  CREDITS_EXPIRED: 'credits.expired',

  // Beta codes
  BETA_CODE_REDEEMED: 'beta_code.redeemed',

  // Search activity
  SEARCH_COMPLETED: 'search.completed',
};

// ============================================================================
// RETRY QUEUE
// ============================================================================

const retryQueue = [];
let processingRetries = false;

// ============================================================================
// INTERNAL METHODS
// ============================================================================

/**
 * Generate a unique event ID
 */
function generateEventId(event, data, timestamp) {
  const userId = data.userId || 'system';
  const entityId = data.searchId || data.transactionId || data.analysisId || 'none';
  const ts = new Date(timestamp).getTime();
  return `${userId}_${entityId}_${event}_${ts}`;
}

/**
 * Build the webhook payload
 */
function buildPayload(event, data) {
  const timestamp = new Date().toISOString();
  const eventId = generateEventId(event, data, timestamp);

  return {
    eventId,
    event,
    timestamp,
    data,
  };
}

/**
 * Sign the payload with HMAC-SHA256
 */
function signPayload(payload) {
  return crypto
    .createHmac('sha256', config.webhookSecret)
    .update(payload, 'utf8')
    .digest('hex');
}

/**
 * Send webhook to Command Center
 */
async function sendWebhook(payload) {
  const body = JSON.stringify(payload);
  const signature = signPayload(body);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-ProprScout-Signature': `sha256=${signature}`,
        'X-Webhook-Event': payload.event,
        'X-Webhook-Event-Id': payload.eventId,
        'X-Webhook-Timestamp': payload.timestamp,
      },
      body,
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Queue event for retry
 */
function queueForRetry(payload) {
  retryQueue.push({
    payload,
    attempts: 1,
    nextAttemptAt: new Date(Date.now() + config.retryDelayMs),
  });
}

/**
 * Process retry queue
 */
async function processRetryQueue() {
  if (processingRetries || retryQueue.length === 0) return;

  processingRetries = true;
  const now = new Date();

  try {
    const dueEvents = retryQueue.filter((e) => e.nextAttemptAt <= now);

    for (const event of dueEvents) {
      try {
        await sendWebhook(event.payload);
        // Remove from queue on success
        const index = retryQueue.indexOf(event);
        if (index > -1) retryQueue.splice(index, 1);
        logger.info(`Webhook retry succeeded: ${event.payload.event}`);
      } catch (error) {
        event.attempts++;
        if (event.attempts >= config.retryAttempts) {
          // Remove from queue after max attempts
          const index = retryQueue.indexOf(event);
          if (index > -1) retryQueue.splice(index, 1);
          logger.error(`Webhook retry exhausted: ${event.payload.event}`, error.message);
        } else {
          // Exponential backoff
          const delay = config.retryDelayMs * Math.pow(2, event.attempts - 1);
          event.nextAttemptAt = new Date(Date.now() + delay);
        }
      }
    }
  } finally {
    processingRetries = false;
  }
}

// Start retry processor (every 5 seconds)
if (config.enabled) {
  setInterval(processRetryQueue, 5000);
  logger.info(`🔗 Command Center webhooks enabled → ${config.webhookUrl}`);
} else {
  logger.warn('⚠️ Command Center webhooks DISABLED');
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Emit a webhook event to Command Center
 */
export async function emit(event, data) {
  if (!config.enabled) {
    logger.debug(`Webhook disabled, skipping: ${event}`);
    return false;
  }

  const payload = buildPayload(event, data);

  try {
    await sendWebhook(payload);
    logger.info(`✅ Webhook sent: ${event} [${payload.eventId}]`);
    return true;
  } catch (error) {
    logger.error(`❌ Webhook failed: ${event} [${payload.eventId}]`, error.message);
    queueForRetry(payload);
    return false;
  }
}

/**
 * Emit user created event
 */
export async function emitUserCreated(user) {
  return emit(WebhookEventType.USER_CREATED, {
    userId: user.id || user._id?.toString(),
    email: user.email,
    name: user.name || null,
    inviteCode: user.inviteCode || null,
  });
}

/**
 * Emit user updated event
 */
export async function emitUserUpdated(user, changedFields = []) {
  return emit(WebhookEventType.USER_UPDATED, {
    userId: user.id || user._id?.toString(),
    email: user.email,
    name: user.name || null,
    changedFields,
  });
}

/**
 * Emit credits purchased event
 */
export async function emitCreditsPurchased(data) {
  return emit(WebhookEventType.CREDITS_PURCHASED, {
    userId: data.userId,
    email: data.email,
    creditsAdded: data.creditsAdded,
    newBalance: data.newBalance,
    transactionId: data.transactionId || null,
    paymentMethod: data.paymentMethod || null,
  });
}

/**
 * Emit credits used event (after AI search/analysis)
 */
export async function emitCreditsUsed(data) {
  return emit(WebhookEventType.CREDITS_USED, {
    userId: data.userId,
    email: data.email,
    creditsUsed: data.creditsUsed,
    remainingBalance: data.remainingBalance,
    analysisId: data.analysisId || null,
  });
}

/**
 * Emit beta code redeemed event
 */
export async function emitBetaCodeRedeemed(data) {
  return emit(WebhookEventType.BETA_CODE_REDEEMED, {
    userId: data.userId,
    email: data.email,
    code: data.code,
    creditsAwarded: data.creditsAwarded,
  });
}

/**
 * Emit search/analysis completed event (for engagement tracking)
 */
export async function emitSearchCompleted(data) {
  return emit(WebhookEventType.SEARCH_COMPLETED, {
    userId: data.userId,
    email: data.email,
    analysisId: data.analysisId,
    resultsCount: data.resultsCount || 1,
    searchType: data.searchType || 'property_detective',
  });
}

// Export config for external access
export function isEnabled() {
  return config.enabled;
}

export function getServiceKey() {
  return config.serviceKey;
}

export default {
  emit,
  emitUserCreated,
  emitUserUpdated,
  emitCreditsPurchased,
  emitCreditsUsed,
  emitBetaCodeRedeemed,
  emitSearchCompleted,
  isEnabled,
  getServiceKey,
  WebhookEventType,
};
