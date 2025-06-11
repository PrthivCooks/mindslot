import React from "react";
import { useNavigate } from "react-router-dom";
import "./Booking.css";

import buv from "../../assets/buv.png";
import maya from "../../assets/maya.png";
import VB from "../../assets/VB.png";

const counsellors = [
  {
    id: 1,
    name: "Ms. Bhuvaneswari S",
    venue: "AB1 1st Floor",
    contact: "9791142617",
    image: buv, // Replace with actual image path
  },
  {
    id: 2,
    name: "Dr. Maya R",
    venue: "AB2- 701 Physchometric Lab",
    contact: "9444333030",
    image: maya, // Replace with actual image path
  },
  {
    id: 3,
    name: "Dr. Vijayabhanu U",
    venue: "AB3 - Ground Floor",
    contact: "9791092232",
    image: VB, // Replace with actual image path
  },
];

const Booking = () => {
  const navigate = useNavigate();

  const handleSelect = (counsellorId) => {
    navigate(`/booking-grid/${counsellorId}`); // ✅ Navigates to booking grid with counsellor ID
  };

  return (
    <div className="booking-container">
      <h2 className="booking-title">Choose Your Counsellor</h2>
      <div className="counsellor-grid">
        {counsellors.map((counsellor) => (
          <div 
            key={counsellor.id} 
            className="counsellor-card" 
            onClick={() => handleSelect(counsellor.id)} // ✅ Click navigates to grid
          >
            <img src={counsellor.image} alt={counsellor.name} className="counsellor-image" />
            <h3>{counsellor.name}</h3>
            <p><strong>Venue:</strong> {counsellor.venue}</p>
            <p><strong>Contact:</strong> {counsellor.contact}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Booking;
