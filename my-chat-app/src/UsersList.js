import React, { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";

function UsersList({ onSelectUser }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // 🔑 Only show users who are online
    const q = query(collection(db, "users"), where("status", "==", "online"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const uniqueUsers = [];
      const seen = new Set();

      snapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() };

        // Exclude the currently logged-in user
        if (auth.currentUser && data.id === auth.currentUser.uid) {
          return;
        }

        if (!seen.has(data.id)) {
          seen.add(data.id);
          uniqueUsers.push(data);
        }
      });

      setUsers(uniqueUsers);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      <h3>Online Users</h3>
      <ul>
        {users.map((user) => (
          <li key={user.id} onClick={() => onSelectUser(user)}>
            {user.displayName || user.email} ({user.status})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UsersList;