import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import pool from "../db";
import { users } from "../shared/schema";

// LocalStrategy expects verify callback: (username, password, done)
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      // Query user by username
      const res = await pool.query(
        `SELECT * FROM users WHERE username = $1`,
        [username]
      );
      const user = res.rows[0];
      if (!user) return done(null, false, { message: "User not found" });

      const match = await bcrypt.compare(password, user.password);
      if (!match) return done(null, false, { message: "Incorrect password" });

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const res = await pool.query(
      `SELECT * FROM users WHERE id = $1`,
      [id]
    );
    const user = res.rows[0];
    done(null, user || false);
  } catch (err) {
    done(err);
  }
});