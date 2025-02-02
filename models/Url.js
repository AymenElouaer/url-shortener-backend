const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema({
  longUrl: { type: String, required: true },
  shortId: { type: String, required: true, unique: true },
  qrCode: { type: String },
  createdAt: { type: Date, default: Date.now },
  customAlias: { type: String, unique: true, sparse: true }, // Optional custom alias
  expiresAt: { type: Date }, // Optional expiration date
});

module.exports = mongoose.model("Url", urlSchema);
