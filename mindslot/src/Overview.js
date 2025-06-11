import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Overview.css";

const features = [
  {
    id: 1,
    name: "Booking",
    description: "Schedule a session with our expert counselors.",
    image: require("./assets/booking.png"),
    hoverImage: require("./assets/bookinginvert.png"), // Inverted Image on Hover
    link: "/booking",
  },
  {
    id: 2,
    name: "Magazine",
    description: "Read and publish insightful articles and blogs.",
    image: require("./assets/magazine.png"),
    hoverImage: require("./assets/magazineinvert.png"), // Inverted Image on Hover
    link: "/magazine",
  },
  {
    id: 3,
    name: "Maria - AI Counselor",
    description: "Talk to our AI-powered counselor for guidance.",
    image: require("./assets/maria.png"),
    hoverImage: require("./assets/mariainvert.png"), // Inverted Image on Hover
    link: "/maria",
  },
];

const Overview = () => {
  const navigate = useNavigate();
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <div className="overview-container">
      {features.map((feature, index) => (
        <div
          key={feature.id}
          className={`feature-card ${hoveredIndex === index ? "hover-active" : ""}`}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          onClick={() => navigate(feature.link)}
        >
          <div className="feature-content">
            <img
              src={hoveredIndex === index ? feature.hoverImage : feature.image}
              alt={feature.name}
              className="feature-logo"
            />
            <h3 className="feature-title">{feature.name}</h3>
            <p className="feature-description">{feature.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Overview;
