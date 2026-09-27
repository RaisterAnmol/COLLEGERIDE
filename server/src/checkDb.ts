import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from server/.env
dotenv.config({ path: path.resolve(__dirname, "../.env") });

function sanitizeMongoUri(raw: string): string {
  let u = raw.trim().replace(/<([^>]+)>/g, '$1').replace(/=+$/, '');
  if (/mongodb(\+srv)?:\/\/[^\/]+\/?/i.test(u)) {
    u = u.replace(/\/(\?)/, '/campusride$1');
  } else if (/mongodb(\+srv)?:\/\/[^\/\?]+$/i.test(u)) {
    u = u + '/campusride';
  }
  return u;
}

async function checkDatabase() {
  const rawUri = process.env.MONGODB_URI;

  if (!rawUri) {
    console.error("❌ MONGODB_URI is not set in server/.env");
    process.exit(1);
  }

  const uri = sanitizeMongoUri(rawUri);

  console.log("\n=======================================================");
  console.log(" 🔍 CampusRide — MongoDB Cloud Database Inspection");
  console.log("=======================================================\n");

  try {
    const masked = uri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@.+)/i, '$1******$3');
    console.log(`Connecting to: ${masked}...`);

    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    const db = mongoose.connection.db;

    if (!db) {
      console.error("❌ Failed to access database instance.");
      process.exit(1);
    }

    console.log(`✅ Connected successfully to database: "${mongoose.connection.name}"\n`);

    // List all collections
    const collections = await db.listCollections().toArray();
    console.log("📁 Collections in database:");
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`   - ${col.name.padEnd(24)}: ${count} documents`);
    }

    // Display Registered Users
    const usersCol = db.collection("users");
    const totalUsers = await usersCol.countDocuments();
    console.log(`\n👥 Users Table (${totalUsers} total registered accounts):`);
    console.log("------------------------------------------------------------------------------------------------------------------");
    console.log(
      ` ${"NAME".padEnd(20)} | ${"EMAIL".padEnd(28)} | ${"ROLE".padEnd(12)} | ${"COLLEGE".padEnd(24)} | ${"STATUS".padEnd(10)}`
    );
    console.log("------------------------------------------------------------------------------------------------------------------");

    const users = await usersCol
      .find({})
      .sort({ createdAt: -1 })
      .project({ name: 1, email: 1, role: 1, accountType: 1, college: 1, verificationStatus: 1 })
      .toArray();

    for (const u of users) {
      const name = String(u.name || "").slice(0, 19).padEnd(20);
      const email = String(u.email || "").slice(0, 27).padEnd(28);
      const role = String(u.accountType || u.role || "").slice(0, 11).padEnd(12);
      const college = String(u.college || "N/A").slice(0, 23).padEnd(24);
      const status = String(u.verificationStatus || "unverified").slice(0, 9).padEnd(10);
      console.log(` ${name} | ${email} | ${role} | ${college} | ${status}`);
    }
    console.log("------------------------------------------------------------------------------------------------------------------\n");

    await mongoose.disconnect();
    console.log("✅ Inspection complete.\n");
    process.exit(0);
  } catch (err: any) {
    console.error("❌ Error connecting to MongoDB:", err.message);
    process.exit(1);
  }
}

checkDatabase();
