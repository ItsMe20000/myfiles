import React from "react";

export default function CallPopup({ callerId, callType, onAccept, onReject }) {
  return (
    <div style={styles.overlay}>
      <div style={styles.popup}>
        <h3>{callerId} is calling ({callType})</h3>
        <div style={styles.buttons}>
          <button style={styles.acceptBtn} onClick={onAccept}>✅ Accept</button>
          <button style={styles.rejectBtn} onClick={onReject}>❌ Reject</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex", justifyContent: "center", alignItems: "center",
    zIndex: 1000,
  },
  popup: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    textAlign: "center",
    minWidth: 250,
  },
  buttons: {
    marginTop: 15,
    display: "flex",
    justifyContent: "space-around",
  },
  acceptBtn: {
    padding: "10px 20px",
    backgroundColor: "#25D366",
    color: "white",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
  },
  rejectBtn: {
    padding: "10px 20px",
    backgroundColor: "#d9534f",
    color: "white",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
  },
};
