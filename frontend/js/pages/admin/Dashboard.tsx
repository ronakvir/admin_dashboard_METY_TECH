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
    <h1 className="topPanel">Admin Dashboard</h1>
    <div style={{ display: 'flex', height: '100vh' }}>
      <div 
        id="sidePanel" 
        style={{
          width: sidePanel ? "250px" : "0",
          transition: "width 0.5s", 
          zIndex: "1",
          position: "fixed",
          overflowX: "hidden"
          
        }}>
        <SidePanel sidePanel={sidePanel} setSidePanel={setSidePanel} />
      </div>
      <div style={{
        flex: "1",
        transition: "margin-left 0.5s ease",
        marginLeft: sidePanel ? "250px" : "0"
      }}>
        <Outlet />
      </div>
    </div>
  </div>
  )
}

export default Dashboard;
