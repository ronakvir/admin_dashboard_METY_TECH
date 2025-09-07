import React from "react";
import SidePanel from "./SidePanel"
import { Outlet } from "react-router-dom";
import "../../../sass/_global.scss";

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Admin Dashboard</h1>
      </header>
      <div className="dashboard-layout">
        <aside className="sidebar">
          <SidePanel />
        </aside>
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Dashboard;
