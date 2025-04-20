import React, { Dispatch, SetStateAction, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import "../../../sass/_global.scss";
import { ApiService, DevService } from "../../api/services.gen";

interface QuestionnaireStates {
    sidePanel: boolean; setSidePanel: Dispatch<SetStateAction<boolean>>;

}
const SidePanel: React.FC<QuestionnaireStates> = ({sidePanel, setSidePanel}) => {
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
        DevService.resetData()
            .then( response => {
                console.log(response)
            })
            .catch( error => console.log(error) )
    }

      
    return (
        <>
            <p>Navigation</p><br/>
            <button className="navButton" onClick={UserManagement}>User Management</button><br/>
            <button className="navButton" onClick={QuestionnaireBuilder}>Questionnaire Builder</button>
            <button className="navButton" onClick={VideoLibrary}>Fitness Video Library</button>
            <button className="navButton" onClick={LogicBuilder}>Logic Builder</button>
            <button className="navButton" onClick={AnalyticsDashboard}>Analytics Dashboard</button>
            <button className="navButton" onClick={AdminProfile}>Admin Profile</button>
            <button className="navButton" onClick={handleLogout}>Logout</button>
            <hr/>
            <label>Dev Tool</label>
            <button className="navButton" onClick={devResetDatabaseData}>Reset Database</button>
        </>
    );
};

export default SidePanel;
