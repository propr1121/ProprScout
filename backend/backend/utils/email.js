/**
 * Email Utility
 * Handles sending transactional emails using Resend
 * Template style matches ProprHome but with ProprScout branding
 */

import { Resend } from 'resend';
import logger from './logger.js';

// Initialize Resend client
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Email sender address (must be verified in Resend)
const FROM_EMAIL = process.env.FROM_EMAIL || 'ProprScout <noreply@proprscout.com>';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ProprScout brand colors
const BRAND_GREEN = '#00d185';
const BRAND_GREEN_DARK = '#00b876';

// Inline SVG icons as data URIs (no external hosting needed)
// House/Logo icon - white house on transparent background
const LOGO_ICON_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M12 3L2 12h3v9h6v-6h2v6h6v-9h3L12 3z'/%3E%3C/svg%3E`;

// Social media icons as inline SVGs (white color for use on green background)
const SOCIAL_ICONS = {
  twitter: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'/%3E%3C/svg%3E`,
  youtube: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z'/%3E%3C/svg%3E`,
  linkedin: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'/%3E%3C/svg%3E`,
  instagram: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z'/%3E%3C/svg%3E`,
  facebook: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z'/%3E%3C/svg%3E`
};

/**
 * Email template base - matches ProprHome style with ProprScout branding
 * Gray background, white card, logo header, social footer
 */
const getEmailTemplate = (content, title) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #e5e5e5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">

  <!-- Wrapper Table -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #e5e5e5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">

        <!-- Logo Header -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 500px;">
          <tr>
            <td align="center" style="padding: 0 0 30px 0;">
              <!-- Logo with gradient background -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background: linear-gradient(135deg, ${BRAND_GREEN} 0%, ${BRAND_GREEN_DARK} 100%); border-radius: 12px; padding: 10px 20px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="vertical-align: middle;">
                          <!-- Simple house icon - inline SVG -->
                          <img src="${LOGO_ICON_SVG}" alt="" width="28" height="28" style="display: block; border: 0;" />
                        </td>
                        <td style="vertical-align: middle; padding-left: 10px;">
                          <span style="font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">ProprScout</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <p style="margin: 12px 0 0 0; font-size: 12px; color: #6b7280;">Real Estate Intelligence</p>
            </td>
          </tr>
        </table>

        <!-- Main Content Card -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 500px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <tr>
            <td style="padding: 48px 40px;">
              ${content}
            </td>
          </tr>
        </table>

        <!-- Dotted Divider -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 500px;">
          <tr>
            <td style="padding: 24px 40px;">
              <div style="border-top: 2px dotted #d1d5db;"></div>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 500px;">
          <tr>
            <td align="center" style="padding: 0 20px;">

              <!-- Social Icons - using inline SVG data URIs -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding: 0 6px;">
                    <a href="https://twitter.com/proprscout" style="text-decoration: none;">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="width: 32px; height: 32px; background-color: ${BRAND_GREEN}; border-radius: 16px; text-align: center; vertical-align: middle;">
                            <img src="${SOCIAL_ICONS.twitter}" alt="X" width="14" height="14" style="display: inline-block; vertical-align: middle;" />
                          </td>
                        </tr>
                      </table>
                    </a>
                  </td>
                  <td style="padding: 0 6px;">
                    <a href="https://youtube.com/@proprscout" style="text-decoration: none;">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="width: 32px; height: 32px; background-color: ${BRAND_GREEN}; border-radius: 16px; text-align: center; vertical-align: middle;">
                            <img src="${SOCIAL_ICONS.youtube}" alt="YouTube" width="14" height="14" style="display: inline-block; vertical-align: middle;" />
                          </td>
                        </tr>
                      </table>
                    </a>
                  </td>
                  <td style="padding: 0 6px;">
                    <a href="https://linkedin.com/company/proprscout" style="text-decoration: none;">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="width: 32px; height: 32px; background-color: ${BRAND_GREEN}; border-radius: 16px; text-align: center; vertical-align: middle;">
                            <img src="${SOCIAL_ICONS.linkedin}" alt="LinkedIn" width="14" height="14" style="display: inline-block; vertical-align: middle;" />
                          </td>
                        </tr>
                      </table>
                    </a>
                  </td>
                  <td style="padding: 0 6px;">
                    <a href="https://instagram.com/proprscout" style="text-decoration: none;">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="width: 32px; height: 32px; background-color: ${BRAND_GREEN}; border-radius: 16px; text-align: center; vertical-align: middle;">
                            <img src="${SOCIAL_ICONS.instagram}" alt="Instagram" width="14" height="14" style="display: inline-block; vertical-align: middle;" />
                          </td>
                        </tr>
                      </table>
                    </a>
                  </td>
                  <td style="padding: 0 6px;">
                    <a href="https://facebook.com/proprscout" style="text-decoration: none;">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="width: 32px; height: 32px; background-color: ${BRAND_GREEN}; border-radius: 16px; text-align: center; vertical-align: middle;">
                            <img src="${SOCIAL_ICONS.facebook}" alt="Facebook" width="14" height="14" style="display: inline-block; vertical-align: middle;" />
                          </td>
                        </tr>
                      </table>
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Copyright -->
              <p style="margin: 24px 0 8px 0; font-size: 12px; color: #9ca3af; text-align: center;">
                © ${new Date().getFullYear()} ProprScout, a registered trademark of Hothouse Innovation LDA. All rights reserved.
              </p>

              <!-- Unsubscribe -->
              <p style="margin: 0 0 16px 0; font-size: 12px; color: #9ca3af; text-align: center;">
                <a href="${FRONTEND_URL}/unsubscribe" style="color: ${BRAND_GREEN}; text-decoration: underline;">Unsubscribe</a> from email communications
              </p>

              <!-- Footer Links -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding: 0 12px;">
                    <a href="${FRONTEND_URL}/contact" style="font-size: 12px; color: #6b7280; text-decoration: underline;">Contact</a>
                  </td>
                  <td style="padding: 0 12px;">
                    <a href="${FRONTEND_URL}/privacy" style="font-size: 12px; color: #6b7280; text-decoration: underline;">Privacy</a>
                  </td>
                  <td style="padding: 0 12px;">
                    <a href="${FRONTEND_URL}/terms" style="font-size: 12px; color: #6b7280; text-decoration: underline;">Terms</a>
                  </td>
                  <td style="padding: 0 12px;">
                    <a href="${FRONTEND_URL}/cookies" style="font-size: 12px; color: #6b7280; text-decoration: underline;">Cookies</a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;

