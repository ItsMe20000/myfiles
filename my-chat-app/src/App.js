import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
import { auth, db } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import Signup from "./signup";
import Login from "./login";
import UsersList from "./UsersList";
import PrivateChat from "./PrivateChat";
import Chat from "./chat";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();

  // 🔑 Track auth state and set user online
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          await updateDoc(doc(db, "users", currentUser.uid), {
            status: "online",
          });
        } catch (err) {
          console.error("Error updating user status:", err);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // ❌ Handle logout
  const handleLogout = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await updateDoc(doc(db, "users", currentUser.uid), {
          status: "offline",
        });
      }

      await signOut(auth);
      setSelectedUser(null);
      setUser(null);
      alert("Logged out successfully!");

      // Redirect to login page
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      alert("Logout failed: " + error.message);
    }
  };

  return (
    <div className="App">
      <h1>My Messaging App</h1>

      {user ? (
        <div style={{ display: "flex", gap: "20px" }}>
          <div style={{ flex: 1 }}>
            <h2>Welcome, {user.email}</h2>
            <button onClick={handleLogout}>Logout</button>

            {selectedUser ? (
              <PrivateChat
                selectedUser={selectedUser}
                onBack={() => setSelectedUser(null)}
              />
            ) : (
              <Chat /> 
            )}
          </div>
          <UsersList onSelectUser={setSelectedUser} />
        </div>
      ) : (
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      )}

      {!user && (
        <nav style={{ marginTop: "20px" }}>
          <Link to="/signup" style={{ marginRight: "10px" }}>
            Sign Up
          </Link>
          <Link to="/login">Login</Link>
        </nav>
      )}
    </div>
  );
}

// Wrap App with Router
export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
