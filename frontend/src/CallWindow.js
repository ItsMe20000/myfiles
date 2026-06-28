import React, { useEffect, useRef } from "react";

export default function CallWindow({ currentUser, friend, callType, socket, onEnd }) {
  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const peerConnection = useRef(null);

  useEffect(() => {
    const initCall = async () => {
      const constraints = callType === "audio" ? { audio: true } : { video: true, audio: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (localVideo.current && callType === "video") {
        localVideo.current.srcObject = stream;
      }

      peerConnection.current = new RTCPeerConnection();

      // Add local tracks
      stream.getTracks().forEach(track => peerConnection.current.addTrack(track, stream));

      // Remote stream
      peerConnection.current.ontrack = (event) => {
        if (remoteVideo.current) {
          remoteVideo.current.srcObject = event.streams[0];
        }
      };

      // ICE candidates
      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice candidate", { toId: friend.userId, candidate: event.candidate });
        }
      };

      // Handle ICE from peer
      socket.on("ice candidate", async (candidate) => {
        try {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("Error adding ICE candidate", err);
        }
      });

      // Handle answer from peer
      socket.on("call answered", async ({ fromId, answer }) => {
        if (fromId === friend.userId) {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
        }
      });

      // Caller creates offer
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      socket.emit("call request", {
        fromId: currentUser.userId,
        toId: friend.userId,
        callType,
        offer
      });
    };

    initCall();

    return () => {
      socket.off("ice candidate");
      socket.off("call answered");
      peerConnection.current?.close();
    };
  }, [currentUser.userId, friend.userId, callType, socket]);

  return (
    <div style={styles.container}>
      <h2>{callType === "audio" ? "Audio Call" : "Video Call"} with {friend.userId}</h2>
      <div style={styles.videoBox}>
        {callType === "video" && (
          <video ref={localVideo} autoPlay muted style={styles.video} />
        )}
        <video ref={remoteVideo} autoPlay style={styles.video} />
      </div>
      <button style={styles.endBtn} onClick={onEnd}>End Call</button>
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    padding: 20,
    backgroundColor: "#ECE5DD",
    height: "100vh",
  },
  videoBox: {
    display: "flex",
    justifyContent: "center",
    gap: 10,
    marginBottom: 20,
  },
  video: {
    width: "45%",
    borderRadius: 10,
    border: "1px solid #ccc",
    backgroundColor: "black",
  },
  endBtn: {
    padding: "10px 20px",
    fontSize: 16,
    borderRadius: 20,
    border: "none",
    backgroundColor: "#d9534f",
    color: "white",
    cursor: "pointer",
  },
};
