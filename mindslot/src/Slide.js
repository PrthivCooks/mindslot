import React, { useState, useEffect } from "react";
import "./Slider.css";

// Import images (Ensure these files exist in your assets folder)
import image1 from "./assets/1.png";
import image2 from "./assets/2.png";
import image3 from "./assets/3.png";


const images = [image1, image2, image3];

const Slider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 2000); // 2 seconds gap

    return () => clearInterval(interval);
  }, [currentIndex]);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  return (
    <div className="slider-container">
      <div
        className="slider-wrapper"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <div key={index} className="slide">
            <img src={image} alt={`Slide ${index}`} className="slider-image" />
          </div>
        ))}
      </div>
      <button className="slider-btn left" onClick={handlePrev}>
        &#10094;
      </button>
      <button className="slider-btn right" onClick={handleNext}>
        &#10095;
      </button>
    </div>
  );
};

export default Slider;
