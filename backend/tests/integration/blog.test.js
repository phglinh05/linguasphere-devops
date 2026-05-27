const request = require("supertest");

jest.mock("mongoose", () => {
  const actual = jest.requireActual("mongoose");
  return { ...actual, connect: jest.fn().mockResolvedValue(true) };
});
jest.mock("../../src/models/User");
jest.mock("../../src/models/Blog", () => ({
  seedIfEmpty: jest.fn(),
  Post: {},
  Category: {},
  Subscriber: {},
  getHero: jest.fn(),
  getCategories: jest.fn(),
  getRelated: jest.fn(),
  getMarketing: jest.fn(),
  subscribe: jest.fn(),
}));

const Blog = require("../../src/models/Blog");
const { createApp } = require("../../app");

let app;

beforeAll(() => {
  process.env.JWT_SECRET = "test_secret";
  app = createApp();
});

afterEach(() => jest.clearAllMocks());

// ═══════════════════════════════════════════════════════
// GET /api/health
// ═══════════════════════════════════════════════════════
describe("Integration Test — GET /api/health", () => {

  test("200 — Returns {ok: true}", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});

// ═══════════════════════════════════════════════════════
// GET /api/posts/hero
// ═══════════════════════════════════════════════════════
describe("Integration Test — GET /api/posts/hero", () => {

  const heroPost = {
    type: "blog", slug: "hero-post",
    title: "Hero Post Title", excerpt: "Excerpt here",
    hero_image_url: "https://picsum.photos/1600/900",
    author: { name: "Author", avatar_url: "" }, views: 10000,
  };

  test("200 — Returns the hero post with all expected fields", async () => {
    Blog.getHero.mockResolvedValue(heroPost);
    const res = await request(app).get("/api/posts/hero");
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Hero Post Title");
    expect(res.body.type).toBe("blog");
    expect(res.body).toHaveProperty("hero_image_url");
    expect(res.body).toHaveProperty("author");
  });

  test("404 — No hero post exists in DB", async () => {
    Blog.getHero.mockResolvedValue(null);
    const res = await request(app).get("/api/posts/hero");
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("No hero post");
  });

  test("500 — Database error returns 500", async () => {
    Blog.getHero.mockRejectedValue(new Error("DB error"));
    const res = await request(app).get("/api/posts/hero");
    expect(res.status).toBe(500);
  });
});

// ═══════════════════════════════════════════════════════
// GET /api/categories/reading
// ═══════════════════════════════════════════════════════
describe("Integration Test — GET /api/categories/reading", () => {

  const categories = [
    { name: "DevSecOps", slug: "devsecops", cover_image_url: "https://picsum.photos/100" },
    { name: "Cloud & AWS", slug: "cloud-aws", cover_image_url: "https://picsum.photos/101" },
    { name: "Kubernetes", slug: "kubernetes", cover_image_url: "https://picsum.photos/102" },
  ];

  test("200 — Returns categories as an array", async () => {
    Blog.getCategories.mockResolvedValue(categories);
    const res = await request(app).get("/api/categories/reading");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(3);
  });

  test("Each category has name, slug, cover_image_url", async () => {
    Blog.getCategories.mockResolvedValue(categories);
    const res = await request(app).get("/api/categories/reading");
    expect(res.body[0]).toHaveProperty("name");
    expect(res.body[0]).toHaveProperty("slug");
    expect(res.body[0]).toHaveProperty("cover_image_url");
  });

  test("200 — Returns empty array when there are no categories", async () => {
    Blog.getCategories.mockResolvedValue([]);
    const res = await request(app).get("/api/categories/reading");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════
// GET /api/posts/related
// ═══════════════════════════════════════════════════════
describe("Integration Test — GET /api/posts/related", () => {

  const makePosts = (n) => Array.from({ length: n }, (_, i) => ({
    type: "blog", slug: `post-${i}`, title: `Post ${i}`,
    author: { name: "Author" },
  }));

  test("200 — Returns items and meta pagination with default values", async () => {
    Blog.getRelated.mockResolvedValue({ items: makePosts(4), meta: { page: 0, page_size: 4, total: 5 } });
    const res = await request(app).get("/api/posts/related");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("items");
    expect(res.body).toHaveProperty("meta");
    expect(Array.isArray(res.body.items)).toBe(true);
  });

  test("Passes correct page and page_size to controller", async () => {
    Blog.getRelated.mockResolvedValue({ items: makePosts(2), meta: { page: 1, page_size: 2, total: 10 } });
    const res = await request(app).get("/api/posts/related?page=1&page_size=2");
    expect(res.status).toBe(200);
    // Ensure blogMiddleware parsed and passed values into controller
    expect(Blog.getRelated).toHaveBeenCalledWith(1, 2);
  });

  test("page_size is capped at 12 by blogMiddleware", async () => {
    Blog.getRelated.mockResolvedValue({ items: [], meta: { page: 0, page_size: 12, total: 0 } });
    await request(app).get("/api/posts/related?page_size=999");
    expect(Blog.getRelated).toHaveBeenCalledWith(0, 12);
  });

  test("negative page is clamped to 0 by blogMiddleware", async () => {
    Blog.getRelated.mockResolvedValue({ items: [], meta: { page: 0, page_size: 4, total: 0 } });
    await request(app).get("/api/posts/related?page=-10");
    expect(Blog.getRelated).toHaveBeenCalledWith(0, 4);
  });
});

// ═══════════════════════════════════════════════════════
// GET /api/posts/marketing
// ═══════════════════════════════════════════════════════
describe("Integration Test — GET /api/posts/marketing", () => {

  const courses = [
    { type: "marketing", slug: "aws-cert", title: "AWS Certified", price_cents: 8900, reading_minutes: 35 },
    { type: "marketing", slug: "k8s-course", title: "Kubernetes DevOps", price_cents: 9900, reading_minutes: 42 },
  ];

  test("200 — Returns marketing courses list", async () => {
    Blog.getMarketing.mockResolvedValue({ items: courses, meta: { page: 0, page_size: 4, total: 2 } });
    const res = await request(app).get("/api/posts/marketing");
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBe(2);
  });

  test("Each course has price_cents and reading_minutes", async () => {
    Blog.getMarketing.mockResolvedValue({ items: courses, meta: {} });
    const res = await request(app).get("/api/posts/marketing");
    const course = res.body.items[0];
    expect(course).toHaveProperty("price_cents");
    expect(course).toHaveProperty("reading_minutes");
  });
});

// ═══════════════════════════════════════════════════════
// POST /api/newsletter/subscribe
// ═══════════════════════════════════════════════════════
describe("Integration Test — POST /api/newsletter/subscribe", () => {

  test("200 — Subscribes a valid email the first time", async () => {
    Blog.subscribe.mockResolvedValue({ ok: true, message: "Subscribed successfully!" });
    const res = await request(app)
      .post("/api/newsletter/subscribe")
      .send({ email: "user@example.com" });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.message).toBe("Subscribed successfully!");
  });

  test("200 — Existing email returns already-subscribed message", async () => {
    Blog.subscribe.mockResolvedValue({ ok: true, message: "This email is already subscribed." });
    const res = await request(app)
      .post("/api/newsletter/subscribe")
      .send({ email: "dup@example.com" });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("This email is already subscribed.");
  });

  test("400 — Email without '@' is blocked by validateEmail middleware", async () => {
    const res = await request(app)
      .post("/api/newsletter/subscribe")
      .send({ email: "notanemail" });
    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(Blog.subscribe).not.toHaveBeenCalled(); // middleware blocks before controller
  });

  test("400 — Missing email in request body", async () => {
    const res = await request(app)
      .post("/api/newsletter/subscribe")
      .send({});
    expect(res.status).toBe(400);
    expect(Blog.subscribe).not.toHaveBeenCalled();
  });

  test("Controller receives email already lowercased and trimmed", async () => {
    Blog.subscribe.mockResolvedValue({ ok: true, message: "Subscribed successfully!" });
    await request(app)
      .post("/api/newsletter/subscribe")
      .send({ email: "  USER@EXAMPLE.COM  " });
    expect(Blog.subscribe).toHaveBeenCalledWith("user@example.com");
  });
});