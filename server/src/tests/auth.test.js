import express from "express";
import request from "supertest";
import { z } from "zod";
import { validate } from "../middlewares/validate.middleware.js";

describe("Auth routes", () => {
  it("should reject invalid signup payload", async () => {
    const app = express();
    app.use(express.json());
    const schema = z.object({
      email: z.string().email(),
      name: z.string().min(2),
      password: z.string().min(10)
    });
    app.post("/api/auth/signup", validate(schema), (req, res) => res.status(201).json({ ok: true }));

    const res = await request(app).post("/api/auth/signup").send({
      email: "bad",
      name: "A",
      password: "123"
    });
    expect(res.status).toBe(400);
  });
});
