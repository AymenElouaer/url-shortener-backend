const shortid = require("shortid"); // Generates unique short IDs
const validUrl = require("valid-url"); // Validates URLs
const Url = require("../models/Url"); // Database model
const qrcode = require("qrcode"); // Generates QR codes

// Shorten a URL
const shortenUrl = async (longUrl, customAlias = "", expiration = "") => {
  // Validate the input URL
  if (!validUrl.isUri(longUrl)) {
    throw new Error("Invalid URL");
  }

  // Check if the URL already exists in the database
  let url = await Url.findOne({ longUrl });
  if (url) {
    return {
      shortUrl: `https://url-shortener-backend-20d1.onrender.com/api/${url.shortId}`,
      qrCode: url.qrCode,
    }; // Return the existing short URL if found and the qrcode
  }

  // Use custom alias if provided, otherwise generate a short ID
  const shortId = customAlias || shortid.generate();
  const shortUrl = `https://url-shortener-backend-20d1.onrender.com/api/${shortId}`;

  // Check if the shortId or customAlias already exists
  const existingUrl = await Url.findOne({
    $or: [{ shortId }, { customAlias }],
  });
  if (existingUrl) {
    throw new Error("Custom alias or short ID already in use");
  }

  // Calculate expiration time
  let expiresAt;
  if (expiration === "1h") {
    expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  } else if (expiration === "1d") {
    expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
  } else if (expiration === "1w") {
    expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 week
  }

  // Generate QR code
  const qrCode = await qrcode.toDataURL(shortUrl);

  // Save the new URL to the database
  url = new Url({ longUrl, shortId, qrCode });
  await url.save();

  return { shortUrl, qrCode }; // Return the short URL and QR code
};

// Retrieve the original URL using the short ID
const getLongUrl = async (shortId) => {
  const url = await Url.findOne({ shortId });
  if (!url) {
    throw new Error("URL not found");
  }

  // Check if the URL has expired
  if (url.expiresAt && new Date() > url.expiresAt) {
    throw new Error("This URL has expired");
  }
  return url.longUrl;
};

module.exports = { shortenUrl, getLongUrl };
