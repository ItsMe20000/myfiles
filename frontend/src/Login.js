import React, { useState } from "react";

export default function Login({ onLogin }) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!userId || !password) {
      setError("Please enter both User ID and Password");
      return;
    }

    try {
      const res = await fetch("https://myfiles-1-e36b.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, password })
      });

      const data = await res.json();
      if (res.ok) {
        onLogin({ userId });
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Login</h2>
      <input
        style={styles.input}
        placeholder="User ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />
      <input
        style={styles.input}
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button style={styles.loginBtn} onClick={handleLogin}>Login</button>
      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 400,
    margin: "100px auto",
    padding: 20,
    backgroundColor: "#ECE5DD",
    borderRadius: 10,
    border: "1px solid #ccc",
    textAlign: "center"
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    border: "1px solid #ccc"
  },
  loginBtn: {
    width: "100%",
    padding: "10px",
    borderRadius: 5,
    border: "none",
    backgroundColor: "#25D366",
    color: "white",
    fontSize: 16,
    cursor: "pointer"
  },
  error: {
    color: "red",
    marginTop: 10
  }
};
