import React, { useState, useEffect } from "react";
import Login from "./Login";
import ChatPage from "./ChatPage";
import CallWindow from "./CallWindow";
import FriendsList from "./FriendsList";
import CallPopup from "./CallPopup";
import io from "socket.io-client";

const socket = io("https://myfiles-1-e36b.onrender.com");

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [friend, setFriend] = useState(null);
  const [inCall, setInCall] = useState(false);
  const [callType, setCallType] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);

  useEffect(() => {
    socket.on("incoming call", ({ fromId, callType, offer }) => {
      setIncomingCall({ fromId, callType, offer });
    });
    return () => socket.off("incoming call");
  }, []);

  if (!currentUser) return <Login onLogin={setCurrentUser} />;

  if (incomingCall) {
    return (
      <CallPopup
        callerId={incomingCall.fromId}
        callType={incomingCall.callType}
        onAccept={() => {
          setInCall(true);
          setFriend({ userId: incomingCall.fromId });
          setCallType(incomingCall.callType);
          setIncomingCall(null);
        }}
        onReject={() => setIncomingCall(null)}
      />
    );
  }

  if (inCall && friend) {
    return (
      <CallWindow
        currentUser={currentUser}
        friend={friend}
        callType={callType}
        socket={socket}
        onEnd={() => {
          setInCall(false);
          setCallType(null);
        }}
      />
    );
  }

  if (friend) {
    return (
      <ChatPage
        currentUser={currentUser}
        friend={friend}
        socket={socket}
        onBack={() => setFriend(null)}
        onCall={(type) => {
          setInCall(true);
          setCallType(type);
        }}
      />
    );
  }

  return <FriendsList currentUser={currentUser} onSelectFriend={setFriend} />;
}