/**
 * Button component for emails - ProprScout green with rounded corners
 */
const getButton = (text, url) => `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
  <tr>
    <td align="center" style="padding: 24px 0;">
      <!--[if mso]>
      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${url}" style="height:48px;v-text-anchor:middle;width:200px;" arcsize="50%" strokecolor="${BRAND_GREEN}" fillcolor="${BRAND_GREEN}">
        <w:anchorlock/>
        <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">${text}</center>
      </v:roundrect>
      <![endif]-->
      <!--[if !mso]><!-->
      <a href="${url}" style="display: inline-block; padding: 14px 40px; background-color: ${BRAND_GREEN}; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 24px; mso-hide: all;">
        ${text}
      </a>
      <!--<![endif]-->
    </td>
  </tr>
</table>
`;

/**
 * Send email via Resend
 */
const sendEmail = async ({ to, subject, html, text }) => {
  // Development mode - log to console
  if (!resend || process.env.NODE_ENV !== 'production') {
    logger.info('📧 Email (dev mode):');
    logger.info(`  To: ${to}`);
    logger.info(`  Subject: ${subject}`);
    const linkMatch = text?.match(/https?:\/\/[^\s]+/);
    if (linkMatch) {
      logger.info(`  Link: ${linkMatch[0]}`);
    }
    return { id: 'dev-mode-' + Date.now() };
  }

  // Production mode - send via Resend
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      text
    });

    if (error) {
      logger.error(`Resend error: ${error.message}`);
      throw new Error(error.message);
    }

    logger.info(`Email sent successfully to ${to} (ID: ${data.id})`);
    return data;
  } catch (error) {
    logger.error(`Failed to send email to ${to}:`, error);
    throw error;
  }
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (email, resetToken, userName) => {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;
  const firstName = userName?.split(' ')[0] || 'there';

  const content = `
    <h1 style="margin: 0 0 24px 0; font-size: 28px; font-weight: 700; color: #111827; text-align: center;">
      Hi ${firstName},
    </h1>
    <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.6; color: #4b5563; text-align: center;">
      We received a request to reset your password.
    </p>
    ${getButton('Click Here', resetUrl)}
    <div style="border-top: 2px dotted #e5e7eb; margin: 32px 0; padding-top: 24px;">
      <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #6b7280; text-align: left;">
        If you did not request to change your password please ignore this email.
      </p>
    </div>
    <p style="margin: 0; font-size: 14px; color: #111827; text-align: left;">
      Best wishes,<br>
      <span style="color: ${BRAND_GREEN}; font-weight: 600;">The ProprScout Team</span>
    </p>
  `;

  return sendEmail({
    to: email,
    subject: 'Reset Your ProprScout Password',
    html: getEmailTemplate(content, 'Reset Your Password'),
    text: `Hi ${firstName},\n\nWe received a request to reset your password.\n\nClick the link below to reset your password:\n${resetUrl}\n\nIf you did not request to change your password please ignore this email.\n\nBest wishes,\nThe ProprScout Team`
  });
};

