const jwt = require("jsonwebtoken");
const authMiddleware = require("../../src/middleware/authMiddleware");

const JWT_SECRET = process.env.JWT_SECRET;

// Helper: create mock req, res, next
function mockReq(cookieToken = null) {
  return { cookies: { token: cookieToken } };
}

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.redirect = jest.fn().mockReturnValue(res);
  return res;
}

// ═══════════════════════════════════════════════════════
// authMiddleware (API — returns JSON)
// ═══════════════════════════════════════════════════════
describe("Unit Test — authMiddleware", () => {
  test("Returns 401 when token cookie is missing", () => {
    const req = mockReq(null);
    const res = mockRes();
    const next = jest.fn();
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Not authenticated" });
    expect(next).not.toHaveBeenCalled();
  });
 
  test("Calls next() and sets req.user when token is valid", () => {
    const token = jwt.sign({ id: "user123" }, JWT_SECRET, { expiresIn: "1h" });
    const req = mockReq(token);
    const res = mockRes();
    const next = jest.fn();
    authMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user.id).toBe("user123");
    expect(res.status).not.toHaveBeenCalled();
  });
 
  test("Returns 403 when token signature is invalid", () => {
    const token = jwt.sign({ id: "user123" }, "wrong_secret");
    const req = mockReq(token);
    const res = mockRes();
    const next = jest.fn();
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid token" });
    expect(next).not.toHaveBeenCalled();
  });
 
  test("Returns 403 when token is expired", () => {
    const expiredToken = jwt.sign(
      { id: "user123", exp: Math.floor(Date.now() / 1000) - 1 },
      JWT_SECRET
    );
    const req = mockReq(expiredToken);
    const res = mockRes();
    const next = jest.fn();
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
 
  test("Returns 403 when token payload is tampered", () => {
    const token = jwt.sign({ id: "user123" }, JWT_SECRET);
    const parts = token.split(".");
    const fakeParts = [
      parts[0],
      Buffer.from(JSON.stringify({ id: "hacker" })).toString("base64url"),
      parts[2],
    ];
    const tamperedToken = fakeParts.join(".");
    const req = mockReq(tamperedToken);
    const res = mockRes();
    const next = jest.fn();
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
 
// ═══════════════════════════════════════════════════════
// authPageMiddleware (Page routes — redirects)
// ═══════════════════════════════════════════════════════
describe("Unit Test — authPageMiddleware", () => {
  test("Redirects to '/' when token cookie is missing", () => {
    const req = mockReq(null);
    const res = mockRes();
    const next = jest.fn();
    authPageMiddleware(req, res, next);
    expect(res.redirect).toHaveBeenCalledWith("/");
    expect(next).not.toHaveBeenCalled();
  });
 
  test("Calls next() and sets req.user when token is valid", () => {
    const token = jwt.sign({ id: "user456" }, JWT_SECRET, { expiresIn: "1h" });
    const req = mockReq(token);
    const res = mockRes();
    const next = jest.fn();
    authPageMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user.id).toBe("user456");
    expect(res.redirect).not.toHaveBeenCalled();
  });
 
  test("Redirects to '/' when token signature is invalid", () => {
    const token = jwt.sign({ id: "user456" }, "bad_secret");
    const req = mockReq(token);
    const res = mockRes();
    const next = jest.fn();
    authPageMiddleware(req, res, next);
    expect(res.redirect).toHaveBeenCalledWith("/");
    expect(next).not.toHaveBeenCalled();
  });
 
  test("Redirects to '/' when token is expired", () => {
    const expiredToken = jwt.sign(
      { id: "user456", exp: Math.floor(Date.now() / 1000) - 1 },
      JWT_SECRET
    );
    const req = mockReq(expiredToken);
    const res = mockRes();
    const next = jest.fn();
    authPageMiddleware(req, res, next);
    expect(res.redirect).toHaveBeenCalledWith("/");
    expect(next).not.toHaveBeenCalled();
  });
});
 