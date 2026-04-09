import express from "express";
import request from "supertest";

describe("Protected routes", () => {
  it("should deny access without bearer token", async () => {
    const app = express();
    app.get("/api/protected", (req, res) => {
      const auth = req.headers.authorization;
      if (!auth) return res.status(401).json({ message: "Missing access token" });
      return res.status(200).json({ ok: true });
    });

    const res = await request(app).get("/api/protected");
    expect(res.status).toBe(401);
  });
});
