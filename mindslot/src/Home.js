import React from "react";
import Slider from "./Slide";
import Overview from "./Overview";
import "./Home.css"; // Import the styles specific to the Home page

const Home = () => {
  return (
    <div className="home-container">
      {/* Slider Section */}
      <div className="slider-wrapper">
        <Slider />
      </div>

      {/* Overview Section */}
      <div className="overview-wrapper">
        <Overview />
      </div>
    </div>
  );
};

export default Home;
