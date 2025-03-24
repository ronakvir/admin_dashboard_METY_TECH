import React, { useState } from "react";
import SidePanel from "./SidePanel"

import { Outlet, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "../../../sass/_global.scss";

const Dashboard: React.FC = () => {
  const [sidePanel, setSidePanel] = useState(true);
  const toggleSidePanel = () => {
    if (sidePanel) {
      setSidePanel(false);
    }
    else setSidePanel(true);
  }

  return (
  <div className="container">
    <button className="" onClick={toggleSidePanel}>Toggle Side Panel</button>
    <p className="topPanel">Admin Dashboard</p>
    <div className="notTopPanel">
      <aside 
        id="sidePanel" 
        className="sidePanel" 
        style={{transition: "transform 0.3s", transform: sidePanel ? "translateX(0)" : "translateX(-150%)"}}>
        <SidePanel />
      </aside>
      <section style={{}}>
        <Outlet />
      </section>
    </div>
  </div>
  )
}

export default Dashboard;
