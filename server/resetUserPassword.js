import db from "./models/index.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import readline from "readline";

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (prompt) => {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
};

async function resetUserPassword() {
  try {
    console.log("\n" + "=".repeat(60));
    console.log("🔐 PASSWORD RESET TOOL");
    console.log("=".repeat(60) + "\n");

    // Get email
    const email = await question("Enter user email: ");
    if (!email) {
      console.log("❌ Email is required");
      process.exit(1);
    }

    // Get new password
    const newPassword = await question("Enter new password (min 8 chars): ");
    if (!newPassword || newPassword.length < 8) {
      console.log("❌ Password must be at least 8 characters");
      process.exit(1);
    }

    // Confirm password
    const confirmPassword = await question("Confirm password: ");
    if (newPassword !== confirmPassword) {
      console.log("❌ Passwords do not match");
      process.exit(1);
    }

    console.log("\n🔍 Searching for user...");

    // Find user
    const user = await db.User.findOne({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      console.log("❌ User not found: " + email);
      process.exit(1);
    }

    console.log("✅ User found:");
    console.log("   Name:", user.name);
    console.log("   Email:", user.email);
    console.log("   Role:", user.role);
    console.log("   Active:", user.isActive);

    console.log("\n🔐 Hashing new password...");

    // Update password (will be hashed by model hook)
    await user.update({ password: newPassword });

    console.log("✅ Password updated successfully!\n");
    console.log("New credentials:");
    console.log("  Email:", user.email);
    console.log("  Password:", newPassword);
    console.log("\nUser can now login with the new password.\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ ERROR:", error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    rl.close();
  }
}

resetUserPassword();
