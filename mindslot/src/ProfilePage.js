import React, { useEffect, useState } from "react";
import { auth, rtdb, ref, get, update } from "./firebaseConfig";
import { useNavigate } from "react-router-dom";
import "./ProfilePage.css";

const Profile = () => {
  const [userData, setUserData] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/login"); // Redirect to login if not authenticated
      return;
    }
    const userId = auth.currentUser.uid;
    const userRef = ref(rtdb, `users/${userId}`); // ✅ Correct RTDB reference

    get(userRef).then((snapshot) => {
      if (snapshot.exists()) {
        setUserData(snapshot.val());
      }
      setLoading(false);
    });
  }, [navigate]);

  const handleEdit = () => setEditMode(true);

  const handleSave = () => {
    const userId = auth.currentUser.uid;
    const userRef = ref(rtdb, `users/${userId}`); // ✅ Correct RTDB reference

    update(userRef, {
      name: userData.name,
      phone: userData.phone,
      regNumber: userData.regNumber,
    }).then(() => {
      setEditMode(false);
    });
  };

  return (
    <div className="profile-container">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="profile-card">
          <h2>Profile</h2>
          <div className="profile-info">
            <label>Name:</label>
            {editMode ? (
              <input
                type="text"
                value={userData.name}
                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
              />
            ) : (
              <p>{userData.name}</p>
            )}
          </div>

          <div className="profile-info">
            <label>Phone:</label>
            {editMode ? (
              <input
                type="text"
                value={userData.phone}
                onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
              />
            ) : (
              <p>{userData.phone}</p>
            )}
          </div>

          <div className="profile-info">
            <label>Reg Number:</label>
            {editMode ? (
              <input
                type="text"
                value={userData.regNumber}
                onChange={(e) => setUserData({ ...userData, regNumber: e.target.value })}
              />
            ) : (
              <p>{userData.regNumber}</p>
            )}
          </div>

          <div className="profile-info">
            <label>Email:</label>
            <p>{auth.currentUser.email}</p> {/* Email cannot be edited */}
          </div>

          <div className="profile-actions">
            {editMode ? (
              <button onClick={handleSave}>Save</button>
            ) : (
              <button onClick={handleEdit}>Edit</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
