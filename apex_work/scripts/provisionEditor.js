import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../src/models/User.js";
dotenv.config();

async function main() {
  const email = (process.argv[2] || "").trim().toLowerCase();
  const role = process.argv[3] || "content_editor";
  const apply = process.argv.includes("--apply");
  const allowed = (process.env.CONTENT_EDITOR_EMAILS || "").split(",").map(x => x.trim().toLowerCase()).filter(Boolean);
  if (!email || !allowed.includes(email)) throw new Error("Specify an existing email listed in CONTENT_EDITOR_EMAILS.");
  if (!["content_editor", "admin"].includes(role)) throw new Error("Role must be content_editor or admin.");
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing.");
  await mongoose.connect(process.env.MONGODB_URI);
  const user = await User.findOne({ email });
  if (!user) throw new Error("Account not found. Register first and confirm you control the account.");
  console.log(`Database: ${mongoose.connection.name}; account: ${user.email}; current role: ${user.role}; requested role: ${role}`);
  if (!apply) { console.log("Preview only. Add --apply to grant access after confirming account ownership."); return; }
  if (user.role === role) { console.log("Role already assigned."); return; }
  const result = await User.updateOne({ _id: user._id, role: user.role }, { $set: { role }, $inc: { tokenVersion: 1 } });
  if (result.modifiedCount !== 1) throw new Error("Account changed concurrently; retry after reviewing.");
  console.log("Role assigned. Existing sessions revoked. Sign in again.");
}
try { await main(); } catch (error) { console.error(error.message); process.exitCode = 1; } finally { await mongoose.disconnect(); }
