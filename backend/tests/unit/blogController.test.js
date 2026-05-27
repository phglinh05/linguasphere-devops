jest.mock("../../src/models/Blog");
const Blog = require("../../src/models/Blog");
const blogController = require("../../src/controllers/blogController");

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

// ═══════════════════════════════════════════════════════
// health
// ═══════════════════════════════════════════════════════
describe("Unit Test — blogController.health", () => {
  test("Returns { ok: true }", () => {
    const req = {};
    const res = mockRes();
    blogController.health(req, res);
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });
});

// ═══════════════════════════════════════════════════════
// hero
// ═══════════════════════════════════════════════════════
describe("Unit Test — blogController.hero", () => {
  test("Returns hero data when found", async () => {
    const fakeHero = { title: "Hero Post", slug: "hero-post" };
    Blog.getHero.mockResolvedValue(fakeHero);
    const req = {};
    const res = mockRes();
    await blogController.hero(req, res);
    expect(res.json).toHaveBeenCalledWith(fakeHero);
  });

  test("Returns 404 when no hero post exists", async () => {
    Blog.getHero.mockResolvedValue(null);
    const req = {};
    const res = mockRes();
    await blogController.hero(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "No hero post" });
  });

  test("Returns 500 on error", async () => {
    Blog.getHero.mockRejectedValue(new Error("DB error"));
    const req = {};
    const res = mockRes();
    await blogController.hero(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
  });
});

// ═══════════════════════════════════════════════════════
// categories
// ═══════════════════════════════════════════════════════
describe("Unit Test — blogController.categories", () => {
  test("Returns list of categories", async () => {
    const fakeCategories = ["tech", "marketing"];
    Blog.getCategories.mockResolvedValue(fakeCategories);
    const req = {};
    const res = mockRes();
    await blogController.categories(req, res);
    expect(res.json).toHaveBeenCalledWith(fakeCategories);
  });

  test("Returns 500 on error", async () => {
    Blog.getCategories.mockRejectedValue(new Error("DB error"));
    const req = {};
    const res = mockRes();
    await blogController.categories(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
  });
});

// ═══════════════════════════════════════════════════════
// related
// ═══════════════════════════════════════════════════════
describe("Unit Test — blogController.related", () => {
  test("Returns related posts with pagination", async () => {
    const fakePosts = [{ title: "Post 1" }, { title: "Post 2" }];
    Blog.getRelated.mockResolvedValue(fakePosts);
    const req = { page: 0, pageSize: 4 };
    const res = mockRes();
    await blogController.related(req, res);
    expect(Blog.getRelated).toHaveBeenCalledWith(0, 4);
    expect(res.json).toHaveBeenCalledWith(fakePosts);
  });

  test("Returns 500 on error", async () => {
    Blog.getRelated.mockRejectedValue(new Error("DB error"));
    const req = { page: 0, pageSize: 4 };
    const res = mockRes();
    await blogController.related(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
  });
});

// ═══════════════════════════════════════════════════════
// marketing
// ═══════════════════════════════════════════════════════
describe("Unit Test — blogController.marketing", () => {
  test("Returns marketing posts with pagination", async () => {
    const fakePosts = [{ title: "Marketing Post" }];
    Blog.getMarketing.mockResolvedValue(fakePosts);
    const req = { page: 1, pageSize: 8 };
    const res = mockRes();
    await blogController.marketing(req, res);
    expect(Blog.getMarketing).toHaveBeenCalledWith(1, 8);
    expect(res.json).toHaveBeenCalledWith(fakePosts);
  });

  test("Returns 500 on error", async () => {
    Blog.getMarketing.mockRejectedValue(new Error("DB error"));
    const req = { page: 0, pageSize: 4 };
    const res = mockRes();
    await blogController.marketing(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
  });
});

// ═══════════════════════════════════════════════════════
// subscribe
// ═══════════════════════════════════════════════════════
describe("Unit Test — blogController.subscribe", () => {
  test("Returns subscribe result on success", async () => {
    const fakeResult = { ok: true, message: "Subscribed" };
    Blog.subscribe.mockResolvedValue(fakeResult);
    const req = { email: "user@example.com" };
    const res = mockRes();
    await blogController.subscribe(req, res);
    expect(Blog.subscribe).toHaveBeenCalledWith("user@example.com");
    expect(res.json).toHaveBeenCalledWith(fakeResult);
  });

  test("Returns 500 on error", async () => {
    Blog.subscribe.mockRejectedValue(new Error("DB error"));
    const req = { email: "user@example.com" };
    const res = mockRes();
    await blogController.subscribe(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
  });
});