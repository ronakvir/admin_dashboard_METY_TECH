import React, { useState, useEffect } from "react";
import { AdminInvitesService, UsersService, CurrentUserService } from "../../api";
import type { AdminInvite, User } from "../../api/types.gen";

const AdminManagement: React.FC = () => {
  const [invites, setInvites] = useState<AdminInvite[]>([]);
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<'invites' | 'users'>('invites');

  // Fetch data on component mount
  useEffect(() => {
    fetchInvites();
    fetchAdminUsers();
    fetchCurrentUser();
  }, []);

  const fetchInvites = async () => {
    try {
      setLoading(true);
      const response = await AdminInvitesService.adminInvitesList();
      setInvites(response.results || []);
    } catch (error) {
      console.error("Failed to fetch invites:", error);
      setMessage("Failed to fetch invites");
    } finally {
      setLoading(false);
    }
  };

  const createInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    try {
      setLoading(true);
      await AdminInvitesService.adminInvitesCreateCreate({
        requestBody: { email: newEmail }
      });
      setMessage("Invite created successfully!");
      setNewEmail("");
      fetchInvites(); // Refresh the list
    } catch (error: any) {
      console.error("Failed to create invite:", error);
      setMessage(error.response?.data?.detail || "Failed to create invite");
    } finally {
      setLoading(false);
    }
  };

  const disableInvite = async (inviteId: number) => {
    try {
      setLoading(true);
      await AdminInvitesService.adminInvitesPartialUpdate({
        id: inviteId,
        requestBody: { is_active: false }
      });
      setMessage("Invite disabled successfully!");
      fetchInvites(); // Refresh the list
    } catch (error) {
      console.error("Failed to disable invite:", error);
      setMessage("Failed to disable invite");
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = (token: string) => {
    const baseUrl = window.location.origin;
    const inviteLink = `${baseUrl}/register?token=${token}`;
    navigator.clipboard.writeText(inviteLink);
    setMessage("Invite link copied to clipboard!");
  };

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setMessage("Token copied to clipboard!");
  };

  const fetchAdminUsers = async () => {
    try {
      setLoading(true);
      const response = await UsersService.usersList();
      setAdminUsers(response.results || []);
    } catch (error) {
      console.error("Failed to fetch admin users:", error);
      setMessage("Failed to fetch admin users");
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await CurrentUserService.currentUserRetrieve();
      setCurrentUser(response);
    } catch (error) {
      console.error("Failed to fetch current user:", error);
    }
  };

  const toggleAdminStatus = async (userId: number, isActive: boolean, userEmail: string) => {
    // Check if user is trying to disable themselves
    if (!isActive && currentUser && currentUser.email === userEmail) {
      setMessage("You cannot disable your own account");
      return;
    }

    try {
      setLoading(true);
      await UsersService.usersPartialUpdate({
        id: userId,
        requestBody: { is_active: isActive }
      });
      setMessage(`Admin user ${isActive ? 'enabled' : 'disabled'} successfully!`);
      fetchAdminUsers(); // Refresh the list
    } catch (error: any) {
      console.error("Failed to toggle admin status:", error);
      setMessage(error.response?.data?.detail || "Failed to toggle admin status");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="admin-management">
      <h2>Admin Management</h2>
      
      {message && (
        <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'invites' ? 'active' : ''}`}
          onClick={() => setActiveTab('invites')}
        >
          Admin Invites
        </button>
        <button 
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Admin Users
        </button>
      </div>

      {/* Admin Invites Tab */}
      {activeTab === 'invites' && (
        <>
          {/* Create New Invite */}
          <div className="create-invite-section">
        <h3>Create New Invite</h3>
        <form onSubmit={createInvite}>
          <div>
            <label htmlFor="email">Email Address:</label>
            <input
              type="email"
              id="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Enter email address"
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Invite"}
          </button>
        </form>
      </div>

      {/* Invites List */}
      <div className="invites-section">
        <h3>Admin Invites</h3>
        {loading ? (
          <p>Loading...</p>
        ) : invites.length === 0 ? (
          <p>No invites found</p>
        ) : (
          <div className="invites-table">
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Invited By</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Used At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invites.map((invite) => (
                  <tr key={invite.id}>
                    <td>{invite.email}</td>
                    <td>{invite.invited_by_email}</td>
                    <td>
                      <span className={`status ${invite.is_active ? 'active' : 'inactive'}`}>
                        {invite.is_active ? 'Active' : 'Used/Disabled'}
                      </span>
                    </td>
                    <td>{new Date(invite.created).toLocaleDateString()}</td>
                    <td>
                      {invite.used_at 
                        ? new Date(invite.used_at).toLocaleDateString()
                        : '-'
                      }
                    </td>
                    <td>
                      {invite.is_active && (
                        <div className="action-buttons">
                          <button 
                            onClick={() => copyInviteLink(invite.token)}
                            className="btn-copy"
                          >
                            Copy Link
                          </button>
                          <button 
                            onClick={() => copyToken(invite.token)}
                            className="btn-copy-token"
                          >
                            Copy Token
                          </button>
                          <button 
                            onClick={() => disableInvite(invite.id)}
                            className="btn-disable"
                          >
                            Disable
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
        </>
      )}

      {/* Admin Users Tab */}
      {activeTab === 'users' && (
        <div className="admin-users-section">
          <h3>Admin Users</h3>
          {loading ? (
            <p>Loading...</p>
          ) : adminUsers.length === 0 ? (
            <p>No admin users found</p>
          ) : (
            <div className="admin-users-table">
              <table>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Superuser</th>
                    <th>Created</th>
                    <th>Last Login</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.email}</td>
                      <td>
                        <span className={`status ${user.is_active ? 'active' : 'inactive'}`}>
                          {user.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td>
                        <span className={`status ${user.is_superuser ? 'superuser' : 'regular'}`}>
                          {user.is_superuser ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td>{new Date(user.created).toLocaleDateString()}</td>
                      <td>
                        {user.last_login 
                          ? new Date(user.last_login).toLocaleDateString()
                          : 'Never'
                        }
                      </td>
                      <td>
                        <button 
                          onClick={() => toggleAdminStatus(user.id, !user.is_active, user.email)}
                          className={`btn-toggle ${user.is_active ? 'btn-disable' : 'btn-enable'}`}
                          disabled={loading || user.is_superuser || (currentUser && currentUser.email === user.email && user.is_active === true) || false}
                          title={
                            user.is_superuser 
                              ? "Super admin users cannot be disabled" 
                              : (currentUser && currentUser.email === user.email && user.is_active === true)
                                ? "You cannot disable your own account"
                                : ""
                          }
                        >
                          {user.is_active ? 'Disable' : 'Enable'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <style>{`
        .admin-management {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .message {
          padding: 10px;
          margin: 10px 0;
          border-radius: 4px;
        }

        .message.success {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .message.error {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .tab-navigation {
          display: flex;
          margin-bottom: 20px;
          border-bottom: 1px solid #ddd;
        }

        .tab-button {
          padding: 10px 20px;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          font-size: 16px;
          color: #666;
        }

        .tab-button.active {
          color: #007bff;
          border-bottom-color: #007bff;
        }

        .tab-button:hover {
          color: #007bff;
        }

        .create-invite-section {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }

        .create-invite-section form {
          display: flex;
          gap: 10px;
          align-items: end;
        }

        .create-invite-section form > div {
          flex: 1;
        }

        .create-invite-section label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }

        .create-invite-section input {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .create-invite-section button {
          padding: 8px 16px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .create-invite-section button:disabled {
          background-color: #6c757d;
          cursor: not-allowed;
        }

        .invites-section {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
        }

        .invites-section h3 {
          margin: 0;
          padding: 20px;
          background-color: #f8f9fa;
          border-bottom: 1px solid #ddd;
        }

        .invites-table {
          overflow-x: auto;
        }

        .invites-table table {
          width: 100%;
          border-collapse: collapse;
        }

        .invites-table th,
        .invites-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }

        .invites-table th {
          background-color: #f8f9fa;
          font-weight: bold;
        }

        .invites-table th:last-child,
        .invites-table td:last-child {
          width: 200px;
          min-width: 200px;
          white-space: nowrap;
        }

        .invites-table td:last-child {
          text-align: center;
        }

        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 4px;
          align-items: center;
        }

        .status {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
        }

        .status.active {
          background-color: #d4edda;
          color: #155724;
        }

        .status.inactive {
          background-color: #f8d7da;
          color: #721c24;
        }

        .status.superuser {
          background-color: #d1ecf1;
          color: #0c5460;
        }

        .status.regular {
          background-color: #e2e3e5;
          color: #383d41;
        }

        .btn-copy,
        .btn-copy-token,
        .btn-disable,
        .btn-toggle,
        .btn-enable {
          padding: 4px 8px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }

        .action-buttons .btn-copy,
        .action-buttons .btn-copy-token,
        .action-buttons .btn-disable {
          margin-right: 0;
        }

        .btn-copy {
          background-color: #28a745;
          color: white;
        }

        .btn-copy-token {
          background-color: #17a2b8;
          color: white;
        }

        .btn-disable {
          background-color: #dc3545;
          color: white;
        }

        .btn-enable {
          background-color: #28a745;
          color: white;
        }

        .btn-toggle:disabled {
          background-color: #6c757d;
          color: #fff;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .btn-copy:hover,
        .btn-copy-token:hover,
        .btn-disable:hover,
        .btn-toggle:hover,
        .btn-enable:hover {
          opacity: 0.8;
        }

        .admin-users-section {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
        }

        .admin-users-section h3 {
          margin: 0;
          padding: 20px;
          background-color: #f8f9fa;
          border-bottom: 1px solid #ddd;
        }

        .admin-users-table {
          overflow-x: auto;
        }

        .admin-users-table table {
          width: 100%;
          border-collapse: collapse;
        }

        .admin-users-table th,
        .admin-users-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }

        .admin-users-table th {
          background-color: #f8f9fa;
          font-weight: bold;
        }

        .admin-users-table th:last-child,
        .admin-users-table td:last-child {
          width: 120px;
          min-width: 120px;
          white-space: nowrap;
        }

        .admin-users-table td:last-child {
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default AdminManagement;
