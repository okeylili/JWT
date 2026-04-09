import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import csrf from "csurf";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import healthRoutes from "./routes/health.routes.js";
import { apiRateLimiter } from "./middlewares/rate-limit.middleware.js";
import { sanitizeBody } from "./middlewares/sanitize.middleware.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'"],
        "style-src": ["'self'", "'unsafe-inline'"]
      }
    }
  })
);
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true
  })
);
app.use(compression());
app.use(express.json({ limit: "200kb" }));
app.use(sanitizeBody);
app.use(cookieParser());
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) }
  })
);
app.use(apiRateLimiter);

const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict"
  }
});

app.get("/api/csrf-token", csrfProtection, (req, res) => {
  res.status(200).json({ csrfToken: req.csrfToken() });
});

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", csrfProtection, adminRoutes);

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Secure Auth API",
      version: "1.0.0"
    },
    paths: {
      "/api/auth/signup": { post: { summary: "Register user" } },
      "/api/auth/login": { post: { summary: "Login user" } },
      "/api/auth/refresh": { post: { summary: "Rotate refresh token" } },
      "/api/auth/logout": { post: { summary: "Logout user" } },
      "/api/auth/change-password": { post: { summary: "Change user password" } },
      "/api/admin/users": { get: { summary: "List users" } },
      "/api/admin/users/{userId}/role": { patch: { summary: "Update role" } },
      "/api/admin/users/{userId}/unlock": { patch: { summary: "Unlock account" } },
      "/api/admin/logs": { get: { summary: "Read audit logs" } }
    }
  },
  apis: []
});
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorMiddleware);

export default app;
