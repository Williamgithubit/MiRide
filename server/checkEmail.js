import db from "./models/index.js";
import dotenv from "dotenv";

dotenv.config();

async function checkEmail() {
  try {
    await db.sequelize.authenticate();

    // Find the William user
    const user = await db.User.findOne({
      where: { name: "William T Johnson Jr" },
      raw: true,
    });

    if (user) {
      console.log("\n" + "=".repeat(60));
      console.log("👤 USER FOUND");
      console.log("=".repeat(60));
      console.log("Name:", user.name);
      console.log("\n📧 EMAIL IN DATABASE:");
      console.log("   ", user.email);
      console.log("\n📧 EMAIL USER TRIED TO LOGIN WITH:");
      console.log("   ", "william.tealo.johnsonjr@gmail.com");
      console.log("\n⚠️  EMAIL MISMATCH:");
      console.log("   Database:", user.email);
      console.log("   User typed:", "william.tealo.johnsonjr@gmail.com");
      console.log(
        "   Match?",
        user.email === "william.tealo.johnsonjr@gmail.com" ? "✅ YES" : "❌ NO"
      );
      console.log("\n🔧 SOLUTION:");
      if (user.email === "william.tealo.johnsonjr@gmail.com") {
        console.log("   ✅ Emails match - Login should work now");
      } else {
        console.log("   ❌ Emails do NOT match");
        console.log("   Need to update database email to:");
        console.log("      william.tealo.johnsonjr@gmail.com");
      }
      console.log("=".repeat(60) + "\n");
    } else {
      console.log("❌ User not found");
    }

    await db.sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

checkEmail();
