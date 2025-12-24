import db from "./models/index.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

console.log("=".repeat(60));
console.log("🔍 USER LOGIN DIAGNOSTIC TEST");
console.log("=".repeat(60));

const testEmail = "williamtealojohnsonjr@gmail.com";
const testPassword = "password@123456"; // Update this with actual password

async function runDiagnostics() {
  try {
    console.log("\n1️⃣ Database Connection Check");
    console.log("-".repeat(60));

    // Test database connection
    await db.sequelize.authenticate();
    console.log("✅ Database connection successful");

    console.log("\n2️⃣ Checking User Model");
    console.log("-".repeat(60));

    // Check if User model exists
    if (db.User) {
      console.log("✅ User model is available");
    } else {
      console.log("❌ User model is NOT available");
      process.exit(1);
    }

    console.log("\n3️⃣ Looking up User by Email");
    console.log("-".repeat(60));
    console.log("Search email:", testEmail);
    console.log("Normalized email:", testEmail.trim().toLowerCase());

    // Try to find user
    const user = await db.User.findOne({
      where: { email: testEmail.trim().toLowerCase() },
      raw: false,
    });

    if (!user) {
      console.log("❌ User NOT found in database");
      console.log("\n   Troubleshooting:");
      console.log("   • Check if user exists in public.users table");
      console.log("   • Verify email is stored as:", testEmail.toLowerCase());
      console.log("   • Try raw SQL query to see all users\n");

      // Try to show all users
      console.log("   All users in database:");
      const allUsers = await db.User.findAll({ raw: true });
      allUsers.forEach((u, i) => {
        console.log(`   ${i + 1}. ${u.email} (ID: ${u.id})`);
      });
    } else {
      console.log("✅ User found!");
      console.log("   ID:", user.id);
      console.log("   Name:", user.name);
      console.log("   Email:", user.email);
      console.log("   Role:", user.role);
      console.log("   Is Active:", user.isActive);
      console.log("   Password hash exists:", !!user.password);

      console.log("\n4️⃣ Testing Password Validation");
      console.log("-".repeat(60));
      console.log("Test password:", testPassword);

      // Test password comparison
      if (!testPassword) {
        console.log(
          "❌ No test password provided. Update testPassword in this script."
        );
      } else {
        try {
          const isMatch = await bcrypt.compare(testPassword, user.password);
          if (isMatch) {
            console.log("✅ Password is CORRECT");
          } else {
            console.log("❌ Password is INCORRECT");
            console.log("\n   Troubleshooting:");
            console.log(
              "   • The password hash in database does not match provided password"
            );
            console.log(
              "   • Recent password resets may have changed the hash"
            );
            console.log("   • Use admin dashboard to reset password again");
          }
        } catch (err) {
          console.log("❌ Error during password comparison:", err.message);
        }
      }

      console.log("\n5️⃣ Testing User Method");
      console.log("-".repeat(60));

      // Check if validPassword method exists
      if (typeof user.validPassword === "function") {
        console.log("✅ validPassword method exists");
        try {
          const isValid = await user.validPassword(testPassword);
          console.log("   validPassword result:", isValid);
        } catch (err) {
          console.log("❌ Error calling validPassword:", err.message);
        }
      } else {
        console.log(
          "⚠️  validPassword method not available (using bcrypt fallback)"
        );
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ DIAGNOSTIC COMPLETE");
    console.log("=".repeat(60) + "\n");
  } catch (error) {
    console.error("\n❌ DIAGNOSTIC ERROR");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
  } finally {
    await db.sequelize.close();
    process.exit(0);
  }
}

runDiagnostics();
