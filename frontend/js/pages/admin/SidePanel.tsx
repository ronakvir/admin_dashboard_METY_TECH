import React from "react";
import { useNavigate } from "react-router-dom";
import "../../../sass/_global.scss";
import { ApiService, ResetalldataService, SeeddataService } from "../../api/services.gen";

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

    
    const devResetDatabase = () => {
        if (!confirm("This will delete all current database data. Are you sure you would like to do this?")) return
        ResetalldataService.resetalldataCreate()
            .then( response => {
                console.log(response)
                alert("Database reset successfully!")
                window.location.reload()
            })
            .catch( error => {
                console.log(error)
                alert("Error resetting database: " + (error.message || "Unknown error"))
            })
    }

    const devSeedDatabase = () => {
        if (!confirm("This will seed the database with sample data. Database must be empty. Are you sure you would like to do this?")) return
        SeeddataService.seeddataCreate()
            .then( response => {
                console.log(response)
                alert("Database seeded successfully!")
                window.location.reload()
            })
            .catch( error => {
                console.log(error)
                alert("Error seeding database: " + (error.message || "Unknown error"))
            })
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
                    <li><button className="nav-item" onClick={ApiKeyManagement}>API Key Management</button></li>
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
                    <li><button className="nav-item nav-item-dev" onClick={devResetDatabase}>Reset Database</button></li>
                    <li><button className="nav-item nav-item-dev" onClick={devSeedDatabase}>Seed Database</button></li>
                </ul>
            </div>
        </nav>
    );
};

export default SidePanel;
