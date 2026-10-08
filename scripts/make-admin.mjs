/**
 * Promote an existing user to admin.
 *
 *   node scripts/make-admin.mjs someone@example.com
 *
 * Registration always creates a "customer", so the first administrator has to
 * be promoted here. Reads MONGODB_URI from .env.local.
 */
import fs from "node:fs";
import path from "node:path";

import mongoose from "mongoose";

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
  console.error("Usage: node scripts/make-admin.mjs <email>");
  process.exit(1);
}

function readEnv() {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;

  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return null;

  const match = fs
    .readFileSync(envPath, "utf8")
    .match(/^\s*MONGODB_URI\s*=\s*(.+)\s*$/m);

  return match ? match[1].trim().replace(/^["']|["']$/g, "") : null;
}

const uri = readEnv();

if (!uri) {
  console.error("MONGODB_URI not found in the environment or .env.local");
  process.exit(1);
}

await mongoose.connect(uri);

const users = mongoose.connection.db.collection("users");
const user = await users.findOne({ email });

if (!user) {
  console.error(`No account found for ${email}. Register on the site first.`);
  await mongoose.disconnect();
  process.exit(1);
}

if (user.role === "admin") {
  console.log(`${email} is already an admin.`);
} else {
  await users.updateOne({ _id: user._id }, { $set: { role: "admin" } });
  console.log(`${email} is now an admin. Sign out and back in to pick it up.`);
}

await mongoose.disconnect();
