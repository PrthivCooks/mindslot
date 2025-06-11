import React, { useState } from "react";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState("");

  const handleAddReview = () => {
    if (newReview.trim() !== "") {
      setReviews([...reviews, newReview]);
      setNewReview("");
    }
  };

  return (
    <div className="page-container">
      <h2>Reviews</h2>
      <div className="review-input">
        <textarea
          value={newReview}
          onChange={(e) => setNewReview(e.target.value)}
          placeholder="Write your review here..."
        ></textarea>
        <button onClick={handleAddReview}>Submit</button>
      </div>
      <div className="reviews-list">
        {reviews.length > 0 ? (
          reviews.map((review, index) => <p key={index} className="review-item">{review}</p>)
        ) : (
          <p>No reviews yet.</p>
        )}
      </div>
    </div>
  );
}
