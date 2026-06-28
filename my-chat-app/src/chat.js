import { useState, useEffect } from "react";
import { db, auth } from "./firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [userProfiles, setUserProfiles] = useState({});

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("createdAt"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const profiles = { ...userProfiles };
      for (const msg of msgs) {
        if (msg.uid && !profiles[msg.uid]) {
          const userDoc = await getDoc(doc(db, "users", msg.uid));
          if (userDoc.exists()) {
            profiles[msg.uid] = {
              displayName: userDoc.data().displayName || msg.user,
              status: userDoc.data().status || "offline",
            };
          } else {
            profiles[msg.uid] = { displayName: msg.user, status: "offline" };
          }
        }
      }

      setUserProfiles(profiles);
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, []);

  const handleSend = async () => {
    if (newMessage.trim() === "") return;

    try {
      await addDoc(collection(db, "messages"), {
        text: newMessage,
        createdAt: serverTimestamp(),
        user: auth.currentUser.email,
        uid: auth.currentUser.uid,
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div>
      <h2>Chat Room</h2>
      <div
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          height: "300px",
          overflowY: "scroll",
          marginBottom: "10px",
        }}
      >
        {messages.map((msg) => (
          <p key={msg.id}>
            <strong>{userProfiles[msg.uid]?.displayName || msg.user}</strong>
            {" "}
            ({userProfiles[msg.uid]?.status || "offline"}): {msg.text}
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

export default Chat;