import React, { useState, useEffect } from "react";

export default function FriendsList({ currentUser, onSelectFriend }) {
  const [friends, setFriends] = useState([]);
  const [newFriendId, setNewFriendId] = useState("");

  // Load friends list
  const fetchFriends = () => {
    fetch(`http://localhost:3001/friends/${currentUser.userId}`)
      .then(res => res.json())
      .then(data => setFriends(data))
      .catch(err => console.error("Error fetching friends:", err));
  };

 useEffect(() => {
  fetchFriends();
}, [fetchFriends]);

  // Add friend
  const addFriend = () => {
    if (!newFriendId.trim()) return;
    fetch("http://localhost:3001/addFriend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUser.userId, friendId: newFriendId })
    })
      .then(res => res.json())
      .then(() => {
        setNewFriendId("");
        fetchFriends(); // refresh list after adding
      })
      .catch(err => console.error("Error adding friend:", err));
  };

  return (
    <div style={styles.container}>
      <h2>Friends List</h2>

      <div style={styles.addBox}>
        <input
          style={styles.input}
          value={newFriendId}
          onChange={(e) => setNewFriendId(e.target.value)}
          placeholder="Enter Friend ID"
        />
        <button style={styles.addBtn} onClick={addFriend}>➕ Add Friend</button>
      </div>

      <ul style={styles.list}>
        {friends.map((f, i) => (
          <li key={i} style={styles.friendItem}>
            <span>{f}</span>
            <button style={styles.chatBtn} onClick={() => onSelectFriend({ userId: f })}>
              💬 Chat
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 400,
    margin: "0 auto",
    padding: 20,
    backgroundColor: "#ECE5DD",
    borderRadius: 10,
    border: "1px solid #ccc",
    textAlign: "center"
  },
  addBox: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 20,
    gap: 10
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    border: "1px solid #ccc"
  },
  addBtn: {
    padding: "10px 20px",
    borderRadius: 5,
    border: "none",
    backgroundColor: "#25D366",
    color: "white",
    cursor: "pointer"
  },
  list: {
    listStyle: "none",
    padding: 0
  },
  friendItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    padding: "10px",
    backgroundColor: "#fff",
    borderRadius: 5,
    border: "1px solid #ccc"
  },
  chatBtn: {
    padding: "5px 10px",
    borderRadius: 5,
    border: "none",
    backgroundColor: "#075E54",
    color: "white",
    cursor: "pointer"
  }
};
