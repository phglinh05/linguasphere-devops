const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ── Mock all mongoose models before requiring the controller ─────────────
jest.mock("../../src/models/User");
const User = require("../../src/models/User");
const authController = require("../../src/controllers/authController");

const JWT_SECRET = process.env.JWT_SECRET;

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  return res;
}

beforeAll(() => {
  process.env.JWT_SECRET = JWT_SECRET;
});

afterEach(() => {
  jest.clearAllMocks();
});

// ═══════════════════════════════════════════════════════
// register
// ═══════════════════════════════════════════════════════
describe("Unit Test — authController.register", () => {

  test("Returns 400 when required fields are missing", async () => {
    const req = { body: { username: "test", email: "test@test.com" } }; // missing password, cfpassword
    const res = mockRes();
    await authController.register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "All fields are required" });
  });

  test("Returns 400 when password and cfpassword do not match", async () => {
    const req = { body: { username: "test", email: "test@test.com", password: "123456", cfpassword: "654321" } };
    const res = mockRes();
    await authController.register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Passwords do not match" });
  });

  test("Returns 400 when username or email already exists", async () => {
    User.findOne.mockResolvedValue({ username: "existing" }); // simulate an existing user
    const req = { body: { username: "existing", email: "exists@test.com", password: "123456", cfpassword: "123456" } };
    const res = mockRes();
    await authController.register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "User already exists" });
  });

  test("Registers successfully — creates user with a hashed password", async () => {
    User.findOne.mockResolvedValue(null); // no duplicate user
    User.create.mockResolvedValue({ _id: "newid123" });

    const req = { body: { username: "newuser", email: "new@test.com", password: "mypassword", cfpassword: "mypassword" } };
    const res = mockRes();
    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: "Register successful" });

    // Verify password is hashed before saving (do not store plain text)
    const createCall = User.create.mock.calls[0][0];
    expect(createCall.password).not.toBe("mypassword");
    const isHashed = await bcrypt.compare("mypassword", createCall.password);
    expect(isHashed).toBe(true);
  });

  test("Returns 500 when the database throws", async () => {
    User.findOne.mockRejectedValue(new Error("DB connection failed"));
    const req = { body: { username: "u", email: "u@u.com", password: "123456", cfpassword: "123456" } };
    const res = mockRes();
    await authController.register(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ═══════════════════════════════════════════════════════
// login
// ═══════════════════════════════════════════════════════
describe("Unit Test — authController.login", () => {
  test("Sanitizes non-string username to empty string — returns 400", async () => {
    User.findOne.mockResolvedValue(null);
    const req = { body: { username: 12345, password: "pass" } }; // username là number
    const res = mockRes();
    await authController.login(req, res);
    expect(User.findOne).toHaveBeenCalledWith({ username: "" });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid credentials" });
  });

  test("Returns 400 when user does not exist", async () => {
    User.findOne.mockResolvedValue(null);
    const req = { body: { username: "noone", password: "123456" } };
    const res = mockRes();
    await authController.login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid credentials" });
  });

  test("Returns 400 when password is incorrect", async () => {
    const hashed = await bcrypt.hash("correctpass", 10);
    User.findOne.mockResolvedValue({ _id: "uid1", username: "user1", password: hashed });
    const req = { body: { username: "user1", password: "wrongpass" } };
    const res = mockRes();
    await authController.login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid credentials" });
  });

  test("Logs in successfully — sets httpOnly cookie containing JWT", async () => {
    const hashed = await bcrypt.hash("correctpass", 10);
    User.findOne.mockResolvedValue({ _id: "uid1", username: "user1", password: hashed });
    const req = { body: { username: "user1", password: "correctpass", remember: false } };
    const res = mockRes();
    await authController.login(req, res);

    expect(res.cookie).toHaveBeenCalledWith(
      "token",
      expect.any(String),
      expect.objectContaining({ httpOnly: true })
    );
    expect(res.json).toHaveBeenCalledWith({ message: "Login successful" });

    // Verify the JWT token is valid
    const cookieCall = res.cookie.mock.calls[0];
    const token = cookieCall[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    expect(decoded.id).toBe("uid1");
  });

  test("Token TTL: remember=true is 2d, remember=false is 1h", async () => {
    const hashed = await bcrypt.hash("pass", 10);
    User.findOne.mockResolvedValue({ _id: "uid2", username: "user2", password: hashed });

    // remember = true
    const reqRemember = { body: { username: "user2", password: "pass", remember: true } };
    const resRemember = mockRes();
    await authController.login(reqRemember, resRemember);
    const tokenRemember = resRemember.cookie.mock.calls[0][1];
    const decodedRemember = jwt.decode(tokenRemember);
    const durationRemember = decodedRemember.exp - decodedRemember.iat;
    expect(durationRemember).toBe(2 * 24 * 60 * 60); // 2 days

    // remember = false
    jest.clearAllMocks();
    User.findOne.mockResolvedValue({ _id: "uid2", username: "user2", password: hashed });
    const reqNoRemember = { body: { username: "user2", password: "pass", remember: false } };
    const resNoRemember = mockRes();
    await authController.login(reqNoRemember, resNoRemember);
    const tokenNoRemember = resNoRemember.cookie.mock.calls[0][1];
    const decodedNoRemember = jwt.decode(tokenNoRemember);
    const durationNoRemember = decodedNoRemember.exp - decodedNoRemember.iat;
    expect(durationNoRemember).toBe(60 * 60); // 1 hour
  });
});

// ═══════════════════════════════════════════════════════
// logout
// ═══════════════════════════════════════════════════════
describe("Unit Test — authController.logout", () => {

  test("Clears cookie and returns success message", () => {
    const req = {};
    const res = mockRes();
    authController.logout(req, res);
    expect(res.clearCookie).toHaveBeenCalledWith("token", expect.objectContaining({ httpOnly: true }));
    expect(res.json).toHaveBeenCalledWith({ message: "Logged out" });
  });
});

// ═══════════════════════════════════════════════════════
// me
// ═══════════════════════════════════════════════════════
describe("Unit Test — authController.me", () => {

  test("Returns user info when found", async () => {
    const fakeUser = { _id: "uid3", username: "testuser", email: "test@test.com" };
    User.findById.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(fakeUser),
      }),
    });

    const req = { user: { id: "uid3" } };
    const res = mockRes();
    await authController.me(req, res);

    expect(res.json).toHaveBeenCalledWith({
      authenticated: true,
      user: { id: "uid3", username: "testuser", email: "test@test.com" },
    });
  });

  test("Returns 404 when user is not found in DB", async () => {
    User.findById.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      }),
    });

    const req = { user: { id: "nonexistent" } };
    const res = mockRes();
    await authController.me(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });
});