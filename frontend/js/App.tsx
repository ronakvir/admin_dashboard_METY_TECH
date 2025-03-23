import React, { useEffect } from "react";
import * as Sentry from "@sentry/react";
import cookie from "cookie";
import axios from "axios";
import { OpenAPI } from "./api";
import Home from "./pages/Home";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import QuestionnaireBuilder from "./pages/admin/Questionnaire/QuestionnaireBuilder";
import LogicBuilder from "./pages/admin/LogicBuilder";
import VideoLibrary from "./pages/admin/VideoLibrary";
import AnalyticsDashboard from "./pages/admin/AnalyticsDashboard";
import AdminProfile from "./pages/admin/AdminProfile";


import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
      <Router>
        <Routes>
          <Route path="/" element={
            <div className="center">
              <Home />
            </div>}
          />
          <Route path="/admindashboard" element={<AdminDashboard />}>
            <Route path="/admindashboard/usermanagement" element={<UserManagement />} />
            <Route path="/admindashboard/questionnairebuilder" element={<QuestionnaireBuilder />} />
            <Route path="/admindashboard/videolibrary" element={<VideoLibrary />} />
            <Route path="/admindashboard/logicbuilder" element={<LogicBuilder />} />
            <Route path="/admindashboard/analyticsdashboard" element={<AnalyticsDashboard />} />
            <Route path="/admindashboard/adminprofile" element={<AdminProfile />} />
          </Route>
        </Routes>
      </Router>
    </Sentry.ErrorBoundary>

  );
};
//<Sentry.ErrorBoundary fallback={<p>ERROR</p>}>
//  <Home />
//</Sentry.ErrorBoundary>
export default App;
