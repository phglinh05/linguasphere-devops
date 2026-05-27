const jwt = require("jsonwebtoken");
const authMiddleware = require("../../src/middleware/authMiddleware");

const JWT_SECRET = "test_secret_key_for_unit_tests";

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

describe("Unit Test — authMiddleware", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = JWT_SECRET;
  });

  // ── Case: no token ────────────────────────────────────────────────────────
  test("Returns 401 when token cookie is missing", () => {
    const req = mockReq(null);
    const res = mockRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Not authenticated" });
    expect(next).not.toHaveBeenCalled();
  });

  // ── Case: valid token ─────────────────────────────────────────────────────
  test("Calls next() and sets req.user when token is valid", () => {
    const token = jwt.sign({ id: "user123" }, JWT_SECRET, { expiresIn: "1h" });
    const req = mockReq(token);
    const res = mockRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.id).toBe("user123");
    expect(res.status).not.toHaveBeenCalled();
  });

  // ── Case: invalid token ─────────────────────────────────────────────────--
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

  // ── Case: expired token ─────────────────────────────────────────────────--
  test("Returns 403 when token is expired", () => {
    const token = jwt.sign({ id: "user123" }, JWT_SECRET, { expiresIn: "0s" });
    // Wait for the token to expire
    return new Promise((resolve) => {
      setTimeout(() => {
        const req = mockReq(token);
        const res = mockRes();
        const next = jest.fn();

        authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
        resolve();
      }, 100);
    });
  });

  // ── Case: tampered token payload ─────────────────────────────────────────
  test("Returns 403 when token payload is tampered", () => {
    const token = jwt.sign({ id: "user123" }, JWT_SECRET);
    // Tamper payload by modifying the middle part of the JWT
    const parts = token.split(".");
    const fakeParts = [parts[0], Buffer.from(JSON.stringify({ id: "hacker" })).toString("base64url"), parts[2]];
    const tamperedToken = fakeParts.join(".");

    const req = mockReq(tamperedToken);
    const res = mockRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});