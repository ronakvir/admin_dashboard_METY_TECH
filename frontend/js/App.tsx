import React, { useEffect } from "react";
import * as Sentry from "@sentry/react";
import cookie from "cookie";
import axios from "axios";
import { OpenAPI } from "./api";
import Home from "./pages/Home";
import "../sass/_global.scss";

OpenAPI.interceptors.request.use((request) => {
  const { csrftoken } = cookie.parse(document.cookie);
  if (csrftoken && request.headers) {
    request.headers["X-CSRFTOKEN"] = csrftoken;
  }
  return request;
});

const App = () => {
  useEffect(() => {
    const { csrftoken } = cookie.parse(document.cookie);
    if (!csrftoken) {
      axios
        .get("/get-csrf-token/", { withCredentials: true })
        .then((response) => {
          console.log("CSRF token set:", response.data.csrftoken);
        })
        .catch((err) => {
          console.error("Failed to set CSRF token:", err);
        });
    }
  }, []);

  return (
    <Sentry.ErrorBoundary fallback={<p>ERROR</p>}>
      <div className="center">
        <Home />
      </div>
    </Sentry.ErrorBoundary>
  );
};

export default App;
