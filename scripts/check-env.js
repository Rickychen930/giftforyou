#!/usr/bin/env node
/**
 * Check environment variables configuration
 * Usage: node scripts/check-env.js
 */

const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");

function readEnvFile(filename) {
  const filePath = path.join(rootDir, filename);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  const content = fs.readFileSync(filePath, "utf-8");
  const vars = {};
  
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        vars[key] = value;
      }
    }
  });
  
  return vars;
}

function maskValue(value) {
  if (!value || value.length === 0) return "❌ not set";
  if (value.length <= 8) return "***";
  return value.substring(0, 4) + "***" + value.substring(value.length - 4);
}

console.log("🔍 Environment Variables Check\n");
console.log("=" .repeat(60));

// Check .env.development
console.log("\n📁 .env.development (Development):");
const devEnv = readEnvFile(".env.development");
if (devEnv) {
  const serverVars = ["NODE_ENV", "PORT", "MONGO_URI", "JWT_SECRET", "ALLOW_PUBLIC_REGISTRATION", "CORS_ORIGIN"];
  const clientVars = Object.keys(devEnv).filter((k) => k.startsWith("REACT_APP_"));
  
  console.log("\n  Server-side:");
  serverVars.forEach((key) => {
    const value = devEnv[key];
    const status = value ? "✅" : "❌";
    console.log(`    ${status} ${key}: ${value ? maskValue(value) : "not set"}`);
  });
  
  console.log("\n  Client-side (REACT_APP_*):");
  if (clientVars.length > 0) {
    clientVars.forEach((key) => {
      const value = devEnv[key];
      console.log(`    ✅ ${key}: ${maskValue(value)}`);
    });
  } else {
    console.log("    ❌ No REACT_APP_* variables found");
  }
} else {
  console.log("  ❌ File not found");
}

// Check .env
console.log("\n📁 .env (Production):");
const prodEnv = readEnvFile(".env");
if (prodEnv) {
  const serverVars = ["NODE_ENV", "PORT", "MONGO_URI", "JWT_SECRET", "ALLOW_PUBLIC_REGISTRATION", "CORS_ORIGIN"];
  const clientVars = Object.keys(prodEnv).filter((k) => k.startsWith("REACT_APP_"));
  
  console.log("\n  Server-side:");
  serverVars.forEach((key) => {
    const value = prodEnv[key];
    const status = value ? "✅" : "❌";
    console.log(`    ${status} ${key}: ${value ? maskValue(value) : "not set"}`);
  });
  
  console.log("\n  Client-side (REACT_APP_*):");
  if (clientVars.length > 0) {
    clientVars.forEach((key) => {
      const value = prodEnv[key];
      console.log(`    ✅ ${key}: ${maskValue(value)}`);
    });
  } else {
    console.log("    ❌ No REACT_APP_* variables found");
  }
} else {
  console.log("  ❌ File not found");
}

// Recommendations
console.log("\n" + "=".repeat(60));
console.log("\n💡 Recommendations:");

if (devEnv) {
  if (!devEnv.ALLOW_PUBLIC_REGISTRATION || devEnv.ALLOW_PUBLIC_REGISTRATION !== "true") {
    console.log("  ⚠️  ALLOW_PUBLIC_REGISTRATION is not set to 'true' in .env.development");
    console.log("     Registration will be disabled. Set to 'true' to enable.");
  }
  
  if (!devEnv.REACT_APP_GOOGLE_CLIENT_ID) {
    console.log("  ⚠️  REACT_APP_GOOGLE_CLIENT_ID is not set in .env.development");
    console.log("     Google Sign-In will not be available.");
  }
}

console.log("\n📝 To update environment variables:");
console.log("  1. Edit .env.development (for development) or .env (for production)");
console.log("  2. Restart the server: npm run dev:server");
console.log("  3. Restart React dev server: npm start");
console.log("\n📚 See ENV-SETUP.md for detailed documentation\n");

