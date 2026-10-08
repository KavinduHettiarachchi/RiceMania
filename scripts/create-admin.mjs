/**
 * Create (or update) an admin account directly in the database.
 *
 *   node scripts/create-admin.mjs <email> <password> [name]
 *
 * Registration through the site always creates a "customer", so the first
 * administrator is made here. If the email already exists, the password is
 * reset and the role promoted to admin. Reads MONGODB_URI from .env.local.
 */
import fs from "node:fs";
import path from "node:path";

import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const [email, password, ...nameParts] = process.argv.slice(2);
const name = nameParts.join(" ") || "Administrator";

if (!email || !password) {
  console.error("Usage: node scripts/create-admin.mjs <email> <password> [name]");
  process.exit(1);
}

function readMongoUri() {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;

  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return null;

  const match = fs
    .readFileSync(envPath, "utf8")
    .match(/^\s*MONGODB_URI\s*=\s*(.+)\s*$/m);

  return match ? match[1].trim().replace(/^["']|["']$/g, "") : null;
}

const uri = readMongoUri();

if (!uri) {
  console.error("MONGODB_URI not found in the environment or .env.local");
  process.exit(1);
}

await mongoose.connect(uri);

const users = mongoose.connection.db.collection("users");
const normalisedEmail = email.trim().toLowerCase();

// Same cost factor the register route uses, so the login route can verify it.
const hashed = await bcrypt.hash(password, 10);
const now = new Date();

const existing = await users.findOne({ email: normalisedEmail });

if (existing) {
  await users.updateOne(
    { _id: existing._id },
    { $set: { password: hashed, role: "admin", updatedAt: now } }
  );
  console.log(`Updated ${normalisedEmail} — password reset, role set to admin.`);
} else {
  await users.insertOne({
    name,
    email: normalisedEmail,
    password: hashed,
    role: "admin",
    createdAt: now,
    updatedAt: now,
    __v: 0,
  });
  console.log(`Created admin ${normalisedEmail}.`);
}

await mongoose.disconnect();
