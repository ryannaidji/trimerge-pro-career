// Create (or promote) an administrator account. Admins cannot self-register.
// Usage:
//   local:  ADMIN_EMAIL=you@x.com ADMIN_PASSWORD='...' npm run create-admin
//   Docker: docker compose exec -e ADMIN_EMAIL=you@x.com -e ADMIN_PASSWORD='...' api node dist/scripts/create-admin.js
// Author: Ryan Naidji
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { env } from '../config/env';
import { connectDB } from '../lib/db';
import { UserModel } from '../modules/users/user.model';

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required');
  }
  if (password.length < 12) {
    throw new Error('ADMIN_PASSWORD must be at least 12 characters');
  }

  await connectDB(env.MONGODB_URI);
  const passwordHash = await bcrypt.hash(password, Number(env.BCRYPT_ROUNDS));

  const user = await UserModel.findOneAndUpdate(
    { email },
    {
      $set: {
        passwordHash,
        accountType: 'ADMIN',
        isVerified: true,
        status: 'ACTIVE',
        onboardingCompleted: true,
      },
      $setOnInsert: { email, profile: { firstName: 'Platform', lastName: 'Admin' } },
    },
    { upsert: true, new: true }
  );

  console.log(`Admin account ready: ${user.email}`);
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
