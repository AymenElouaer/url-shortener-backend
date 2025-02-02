const urlService = require("../services/urlService");

// Handle POST /shorten
const shortenUrl = async (req, res) => {
  try {
    const { longUrl, customAlias, expiration } = req.body;
    const { shortUrl, qrCode } = await urlService.shortenUrl(
      longUrl,
      customAlias,
      expiration
    );
    res.json({ shortUrl, qrCode }); // Return the short URL and QR code
  } catch (err) {
    res.status(400).json({ error: err.message }); // Handle errors
  }
};

// Handle GET /:shortId
const redirectUrl = async (req, res) => {
  try {
    const { shortId } = req.params;
    const longUrl = await urlService.getLongUrl(shortId);
    res.redirect(longUrl); // Redirect to the original URL
  } catch (err) {
    res.status(404).json({ error: err.message }); // Handle errors
  }
};

module.exports = { shortenUrl, redirectUrl };