/**
 * Send email verification email
 */
export const sendVerificationEmail = async (email, verificationToken, userName) => {
  const verifyUrl = `${FRONTEND_URL}/verify-email?token=${verificationToken}`;
  const firstName = userName?.split(' ')[0] || 'there';

  const content = `
    <h1 style="margin: 0 0 24px 0; font-size: 28px; font-weight: 700; color: #111827; text-align: center;">
      Hi ${firstName},
    </h1>
    <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.6; color: #4b5563; text-align: center;">
      Welcome to ProprScout! Please verify your email address to get started.
    </p>
    ${getButton('Verify Email', verifyUrl)}
    <div style="border-top: 2px dotted #e5e7eb; margin: 32px 0; padding-top: 24px;">
      <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #6b7280; text-align: left;">
        This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
      </p>
    </div>
    <p style="margin: 0; font-size: 14px; color: #111827; text-align: left;">
      Best wishes,<br>
      <span style="color: ${BRAND_GREEN}; font-weight: 600;">The ProprScout Team</span>
    </p>
  `;

  return sendEmail({
    to: email,
    subject: 'Verify Your ProprScout Email',
    html: getEmailTemplate(content, 'Verify Your Email'),
    text: `Hi ${firstName},\n\nWelcome to ProprScout! Please verify your email address by clicking the link below:\n\n${verifyUrl}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account with ProprScout, you can safely ignore this email.\n\nBest wishes,\nThe ProprScout Team`
  });
};

/**
 * Send welcome email after successful registration
 */
export const sendWelcomeEmail = async (email, userName) => {
  const dashboardUrl = `${FRONTEND_URL}/dashboard`;
  const firstName = userName?.split(' ')[0] || 'there';

  const content = `
    <h1 style="margin: 0 0 24px 0; font-size: 28px; font-weight: 700; color: #111827; text-align: center;">
      Welcome, ${firstName}!
    </h1>
    <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.6; color: #4b5563; text-align: center;">
      Congratulations on joining ProprScout! You now have access to powerful property intelligence tools.
    </p>

    <div style="background-color: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <p style="margin: 0 0 16px 0; font-size: 14px; font-weight: 600; color: #111827;">What you can do:</p>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%;">
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #4b5563;">✓ Analyze property listings with AI-powered insights</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #4b5563;">✓ Search locations from photos with geolocation</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #4b5563;">✓ Get market intelligence and investment analysis</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #4b5563;">✓ Track property performance and trends</td>
        </tr>
      </table>
    </div>

    ${getButton('Go to Dashboard', dashboardUrl)}

    <div style="border-top: 2px dotted #e5e7eb; margin: 32px 0; padding-top: 24px;">
      <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #6b7280; text-align: left;">
        Need help getting started? Simply reply to this email.
      </p>
    </div>
    <p style="margin: 0; font-size: 14px; color: #111827; text-align: left;">
      Best wishes,<br>
      <span style="color: ${BRAND_GREEN}; font-weight: 600;">The ProprScout Team</span>
    </p>
  `;

  return sendEmail({
    to: email,
    subject: 'Welcome to ProprScout!',
    html: getEmailTemplate(content, 'Welcome to ProprScout'),
    text: `Welcome, ${firstName}!\n\nCongratulations on joining ProprScout! You now have access to powerful property intelligence tools.\n\nWhat you can do:\n- Analyze property listings with AI-powered insights\n- Search locations from photos with our geolocation tool\n- Get market intelligence and investment analysis\n- Track property performance and trends\n\nGet started: ${dashboardUrl}\n\nNeed help? Reply to this email.\n\nBest wishes,\nThe ProprScout Team`
  });
};

/**
 * Send new login notification email
 */
