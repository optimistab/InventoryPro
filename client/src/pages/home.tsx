import React, { useState, useEffect } from "react";

export default function Home ()  {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  // Handle login form submit
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Very important!
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setError("Invalid username or password");
      }
    } catch {
      setError("Login failed. Please try again.");
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    setUsername("");
    setPassword("");
  };

  if (loading) return <div>Loading...</div>;

  if (user) {
    return (
      <div>
        <h1>Welcome, {user.username || "User"}!</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Login to InventoryPro</h1>
      <form onSubmit={handleLogin}>
        <div>
          <label>
            Username:
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </label>
        </div>
        <div>
          <label>
            Password:
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
        </div>
        <button type="submit">Login</button>
        {error && <div style={{ color: "red" }}>{error}</div>}
      </form>
    </div>
  );
};

