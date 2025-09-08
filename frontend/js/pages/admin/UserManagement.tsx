import React from "react";
import AdminManagement from "./AdminManagement";

const UserManagement: React.FC = () => {
  return (
    <div className="user-management">
      <AdminManagement />
      <style>{`
        .user-management {
          padding: 20px;
        }
      `}</style>
    </div>
  );
};

export default UserManagement;