export const sendLoginNotificationEmail = async (email, userName, loginInfo) => {
  const { ip, userAgent, location, timestamp } = loginInfo;
  const securityUrl = `${FRONTEND_URL}/dashboard/settings`;
  const firstName = userName?.split(' ')[0] || 'there';
  const time = timestamp ? new Date(timestamp).toLocaleString() : new Date().toLocaleString();

  const content = `
    <h1 style="margin: 0 0 24px 0; font-size: 28px; font-weight: 700; color: #111827; text-align: center;">
      Hi ${firstName},
    </h1>
    <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.6; color: #4b5563; text-align: center;">
      We detected a new login to your ProprScout account.
    </p>

    <div style="background-color: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; font-size: 14px;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; width: 100px;">Time:</td>
          <td style="padding: 8px 0; color: #111827;">${time}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Location:</td>
          <td style="padding: 8px 0; color: #111827;">${location || 'Unknown'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">IP Address:</td>
          <td style="padding: 8px 0; color: #111827;">${ip || 'Unknown'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Device:</td>
          <td style="padding: 8px 0; color: #111827; word-break: break-word;">${userAgent || 'Unknown'}</td>
        </tr>
      </table>
    </div>

    ${getButton('Review Security', securityUrl)}

    <div style="border-top: 2px dotted #e5e7eb; margin: 32px 0; padding-top: 24px;">
      <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #6b7280; text-align: left;">
        If this was you, you can ignore this email. If you don't recognize this activity, please change your password immediately.
      </p>
    </div>
    <p style="margin: 0; font-size: 14px; color: #111827; text-align: left;">
      Best wishes,<br>
      <span style="color: ${BRAND_GREEN}; font-weight: 600;">The ProprScout Team</span>
    </p>
  `;

  return sendEmail({
    to: email,
    subject: 'New Login to Your ProprScout Account',
    html: getEmailTemplate(content, 'New Login Detected'),
    text: `Hi ${firstName},\n\nWe detected a new login to your ProprScout account.\n\nTime: ${time}\nLocation: ${location || 'Unknown'}\nIP Address: ${ip || 'Unknown'}\nDevice: ${userAgent || 'Unknown'}\n\nIf this was you, you can ignore this email. If you don't recognize this activity, please change your password immediately.\n\nReview security settings: ${securityUrl}\n\nBest wishes,\nThe ProprScout Team`
  });
};

/**
 * Send payment confirmation email
 */
export const sendPaymentConfirmationEmail = async (email, userName, paymentInfo) => {
  const { amount, currency, plan, invoiceUrl, date, transactionId } = paymentInfo;
  const dashboardUrl = `${FRONTEND_URL}/dashboard`;
  const firstName = userName?.split(' ')[0] || 'there';

  // Amount can be passed as already formatted string (e.g., "29.00") or as cents
  const formattedAmount = typeof amount === 'string'
    ? `€${amount}`
    : new Intl.NumberFormat('en-EU', {
        style: 'currency',
        currency: currency || 'EUR'
      }).format(amount / 100);

  const content = `
    <h1 style="margin: 0 0 24px 0; font-size: 28px; font-weight: 700; color: #111827; text-align: center;">
      Hi ${firstName},
    </h1>
    <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.6; color: #4b5563; text-align: center;">
      Thank you for your payment! Your subscription is now active.
    </p>

    <div style="background-color: #f0fdf4; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; font-size: 14px;">
        <tr>
          <td style="padding: 8px 0; color: #166534;">Plan:</td>
          <td style="padding: 8px 0; color: #166534; text-align: right; font-weight: 600;">${plan || 'ProprScout Pro'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #166534;">Amount:</td>
          <td style="padding: 8px 0; color: #166534; text-align: right; font-size: 18px; font-weight: 700;">${formattedAmount}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #166534;">Date:</td>
          <td style="padding: 8px 0; color: #166534; text-align: right;">${date || new Date().toLocaleDateString()}</td>
        </tr>
        ${transactionId ? `
        <tr>
          <td style="padding: 8px 0; color: #166534;">Transaction:</td>
          <td style="padding: 8px 0; color: #166534; text-align: right; font-size: 12px;">${transactionId}</td>
        </tr>
        ` : ''}
      </table>
    </div>

    ${getButton('Go to Dashboard', dashboardUrl)}

    ${invoiceUrl ? `
    <p style="margin: 16px 0 0; font-size: 13px; color: #6b7280; text-align: center;">
      <a href="${invoiceUrl}" style="color: ${BRAND_GREEN}; text-decoration: underline;">Download Invoice</a>
    </p>
    ` : ''}

    <div style="border-top: 2px dotted #e5e7eb; margin: 32px 0; padding-top: 24px;">
      <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #6b7280; text-align: left;">
        If you have any questions about your payment, please contact our support team.
      </p>
    </div>
    <p style="margin: 0; font-size: 14px; color: #111827; text-align: left;">
      Best wishes,<br>
      <span style="color: ${BRAND_GREEN}; font-weight: 600;">The ProprScout Team</span>
    </p>
  `;

  return sendEmail({
    to: email,
    subject: 'Payment Confirmed - ProprScout',
    html: getEmailTemplate(content, 'Payment Confirmed'),
    text: `Hi ${firstName},\n\nThank you for your payment! Your ProprScout subscription is now active.\n\nPlan: ${plan || 'ProprScout Pro'}\nAmount: ${formattedAmount}\nDate: ${date || new Date().toLocaleDateString()}\n\nGo to dashboard: ${dashboardUrl}\n${invoiceUrl ? `Download invoice: ${invoiceUrl}` : ''}\n\nBest wishes,\nThe ProprScout Team`
  });
};

