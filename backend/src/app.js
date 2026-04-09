import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import csurf from "csurf";
import express from "express";
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import xssClean from "xss-clean";
import { env } from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { swaggerSpec } from "./docs/swagger.js";

export const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"]
      }
    }
  })
);
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false, limit: "100kb" }));
app.use(cookieParser());
app.use(compression());
app.use(morgan("combined"));
app.use(mongoSanitize());
app.use(xssClean());

const csrfProtection = csurf({ cookie: { httpOnly: true, sameSite: "strict", secure: env.nodeEnv === "production" } });

app.get("/health", (_req, res) => res.json({ ok: true }));
app.get("/csrf-token", csrfProtection, (req, res) => res.json({ csrfToken: req.csrfToken() }));
app.use("/api/auth", authRoutes);
app.use("/api/admin", csrfProtection, adminRoutes);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorHandler);
