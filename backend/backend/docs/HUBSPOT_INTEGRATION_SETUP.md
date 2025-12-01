# HubSpot + Circle Invite Code Integration Setup

This guide walks you through setting up automatic invite code generation when users join your Circle community.

## Overview

**Flow:**
1. User joins Circle community
2. HubSpot workflow triggers (via Circle-HubSpot integration or Zapier)
3. HubSpot calls ProprScout API to create invite code
4. HubSpot stores the code in a contact property
5. HubSpot sends welcome email with the invite code + referral link
6. User signs up on ProprScout using the code

---

## Step 1: Generate Your API Key

On your server or locally, generate a secure API key:

```bash
openssl rand -base64 32
```

This will output something like: `K7x9mPqR2sT4vW6yA8bC0dE1fG3hJ5kL`

**Save this key** - you'll need it for both ProprScout and HubSpot.

---

## Step 2: Add API Key to ProprScout Backend

### Option A: Edit `.env` file directly

```bash
# In backend/backend/.env add:
INTEGRATION_API_KEY=K7x9mPqR2sT4vW6yA8bC0dE1fG3hJ5kL
```

### Option B: Set via hosting provider (Vercel, Railway, etc.)

Add environment variable:
- **Name:** `INTEGRATION_API_KEY`
- **Value:** `K7x9mPqR2sT4vW6yA8bC0dE1fG3hJ5kL`

**Restart your backend server after adding the key.**

---

## Step 3: Create HubSpot Contact Property

1. Go to HubSpot → **Settings** → **Properties**
2. Click **Create property**
3. Fill in:
   - **Object type:** Contact
   - **Group:** Contact information
   - **Label:** `ProprScout Invite Code`
   - **Internal name:** `proprscout_invite_code`
   - **Field type:** Single-line text
4. Click **Create**

---

## Step 4: Test the API Endpoint

Before setting up HubSpot, test the endpoint works:

```bash
curl -X POST https://your-backend-url.com/api/integrations/hubspot/invite-code \
  -H "Content-Type: application/json" \
  -H "X-API-Key: K7x9mPqR2sT4vW6yA8bC0dE1fG3hJ5kL" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "source": "circle"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "code": "H7XK3NP2",
    "bonusCredits": 5,
    "expiresAt": null,
    "signupUrl": "https://proprscout.com/signup?code=H7XK3NP2",
    "isExisting": false
  }
}
```

---

## Step 5: Create HubSpot Workflow

### 5.1 Create the Workflow

1. Go to HubSpot → **Automation** → **Workflows**
2. Click **Create workflow** → **From scratch**
3. Choose **Contact-based** workflow
4. Name it: `Circle Join - Generate ProprScout Invite Code`

### 5.2 Set Enrollment Trigger

Set the trigger based on how you're tracking Circle signups:

**Option A: If using Circle-HubSpot integration:**
- Property: `circle_member_status` is equal to `active`

**Option B: If using Zapier:**
- Property: `circle_signup` is equal to `true`

**Option C: If using list membership:**
- Contact is added to list: `Circle Community Members`

### 5.3 Add Webhook Action

1. Click **+** to add an action
2. Search for **Webhook** (under "Send data")
3. Configure:

**Method:** POST

**Webhook URL:**
```
https://your-backend-url.com/api/integrations/hubspot/invite-code
```

**Request headers:**
| Header Name | Header Value |
|-------------|--------------|
| Content-Type | application/json |
| X-API-Key | K7x9mPqR2sT4vW6yA8bC0dE1fG3hJ5kL |

**Request body:**
```json
{
  "email": "{{contact.email}}",
  "name": "{{contact.firstname}} {{contact.lastname}}",
  "hubspot_contact_id": "{{contact.hs_object_id}}",
  "source": "circle-hubspot"
}
```

### 5.4 Store the Response (Set Property from Webhook)

After the webhook, add another action:

