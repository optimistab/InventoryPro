import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import passport from "passport";
import "./auth"; // passport config
import pgSession from "connect-pg-simple";
import pool from "../db"; // your pg Pool
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import setupDatabaseDrizzle from "../scripts/setupDatabaseDrizzle";
import { createUsersIfNeeded } from "../scripts/createUsers";

const app = express();
const PgSession = pgSession(session);



// database issue resolves completely on render.com

app.use(
  session({
    store: new PgSession({
      pool,
      tableName: "session",
    }),
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Set up database with Drizzle migrations before starting the server
  try {
    console.log(" setupDatabaseDrizzle START --")
    await setupDatabaseDrizzle();
    console.log(" setupDatabaseDrizzle END --")
    log('✅ Database setup with Drizzle migrations completed');
  } catch (error) {
    console.error('❌ Database setup with Drizzle migrations failed:', error);
    log('⚠️  Database setup failed, but continuing...');
  }

  // Create users automatically if they don't exist (for first deployment)
  // Add a small delay to ensure database schema is fully ready
  setTimeout(async () => {
    try {
      console.log("👥 Checking and creating users if needed...");
      await createUsersIfNeeded();
      log('✅ User setup completed');
    } catch (error) {
      console.error('❌ User setup failed:', error);
      log('⚠️  User setup failed, but application will continue...');
      // Don't let user creation errors crash the app
    }
  }, 2000); // Removed .unref() to keep the process alive
  
  console.log("Registering routes...");
  const server = await registerRoutes(app);
  console.log("Routes registered successfully.");

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // npm run db:push - this command make sure that tables are created

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Use PORT environment variable in production (for Render), fallback to 5001 for development
  // this serves both the API and the client.
  const port = process.env.PORT ? parseInt(process.env.PORT) : 5001;
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    }
  );
})();
