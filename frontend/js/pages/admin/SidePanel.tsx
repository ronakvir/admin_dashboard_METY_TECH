import React, { Dispatch, SetStateAction, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import "../../../sass/_global.scss";
import { Questionnaire } from "./Questionnaire/QuestionnaireBuilder";
import { UsersService } from "../../api";
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
            await UsersService.usersLogoutCreate();
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            navigate("/");
        }
      };

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
    </>
  );
};

export default SidePanel;