1. Click **+** → **Set property value**
2. Property: `proprscout_invite_code`
3. Value: Use **webhook response** → `data.code`

> **Note:** If HubSpot doesn't let you use webhook responses directly, you may need to use a custom code action or Operations Hub.

---

## Step 6: Create Welcome Email Template

1. Go to HubSpot → **Marketing** → **Email**
2. Create new email or edit your Circle welcome template
3. Include these personalization tokens:

```html
<h2>Welcome to ProprScout Beta!</h2>

<p>Hi {{contact.firstname}},</p>

<p>Thank you for joining our Circle community! As a member, you get exclusive
early access to ProprScout.</p>

<h3>Your Exclusive Invite Code</h3>
<div style="background: #f0fdf4; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0;">
  <p style="font-size: 32px; font-weight: bold; color: #00d185; letter-spacing: 4px;">
    {{contact.proprscout_invite_code}}
  </p>
</div>

<p>
  <a href="https://proprscout.com/signup?code={{contact.proprscout_invite_code}}"
     style="background: #00d185; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; display: inline-block;">
    Sign Up Now
  </a>
</p>

<hr>

<h3>Share with Friends</h3>
<p>Know someone who would love ProprScout? Share your referral link:</p>
<p>{{contact.referral_link}}</p>
```

### 5.5 Add Email Action to Workflow

1. After setting the property, click **+**
2. Add **Send email** action
3. Select your welcome email template

---

## Step 7: Activate the Workflow

1. Review all steps
2. Click **Review and publish**
3. Turn workflow **On**

---

## API Endpoints Reference

### Create Invite Code
```
POST /api/integrations/hubspot/invite-code
```

**Headers:**
- `Content-Type: application/json`
- `X-API-Key: your-api-key`

**Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "hubspot_contact_id": "123456",
  "source": "circle-hubspot"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "code": "H7XK3NP2",
    "bonusCredits": 5,
    "expiresAt": null,
    "signupUrl": "https://proprscout.com/signup?code=H7XK3NP2",
    "isExisting": false
  }
}
```

---

### Look Up Existing Code
```
GET /api/integrations/hubspot/invite-code/:email
```

**Headers:**
- `X-API-Key: your-api-key`

**Response:**
```json
{
  "success": true,
  "data": {
    "code": "H7XK3NP2",
    "bonusCredits": 5,
    "isUsed": false,
    "signupUrl": "https://proprscout.com/signup?code=H7XK3NP2"
  }
}
```

---

### Bulk Create (for imports)
```
POST /api/integrations/hubspot/bulk-invite-codes
```

**Body:**
```json
{
  "contacts": [
    { "email": "user1@example.com", "name": "User 1" },
    { "email": "user2@example.com", "name": "User 2" }
  ],
  "source": "circle-import"
}
```

---

### Health Check
```
GET /api/integrations/health
```

No API key required. Returns:
```json
{
  "success": true,
  "service": "ProprScout Integrations API",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Troubleshooting

### "Invalid API key" error
- Verify `INTEGRATION_API_KEY` is set in your `.env` file
- Ensure the key in HubSpot webhook matches exactly
- Restart your backend server after adding the key

### "Integration API not configured" error
- The `INTEGRATION_API_KEY` environment variable is not set
- Add it to your server's environment variables

### Webhook not firing
- Check HubSpot workflow is active
- Verify enrollment trigger conditions are met
- Check HubSpot workflow history for errors

### Code not appearing in HubSpot
- Ensure the `proprscout_invite_code` property exists
- Check if the webhook response is being captured correctly
- Look at workflow execution logs

---

## Security Notes

1. **Keep your API key secret** - never commit it to git
2. **Use HTTPS** - all API calls should be over HTTPS
3. **Rotate keys periodically** - generate a new key every few months
4. **Monitor usage** - check logs for unusual activity

---

## Need Help?

- Check backend logs: `backend/backend/logs/combined.log`
- Test endpoint manually with curl
- Contact: support@proprscout.com
