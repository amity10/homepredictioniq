import React from "react";
import ReactDOM from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import "./index.css";
import App from "./App";

const clerkPubKey = "pk_test_ZW1lcmdpbmctc2hlcGhlcmQtODAuY2xlcmsuYWNjb3VudHMuZGV2JA";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ClerkProvider publishableKey={clerkPubKey}>
    <App />
  </ClerkProvider>
);
