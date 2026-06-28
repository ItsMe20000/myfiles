import { useState, useEffect } from "react";
import { db, auth } from "./firebase";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";

function PrivateChat({ selectedUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // Unique chat ID based on both users' UIDs
  const chatId = [auth.currentUser.uid, selectedUser.id].sort().join("_");

  useEffect(() => {
    const q = query(collection(db, "privateChats", chatId, "messages"), orderBy("createdAt"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [chatId]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    await addDoc(collection(db, "privateChats", chatId, "messages"), {
      text: newMessage,
      createdAt: serverTimestamp(),
      from: auth.currentUser.uid,
      to: selectedUser.id,
    });
    setNewMessage("");
  };

  return (
    <div>
      <h2>Chat with {selectedUser.displayName || selectedUser.email}</h2>
      <div style={{ border: "1px solid #ccc", padding: "10px", height: "300px", overflowY: "scroll", marginBottom: "10px" }}>
        {messages.map((msg) => (
          <p key={msg.id}>
            <strong>{msg.from === auth.currentUser.uid ? "You" : selectedUser.displayName || selectedUser.email}:</strong> {msg.text}
          </p>
        ))}
      </div>
      <input
        type="text"
        placeholder="Type a message..."
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        style={{ width: "70%", marginRight: "10px" }}
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}

export default PrivateChat;