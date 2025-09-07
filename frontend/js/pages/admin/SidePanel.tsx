import React from "react";
import { useNavigate } from "react-router-dom";
import "../../../sass/_global.scss";
import { ApiService, ResetalldataService } from "../../api/services.gen";

const SidePanel: React.FC = () => {
    const navigate = useNavigate();
    const UserManagement = () => {
        navigate("/dashboard/usermanagement")
    }
    const QuestionnaireBuilder = () => {
        navigate("/dashboard/questionnairebuilder")
    }
    const VideoLibrary = () => {
        navigate("/dashboard/videolibrary")
    }
    const LogicBuilder = () => {
        navigate("/dashboard/logicbuilder")
    }
    const AnalyticsDashboard = () => {
        navigate("/dashboard/analyticsdashboard")
    }
    const AdminProfile = () => {
        navigate("/dashboard/adminprofile")
    }
    const ApiKeyManagement = () => {
        navigate("/dashboard/apikeys")
    }

    const handleLogout = async () => {
        try {
            await ApiService.apiLogoutCreate();
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            navigate("/");
        }
      };

    
    const devResetDatabaseData = () => {
        if (!confirm("This will delete all current database data, and reset it with new baseline data (used for testing). Are you sure you would like to do this?")) return
        ResetalldataService.resetalldataCreate()
            .then( response => {
                console.log(response)
            })
            .catch( error => console.log(error) )
    }

      
    return (
        <nav className="sidebar-nav">
            <div className="nav-section">
                <h3 className="nav-section-title">Navigation</h3>
                <ul className="nav-list">
                    <li><button className="nav-item" onClick={UserManagement}>User Management</button></li>
                    <li><button className="nav-item" onClick={QuestionnaireBuilder}>Questionnaire Builder</button></li>
                    <li><button className="nav-item" onClick={VideoLibrary}>Fitness Video Library</button></li>
                    <li><button className="nav-item" onClick={LogicBuilder}>Logic Builder</button></li>
                    <li><button className="nav-item" onClick={AnalyticsDashboard}>Analytics Dashboard</button></li>
                    <li><button className="nav-item" onClick={ApiKeyManagement}>API Key Management</button></li>
                    <li><button className="nav-item" onClick={AdminProfile}>Admin Profile</button></li>
                </ul>
            </div>
            
            <div className="nav-section">
                <h3 className="nav-section-title">Account</h3>
                <ul className="nav-list">
                    <li><button className="nav-item nav-item-logout" onClick={handleLogout}>Logout</button></li>
                </ul>
            </div>
            
            <div className="nav-section nav-section-dev">
                <h3 className="nav-section-title">Development</h3>
                <ul className="nav-list">
                    <li><button className="nav-item nav-item-dev" onClick={devResetDatabaseData}>Reset Database</button></li>
                </ul>
            </div>
        </nav>
    );
};

export default SidePanel;
