/**
 * Setup script for creating initial admin user and invite codes
 * Run: node scripts/setup-admin.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/proprscout';

async function setup() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!');

    // Define schemas inline (we can't import from models due to ES modules)
    const inviteCodeSchema = new mongoose.Schema({
      code: { type: String, required: true, unique: true },
      name: String,
      description: String,
      maxUses: { type: Number, default: 1 },
      currentUses: { type: Number, default: 0 },
      bonusCredits: { type: Number, default: 5 },
      isActive: { type: Boolean, default: true },
      type: { type: String, default: 'beta' },
      grantsTier: String,
      expiresAt: Date,
      usedBy: Array,
      createdBy: mongoose.Schema.Types.ObjectId,
      created_at: { type: Date, default: Date.now }
    });

    let InviteCode;
    try {
      InviteCode = mongoose.model('InviteCode');
    } catch {
      InviteCode = mongoose.model('InviteCode', inviteCodeSchema);
    }

    // Create founder invite code
    const existingCode = await InviteCode.findOne({ code: 'FOUNDER2024' });
    if (!existingCode) {
      const founderCode = await InviteCode.create({
        code: 'FOUNDER2024',
        name: 'Founding Partner Access',
        description: 'Exclusive access for founding partners',
        maxUses: 100,
        currentUses: 0,
        bonusCredits: 20,
        isActive: true,
        type: 'founder',
        grantsTier: 'pro',
        created_at: new Date()
      });
      console.log('Created FOUNDER2024 invite code');
    } else {
      console.log('FOUNDER2024 already exists');
    }

    // Create beta invite code
    const betaCode = await InviteCode.findOne({ code: 'BETA2024' });
    if (!betaCode) {
      await InviteCode.create({
        code: 'BETA2024',
        name: 'Beta Tester Access',
        description: 'Early access for beta testers',
        maxUses: 500,
        currentUses: 0,
        bonusCredits: 10,
        isActive: true,
        type: 'beta',
        created_at: new Date()
      });
      console.log('Created BETA2024 invite code');
    } else {
      console.log('BETA2024 already exists');
    }

    // Update existing test user to admin (if exists)
    const result = await mongoose.connection.db.collection('users').updateOne(
      { email: 'test@example.com' },
      { $set: { isAdmin: true } }
    );
    if (result.modifiedCount > 0) {
      console.log('Updated test@example.com to admin');
    } else {
      console.log('No user found with test@example.com or already admin');
    }

    console.log('\n=== Setup Complete ===');
    console.log('Invite Codes:');
    console.log('  FOUNDER2024 - For founding partners (100 uses, +20 credits, Pro tier)');
    console.log('  BETA2024 - For beta testers (500 uses, +10 credits)');
    console.log('\nAdmin user: test@example.com');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

setup();
