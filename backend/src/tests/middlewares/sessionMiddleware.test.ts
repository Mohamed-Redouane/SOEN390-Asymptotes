import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { sessionCookieMiddleware } from "../../middlewares/sessionMiddleware.js";

describe("sessionCookieMiddleware", () => {
  let req: Partial<Record<string, any>>;
  let res: Partial<Record<string, any>>;
  let next: ReturnType<typeof vi.fn>;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    req = {
      path: "/somepath",
      method: "GET",
      cookies: {},
      headers: {},
    };

    res = {
      // Simulate res.cookie() method
      cookie: vi.fn(),
      // Simulate res.status().json() chain
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    next = vi.fn();
    process.env.NODE_ENV = "development"; // default env for most tests
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("should immediately call next for path '/'", () => {
    req.path = "/";
    sessionCookieMiddleware(req as any, res as any, next);
    expect(next).toHaveBeenCalled();
    expect(res.cookie).not.toHaveBeenCalled();
  });

  it("should immediately call next for path '/health'", () => {
    req.path = "/health";
    sessionCookieMiddleware(req as any, res as any, next);
    expect(next).toHaveBeenCalled();
    expect(res.cookie).not.toHaveBeenCalled();
  });

  it("should set the session cookie for GET requests if a cookie exists", () => {
    req.method = "GET";
    req.cookies = { session: "abc123" };
    sessionCookieMiddleware(req as any, res as any, next);
    expect(res.cookie).toHaveBeenCalledWith("session", "abc123", {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: false, // NODE_ENV is "development"
      maxAge: 60 * 60 * 24 * 30 * 1000,
    });
    expect(next).toHaveBeenCalled();
  });

  it("should not set the session cookie for GET requests if no cookie exists", () => {
    req.method = "GET";
    req.cookies = {};
    sessionCookieMiddleware(req as any, res as any, next);
    expect(res.cookie).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it("should call next for non-GET requests in development when origin is allowed", () => {
    req.method = "POST";
    req.headers = {
      origin: "http://localhost:5173", // allowed origin
      host: "anyhost",
    };
    sessionCookieMiddleware(req as any, res as any, next);
    // In development, host mismatch is not enforced
    expect(next).toHaveBeenCalled();
  });

  it("should return 403 for non-GET requests with disallowed origin", () => {
    req.method = "POST";
    req.headers = { origin: "http://notallowed.com" };
    sessionCookieMiddleware(req as any, res as any, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: "Forbidden: CORS policy violation",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 403 in production for non-GET requests with host mismatch", () => {
    process.env.NODE_ENV = "production";
    req.method = "POST";
    req.headers = {
      origin: "http://localhost:5173",
      host: "localhost:1234", // host mismatch
    };
    sessionCookieMiddleware(req as any, res as any, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: "Forbidden: Host mismatch",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next in production for non-GET requests with valid host", () => {
    process.env.NODE_ENV = "production";
    req.method = "POST";
    req.headers = {
      origin: "http://localhost:5173",
      host: "localhost:5173", // host matches the origin
    };
    sessionCookieMiddleware(req as any, res as any, next);
    expect(next).toHaveBeenCalled();
  });
});
