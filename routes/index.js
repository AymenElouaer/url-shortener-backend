const express = require("express");
const urlController = require("../controllers/urlController");

const router = express.Router();

// POST /shorten
router.post("/shorten", urlController.shortenUrl);

// GET /:shortId
router.get("/:shortId", urlController.redirectUrl);

module.exports = router;