/**
 * Send subscription status email (activation, renewal, cancellation)
 */
export const sendSubscriptionEmail = async (email, userName, subscriptionInfo) => {
  const { status, plan, endDate, expiresAt, reason } = subscriptionInfo;
  const dashboardUrl = `${FRONTEND_URL}/dashboard`;
  const creditsUrl = `${FRONTEND_URL}/dashboard/credits`;
  const firstName = userName?.split(' ')[0] || 'there';

  // Format expiration date
  const expDate = expiresAt ? new Date(expiresAt).toLocaleDateString() : endDate;

  let title, message, buttonText, buttonUrl, statusBgColor, statusColor;

  switch (status) {
    case 'activated':
      title = 'Subscription Activated!';
      message = `Your ${plan || 'ProprScout'} subscription is now active. You have full access to all features.`;
      buttonText = 'Start Exploring';
      buttonUrl = dashboardUrl;
      statusBgColor = '#f0fdf4';
      statusColor = '#166534';
      break;
    case 'renewed':
      title = 'Subscription Renewed';
      message = `Your ${plan || 'ProprScout'} subscription has been renewed successfully.`;
      buttonText = 'Go to Dashboard';
      buttonUrl = dashboardUrl;
      statusBgColor = '#f0fdf4';
      statusColor = '#166534';
      break;
    case 'cancelled':
      title = 'Subscription Cancelled';
      message = `Your ${plan || 'ProprScout'} subscription has been cancelled. You'll continue to have access until ${expDate || 'the end of your billing period'}.`;
      buttonText = 'Reactivate';
      buttonUrl = creditsUrl;
      statusBgColor = '#fef2f2';
      statusColor = '#991b1b';
      break;
    case 'expiring':
      title = 'Subscription Expiring Soon';
      message = `Your ${plan || 'ProprScout'} subscription will expire on ${expDate}. Renew now to keep your access.`;
      buttonText = 'Renew Now';
      buttonUrl = creditsUrl;
      statusBgColor = '#fffbeb';
      statusColor = '#92400e';
      break;
    case 'expired':
      title = 'Subscription Expired';
      message = `Your ${plan || 'ProprScout'} subscription has expired. Reactivate to regain access to all features.`;
      buttonText = 'Reactivate Now';
      buttonUrl = creditsUrl;
      statusBgColor = '#fef2f2';
      statusColor = '#991b1b';
      break;
    case 'payment_failed':
      title = 'Payment Failed';
      message = `We couldn't process your payment. Please update your payment method to avoid service interruption.`;
      buttonText = 'Update Payment';
      buttonUrl = creditsUrl;
      statusBgColor = '#fef2f2';
      statusColor = '#991b1b';
      break;
    default:
      title = 'Subscription Update';
      message = `There's been an update to your ${plan || 'ProprScout'} subscription.`;
      buttonText = 'View Details';
      buttonUrl = dashboardUrl;
      statusBgColor = '#f9fafb';
      statusColor = '#4b5563';
  }

  const content = `
    <h1 style="margin: 0 0 24px 0; font-size: 28px; font-weight: 700; color: #111827; text-align: center;">
      Hi ${firstName},
    </h1>
    <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.6; color: #4b5563; text-align: center;">
      ${message}
    </p>

    <div style="background-color: ${statusBgColor}; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; font-size: 14px;">
        <tr>
          <td style="padding: 8px 0; color: ${statusColor};">Status:</td>
          <td style="padding: 8px 0; color: ${statusColor}; text-align: right; font-weight: 600;">${title}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: ${statusColor};">Plan:</td>
          <td style="padding: 8px 0; color: ${statusColor}; text-align: right;">${plan || 'ProprScout Pro'}</td>
        </tr>
        ${expDate ? `
        <tr>
          <td style="padding: 8px 0; color: ${statusColor};">Access until:</td>
          <td style="padding: 8px 0; color: ${statusColor}; text-align: right;">${expDate}</td>
        </tr>
        ` : ''}
        ${reason ? `
        <tr>
          <td style="padding: 8px 0; color: ${statusColor};">Reason:</td>
          <td style="padding: 8px 0; color: ${statusColor}; text-align: right;">${reason}</td>
        </tr>
        ` : ''}
      </table>
    </div>

    ${getButton(buttonText, buttonUrl)}

    <div style="border-top: 2px dotted #e5e7eb; margin: 32px 0; padding-top: 24px;">
      <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #6b7280; text-align: left;">
        Questions? Reply to this email or contact support@proprscout.com
      </p>
    </div>
    <p style="margin: 0; font-size: 14px; color: #111827; text-align: left;">
      Best wishes,<br>
      <span style="color: ${BRAND_GREEN}; font-weight: 600;">The ProprScout Team</span>
    </p>
  `;

  return sendEmail({
    to: email,
    subject: `${title} - ProprScout`,
    html: getEmailTemplate(content, title),
    text: `Hi ${firstName},\n\n${message}\n\nPlan: ${plan || 'ProprScout Pro'}\n${expDate ? `Access until: ${expDate}` : ''}\n${reason ? `Reason: ${reason}` : ''}\n\n${buttonText}: ${buttonUrl}\n\nQuestions? Contact support@proprscout.com\n\nBest wishes,\nThe ProprScout Team`
  });
};

