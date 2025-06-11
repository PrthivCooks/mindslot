import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./AdminHome.css";

// ✅ Import images correctly
import appointmentIcon from "../assets/appointment.png";
import appointmentHover from "../assets/appointment.png";
import analysisIcon from "../assets/analysis.png";
import analysisHover from "../assets/analysis.png";
import profilesIcon from "../assets/profile.png";
import profilesHover from "../assets/profile.png";

const tools = [
  {
    id: "appointments",
    title: "Manage Appointments",
    description: "View, manage, and modify upcoming and past bookings.",
    image: appointmentIcon,
    imageHover: appointmentHover,
    route: "/admin-appointments"
  },
  {
    id: "analysis",
    title: "Analysis & Reports",
    description: "Generate insights on appointment trends and user statistics.",
    image: analysisIcon,
    imageHover: analysisHover,
    route: "/admin-analysis"
  },
  {
    id: "profiles",
    title: "User Profiles",
    description: "Access user profiles, session notes, and history.",
    image: profilesIcon,
    imageHover: profilesHover,
    route: "/admin-profiles"
  }
];

const AdminHome = () => {
  const navigate = useNavigate();
  const { counsellorId } = useParams(); // ✅ Extract the logged-in admin's assigned counsellor ID

  return (
    <div className="admin-home-container">
      <h2>Admin Dashboard</h2>
      <p>Welcome! Select a tool below to manage counselling activities.</p>

      <div className="admin-tools">
        {tools.map((tool) => (
          <div
            key={tool.id}
            className="admin-tool"
            onClick={() => navigate(`${tool.route}/${counsellorId}`)} // ✅ Pass counsellorId to ensure proper data access
          >
            <img
              src={tool.image}
              alt={tool.title}
              className="tool-image"
              onMouseOver={(e) => (e.currentTarget.src = tool.imageHover)}
              onMouseOut={(e) => (e.currentTarget.src = tool.image)}
            />
            <h3>{tool.title}</h3>
            <p>{tool.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminHome;
