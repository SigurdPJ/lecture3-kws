import React from "react";
import { createRoot } from "react-dom/client";
import { Application } from "./modules/app/application.js";

createRoot(document.getElementById("root")!).render(<Application />);
