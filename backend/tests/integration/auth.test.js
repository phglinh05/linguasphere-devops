const { parsePagination, validateEmail } = require("../../src/middleware/blogMiddleware");

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

// ═══════════════════════════════════════════════════════
// parsePagination
// ═══════════════════════════════════════════════════════
describe("Unit Test — blogMiddleware.parsePagination", () => {

  test("Defaults to page=0 and pageSize=4 when query params are missing", () => {
    const req = { query: {} };
    const next = jest.fn();
    parsePagination(req, mockRes(), next);
    expect(req.page).toBe(0);
    expect(req.pageSize).toBe(4);
    expect(next).toHaveBeenCalled();
  });

  test("Parses page and page_size correctly from query string", () => {
    const req = { query: { page: "2", page_size: "8" } };
    const next = jest.fn();
    parsePagination(req, mockRes(), next);
    expect(req.page).toBe(2);
    expect(req.pageSize).toBe(8);
  });

  test("Caps pageSize at 12", () => {
    const req = { query: { page_size: "100" } };
    const next = jest.fn();
    parsePagination(req, mockRes(), next);
    expect(req.pageSize).toBe(12);
  });

  test("Enforces a minimum pageSize of 1", () => {
    const req = { query: { page_size: "0" } };
    const next = jest.fn();
    parsePagination(req, mockRes(), next);
    expect(req.pageSize).toBe(1);
  });

  test("Clamps negative page to 0", () => {
    const req = { query: { page: "-5" } };
    const next = jest.fn();
    parsePagination(req, mockRes(), next);
    expect(req.page).toBe(0);
  });

  test("Non-numeric page_size results in NaN (parseInt behavior)", () => {
    const req = { query: { page_size: "abc" } };
    const next = jest.fn();
    parsePagination(req, mockRes(), next);
    // parseInt('abc') = NaN; Math.min/max with NaN also returns NaN — current behavior
    // This test documents current behavior to detect logic changes
    expect(Number.isNaN(req.pageSize)).toBe(true);
    expect(next).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════
// validateEmail
// ═══════════════════════════════════════════════════════
describe("Unit Test — blogMiddleware.validateEmail", () => {

  test("Calls next() when email is valid", () => {
    const req = { body: { email: "user@example.com" } };
    const next = jest.fn();
    validateEmail(req, mockRes(), next);
    expect(next).toHaveBeenCalled();
    expect(req.email).toBe("user@example.com");
  });

  test("Normalizes email to lowercase", () => {
    const req = { body: { email: "User@Example.COM" } };
    const next = jest.fn();
    validateEmail(req, mockRes(), next);
    expect(req.email).toBe("user@example.com");
  });

  test("Trims whitespace around email", () => {
    const req = { body: { email: "  user@example.com  " } };
    const next = jest.fn();
    validateEmail(req, mockRes(), next);
    expect(req.email).toBe("user@example.com");
  });

  test("Returns 400 when email is empty", () => {
    const req = { body: { email: "" } };
    const res = mockRes();
    const next = jest.fn();
    validateEmail(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  test("Returns 400 when email does not contain '@'", () => {
    const req = { body: { email: "notanemail" } };
    const res = mockRes();
    const next = jest.fn();
    validateEmail(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ ok: false, message: "Invalid email." });
  });

  test("Returns 400 when request body has no email field", () => {
    const req = { body: {} };
    const res = mockRes();
    const next = jest.fn();
    validateEmail(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});