import React, { useState } from "react";
import AdminManagement from "./AdminManagement";

const UserManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'admin-management'>('users');

  return (
    <div className="user-management">
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button 
          className={`tab ${activeTab === 'admin-management' ? 'active' : ''}`}
          onClick={() => setActiveTab('admin-management')}
        >
          Admin Management
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'users' && (
          <div className="users-tab">
            <h3>User Management</h3>
            <p>User management functionality will be implemented here.</p>
          </div>
        )}
        
        {activeTab === 'admin-management' && (
          <AdminManagement />
        )}
      </div>

      <style>{`
        .user-management {
          padding: 20px;
        }

        .tabs {
          display: flex;
          border-bottom: 1px solid #ddd;
          margin-bottom: 20px;
        }

        .tab {
          padding: 10px 20px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          color: #666;
          border-bottom: 2px solid transparent;
          transition: all 0.3s ease;
        }

        .tab:hover {
          color: #333;
          background-color: #f8f9fa;
        }

        .tab.active {
          color: #007bff;
          border-bottom-color: #007bff;
          font-weight: bold;
        }

        .tab-content {
          min-height: 400px;
        }

        .users-tab {
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .users-tab h3 {
          margin-top: 0;
          color: #333;
        }

        .users-tab p {
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default UserManagement;
