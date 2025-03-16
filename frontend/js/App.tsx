import * as Sentry from "@sentry/react";
import cookie from "cookie";

import { OpenAPI } from "./api";
import Home from "./pages/Home";
import AdminDashboard from "./pages/admin/UserDashboard";
import "../sass/_global.scss"

OpenAPI.interceptors.request.use((request) => {
  const { csrftoken } = cookie.parse(document.cookie);
  if (request.headers && csrftoken) {
    request.headers["X-CSRFTOKEN"] = csrftoken;
  }
  return request;
});

const App = () => (
  <Sentry.ErrorBoundary fallback={<p>ERROR</p>}>
    <div className="center">
      <p>TESTING</p>
      <Home />
    </div>
  </Sentry.ErrorBoundary>
);

export default App;
