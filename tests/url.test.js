const request = require("supertest");
const app = require("../app");
const Url = require("../models/Url");
const shortid = require("shortid");
const { shortenUrl, getLongUrl } = require("../services/urlService");

// Test suite for the URL Shortener API
describe("URL Shortener API", () => {
  // Before each test, clear the database to avoid duplicate data issues
  beforeEach(async () => {
    await Url.deleteMany({});
  });

  // Test case: Shortening a URL should return a shortened URL and QR code
  it("should shorten a URL and return a QR code", async () => {
    const res = await request(app)
      .post("/api/shorten") // Make a POST request to the shorten endpoint
      .send({ longUrl: "https://example.com" }); // Provide a long URL

    // Ensure the response is successful
    expect(res.statusCode).toEqual(200);

    // Validate that the response contains the expected properties
    expect(res.body).toHaveProperty("shortUrl"); // Check if shortUrl is returned
    expect(res.body).toHaveProperty("qrCode"); // Check if QR code is returned
  });

  // Test case: Accessing a shortened URL should redirect to the original URL
  it("should redirect to the original URL", async () => {
    // Generate a unique short ID for testing
    const shortId = shortid.generate();

    // Save a test URL entry in the database
    const url = new Url({
      longUrl: "https://example.com",
      shortId,
    });
    await url.save();

    // Simulate a GET request to the shortened URL
    const res = await request(app).get(`/api/${shortId}`);

    // Check if the response returns a redirection (HTTP 302)
    expect(res.statusCode).toEqual(302);
  });

  //Test case: check for invalid urls
  it("should return an error for an invalid URL", async () => {
    const res = await request(app)
      .post("/api/shorten")
      .send({ longUrl: "invalid-url" });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("error", "Invalid URL");
  });

  //Edge case: handle non-existent short url
  it("should return 404 for a non-existent short URL", async () => {
    const res = await request(app).get("/api/doesnotexist123");
    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty("error", "URL not found");
  });
});

describe("URL Shortener Service", () => {
  beforeEach(async () => {
    await Url.deleteMany({}); // Clear database before each test
  });

  // unit test: 'shortenUrl' function
  it("should generate a short URL and QR code", async () => {
    const result = await shortenUrl("https://example.com");
    expect(result).toHaveProperty("shortUrl");
    expect(result).toHaveProperty("qrCode");
  });

  //Unit Test: `getLongUrl` Function
  it("should retrieve the original URL using short ID", async () => {
    const shortId = "abc123";
    await new Url({ longUrl: "https://example.com", shortId }).save();

    const originalUrl = await getLongUrl(shortId);
    expect(originalUrl).toBe("https://example.com");
  });

  //Edge Case: Handle Retrieval of a Non-Existent Short ID
  it("should throw an error for a non-existent short ID", async () => {
    await expect(getLongUrl("nonexistent123")).rejects.toThrow("URL not found");
  });

  // test case: shorten url with a custom alias and expiration date
  it("should shorten a URL with a custom alias and expiration", async () => {
    const res = await request(app).post("/api/shorten").send({
      longUrl: "https://example.com",
      customAlias: "custom123",
      expiration: "1d",
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("shortUrl");
    expect(res.body).toHaveProperty("qrCode");
  });
});
