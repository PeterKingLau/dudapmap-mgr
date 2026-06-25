import { createRoot } from "react-dom/client";
import "antd/dist/reset.css";
import "../static/base.css";
import "../static/primary.css";
import "./styles.css";
import { App } from "./App";

const container = document.getElementById("react-root");

if (!container) {
  throw new Error("React root element not found");
}

createRoot(container).render(<App />);
