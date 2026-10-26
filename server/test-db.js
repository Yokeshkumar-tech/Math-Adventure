// server/test-db.js
import mongoose from "mongoose";
import "dotenv/config";

const rawUri = process.argv[2] || process.env.MONGODB_URI;

if (!rawUri) {
  console.error("\n❌ Error: No MongoDB connection string provided.");
  console.log("Usage: node test-db.js \"mongodb+srv://<username>:<password>@cluster0.mongodb.net/mathadventure\"");
  console.log("Or set MONGODB_URI in server/.env\n");
  process.exit(1);
}

const masked = rawUri.replace(/:([^@]+)@/, ":****@");
console.log(`\n🔍 Testing MongoDB Atlas Connection...`);
console.log(`Target: ${masked}`);

async function run() {
  try {
    const startTime = Date.now();
    await mongoose.connect(rawUri, {
      serverSelectionTimeoutMS: 10000,
    });
    const duration = Date.now() - startTime;

    console.log(`\n✅ MongoDB Atlas Connected Successfully! (${duration}ms)`);
    console.log(`Database Name: "${mongoose.connection.name}"`);
    console.log(`Host: ${mongoose.connection.host}`);

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`\nExisting Collections (${collections.length}):`);
    if (collections.length === 0) {
      console.log("  ⚠️  Database is currently empty. Run seed command to populate initial game data:");
      console.log("  npm run seed");
    } else {
      for (const col of collections) {
        const count = await mongoose.connection.db.collection(col.name).countDocuments();
        console.log(`  - ${col.name}: ${count} document(s)`);
      }
    }

    console.log("\n🚀 Database connection is ready for deployment!\n");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(`\n❌ Connection Failed: ${err.message}\n`);

    if (err.message.includes("bad auth") || err.message.includes("Authentication failed")) {
      console.log("👉 Cause: Incorrect MongoDB Atlas username or password.");
      console.log("   Check: In MongoDB Atlas -> Database Access -> ensure user exists and password is correct.");
      console.log("   Note: If your password has special characters like @, #, %, use URL encoding (e.g. %40 for @).");
    } else if (err.message.includes("Server selection timed out") || err.message.includes("ETIMEDOUT") || err.message.includes("querySrv")) {
      console.log("👉 Cause: Network timeout / IP Whitelist issue.");
      console.log("   Check: In MongoDB Atlas -> Network Access -> Add IP Address -> Select 'Allow Access From Anywhere' (0.0.0.0/0).");
    }

    process.exit(1);
  }
}

run();
