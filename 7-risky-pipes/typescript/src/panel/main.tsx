import React from "react"
import ReactDOM from "react-dom/client";
import { App } from "./Panel/App.tsx";
import './i18n.ts'

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
