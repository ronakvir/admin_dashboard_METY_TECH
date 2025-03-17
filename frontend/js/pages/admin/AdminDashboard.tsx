import React, { useState } from "react";
import SidePanel from "./SidePanel"

import { Outlet, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "../../../sass/_global.scss";

const AdminDashboard: React.FC = () => {


  return (
  <div className="container">
    <p className="topPanel">Admin Dashboard</p>
    <div className="notTopPanel">
      <aside className="sidePanel">
        <SidePanel />
      </aside>
      <section className="mainContent">
        <Outlet />
      </section>
    </div>
  </div>
  )
}

export default AdminDashboard;
