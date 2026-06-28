import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import process from "process/browser";

import process from "process";
import { Buffer } from "buffer";

window.process = process;
window.Buffer = Buffer;

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
