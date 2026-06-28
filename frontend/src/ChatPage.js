import React, { useState, useEffect, useRef } from "react";

export default function ChatPage({ currentUser, friend, socket, onBack, onCall }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.emit("register user", currentUser.userId);

    fetch(`http://localhost:3001/chat/${currentUser.userId}/${friend.userId}`)
      .then(res => res.json())
      .then(data => setMessages(data));

    socket.on("chat message", (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on("messages read", ({ chatId }) => {
      setMessages(prev => prev.map(m => ({ ...m, status: "read" })));
    });

    socket.on("chat deleted", () => setMessages([]));

    return () => {
      socket.off("chat message");
      socket.off("messages read");
      socket.off("chat deleted");
    };
  }, [currentUser.userId, friend.userId, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    socket.emit("chat message", {
      senderId: currentUser.userId,
      receiverId: friend.userId,
      message: input,
    });
    setInput("");
  };

  const deleteChat = () => {
    socket.emit("delete chat", { userA: currentUser.userId, userB: friend.userId });
  };

  const renderTick = (status) => {
    if (status === "sent") return <span style={{ color: "gray" }}>✓</span>;
    if (status === "delivered") return <span style={{ color: "gray" }}>✓✓</span>;
    if (status === "read") return <span style={{ color: "#34B7F1" }}>✓✓</span>;
    return "";
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backBtn}>←</button>
        <h3>{friend.userId}</h3>
      </div>

      <div style={styles.chatBox}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              ...styles.message,
              alignSelf: msg.senderId === currentUser.userId ? "flex-end" : "flex-start",
              backgroundColor: msg.senderId === currentUser.userId ? "#DCF8C6" : "#FFF",
            }}
          >
            <span>{msg.message}</span>
            <div style={styles.meta}>
              <span style={styles.time}>
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
              {renderTick(msg.status)}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div style={styles.inputBox}>
        <input
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message"
        />
        <button style={styles.sendBtn} onClick={sendMessage}>Send</button>
      </div>

      <button style={styles.deleteBtn} onClick={deleteChat}>🗑️ Delete Chat</button>

      <div style={styles.callBox}>
        <button style={styles.audioBtn} onClick={() => onCall("audio")}>🎙️ Audio Call</button>
        <button style={styles.videoBtn} onClick={() => onCall("video")}>📹 Video Call</button>
      </div>
    </div>
  );
}

const styles = {
  container: { display: "flex", flexDirection: "column", height: "100vh", maxWidth: 600, margin: "0 auto", border: "1px solid #ccc", backgroundColor: "#ECE5DD" },
  header: { display: "flex", alignItems: "center", padding: 10, backgroundColor: "#075E54", color: "white" },
  backBtn: { marginRight: 10, background: "none", border: "none", color: "white", fontSize: 20, cursor: "pointer" },
  chatBox: { flex: 1, display: "flex", flexDirection: "column", padding: 10, overflowY: "auto" },
  message: { margin: 5, padding: 10, borderRadius: 10, maxWidth: "70%", wordWrap: "break-word", fontSize: 16 },
  meta: { display: "flex", justifyContent: "flex-end", alignItems: "center", fontSize: 12, marginTop: 5, gap: 5 },
  time: { color: "gray" },
  inputBox: { display: "flex", padding: 10, backgroundColor: "#f0f0f0" },
  input: { flex: 1, padding: 10, fontSize: 16, borderRadius: 20, border: "1px solid #ccc" },
  sendBtn: { marginLeft: 10, padding: "10px 20px", fontSize: 16, borderRadius: 20, border: "none", backgroundColor: "#25D366", color: "white", cursor: "pointer" },
  deleteBtn: { margin: 10, padding: "10px 20px", fontSize: 16, borderRadius: 5, border: "none", backgroundColor: "#d9534f", color: "white", cursor: "pointer" },
  callBox: { display: "flex", justifyContent: "center", gap: 10, marginBottom: 10 },
  audioBtn: { padding: "10px 20px", backgroundColor: "#075E54", color: "white", border: "none", borderRadius: 5, cursor: "pointer" },
  videoBtn: { padding: "10px 20px", backgroundColor: "#128C7E", color: "white", border: "none", borderRadius: 5, cursor: "pointer" },
};