/**
 * Send Propr Points (credits) low warning email
 */
export const sendLowCreditsEmail = async (email, userName, creditsInfo) => {
  const { remaining, threshold } = creditsInfo;
  const creditsUrl = `${FRONTEND_URL}/dashboard/credits`;
  const firstName = userName?.split(' ')[0] || 'there';

  const content = `
    <h1 style="margin: 0 0 24px 0; font-size: 28px; font-weight: 700; color: #111827; text-align: center;">
      Hi ${firstName},
    </h1>
    <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.6; color: #4b5563; text-align: center;">
      Your Propr Points balance is running low.
    </p>

    <div style="background-color: #fffbeb; border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
      <p style="margin: 0 0 8px; font-size: 14px; color: #92400e;">Current Balance</p>
      <p style="margin: 0; font-size: 42px; font-weight: 700; color: #92400e;">${remaining}</p>
      <p style="margin: 8px 0 0; font-size: 13px; color: #92400e;">Propr Points remaining</p>
    </div>

    <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #4b5563; text-align: center;">
      Top up your points to continue using property analysis and location search features without interruption.
    </p>

    ${getButton('Get More Points', creditsUrl)}

    <div style="border-top: 2px dotted #e5e7eb; margin: 32px 0; padding-top: 24px;">
      <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #6b7280; text-align: left;">
        Points are used for property analyses and geolocation searches.
      </p>
    </div>
    <p style="margin: 0; font-size: 14px; color: #111827; text-align: left;">
      Best wishes,<br>
      <span style="color: ${BRAND_GREEN}; font-weight: 600;">The ProprScout Team</span>
    </p>
  `;

  return sendEmail({
    to: email,
    subject: 'Low Propr Points Balance - ProprScout',
    html: getEmailTemplate(content, 'Low Propr Points'),
    text: `Hi ${firstName},\n\nYour Propr Points balance is running low.\n\nCurrent Balance: ${remaining} Propr Points\n\nTop up your points to continue using property analysis and location search features without interruption.\n\nGet more points: ${creditsUrl}\n\nBest wishes,\nThe ProprScout Team`
  });
};

export default {
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendLoginNotificationEmail,
  sendPaymentConfirmationEmail,
  sendSubscriptionEmail,
  sendLowCreditsEmail
};
