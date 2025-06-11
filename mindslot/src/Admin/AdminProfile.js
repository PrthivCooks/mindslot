import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { rtdb, ref, get, set } from "../firebaseConfig";
import "./AdminProfile.css";

const AdminProfile = () => {
  const { counsellorId, regNumber } = useParams();
  const navigate = useNavigate();
  const [searchRegNumber, setSearchRegNumber] = useState("");
  const [userData, setUserData] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [sessionDate, setSessionDate] = useState("");
  const [sessionTimeStart, setSessionTimeStart] = useState("");
  const [sessionTimeEnd, setSessionTimeEnd] = useState("");
  const [sessionReason, setSessionReason] = useState("");
  const [sessionNotes, setSessionNotes] = useState("");
  const [supportLevel, setSupportLevel] = useState(1);
  const [visitReasons, setVisitReasons] = useState([]);
  const [otherReason, setOtherReason] = useState("");

  useEffect(() => {
    if (regNumber) {
      fetchAllUsers(regNumber);
      fetchUserSessions(regNumber);
    }
  }, [regNumber]);

  // ✅ Fetch all users & match regNumber
  const fetchAllUsers = async (regNo) => {
    try {
      const snapshot = await get(ref(rtdb, `users`));
      if (snapshot.exists()) {
        const users = snapshot.val();
        const matchedUser = Object.values(users).find(user => user.regNumber === regNo);
        if (matchedUser) {
          setUserData({
            name: matchedUser.name || "No Name Available",
            regNumber: regNo,
            email: matchedUser.email || "No Email Provided",
            phone: matchedUser.phone || "No Phone Number",
          });
        } else {
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUserData(null);
    }
  };

  // ✅ Fetch User Sessions
  const fetchUserSessions = async (regNo) => {
    try {
      const snapshot = await get(ref(rtdb, `users/${regNo}/sessions/${counsellorId}`));
      if (snapshot.exists()) {
        setSessions(Object.values(snapshot.val()));
      } else {
        setSessions([]);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
      setSessions([]);
    }
  };

  // ✅ Handle Search & Navigate
  const handleSearch = () => {
    if (!searchRegNumber) {
      alert("Please enter a registration number.");
      return;
    }
    navigate(`/admin-profiles/${counsellorId}/${searchRegNumber}`);
  };

  // ✅ Handle Saving Session Details
  const handleSaveSession = async () => {
    if (!sessionDate || !sessionTimeStart || !sessionTimeEnd || !sessionReason || !sessionNotes || visitReasons.length === 0) {
      alert("Please fill all fields before saving.");
      return;
    }

    const sessionKey = Date.now().toString();
    const sessionRef = ref(rtdb, `users/${regNumber}/sessions/${counsellorId}/${sessionKey}`);

    try {
      const sessionData = {
        id: sessionKey,
        date: sessionDate,
        time: `${sessionTimeStart} - ${sessionTimeEnd}`,
        reason: sessionReason,
        notes: sessionNotes,
        supportLevel,
        visitReason: visitReasons.includes("Others")
          ? `${visitReasons.join(", ")}: ${otherReason}`
          : visitReasons.join(", "),
        otherReason: visitReasons.includes("Others") ? otherReason : "",
        timestamp: new Date().toISOString(),
      };

      await set(sessionRef, sessionData);

      setSessions((prev) => [sessionData, ...prev]);
      setSessionDate("");
      setSessionTimeStart("");
      setSessionTimeEnd("");
      setSessionReason("");
      setSessionNotes("");
      setSupportLevel(1);
      setVisitReasons([]);
      setOtherReason("");

      alert("Session details saved successfully!");
    } catch (error) {
      console.error("Error saving session:", error);
    }
  };

  return (
    <div className="admin-profile-container">
      <h2>Admin - User Profile</h2>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Enter Registration Number"
          value={searchRegNumber}
          onChange={(e) => setSearchRegNumber(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {/* ✅ User Details - Now Fetching Properly */}
      {regNumber && userData ? (
        <div className="user-info">
          <h3>{userData.name}</h3>
          <p><strong>Registration No:</strong> {userData.regNumber}</p>
          <p><strong>Phone:</strong> {userData.phone}</p>
          <p><strong>Email:</strong> {userData.email}</p>
          <p><strong>Sessions Attended:</strong> {sessions.length}</p>
        </div>
      ) : (
        <p>No user found with this registration number.</p>
      )}

      {/* ✅ Sessions Table */}
      {regNumber && (
        <>
          <h3>Session History</h3>
          <table className="session-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Reason</th>
                <th>Notes</th>
                <th>Support Level</th>
                <th>Visit Type</th>
              </tr>
            </thead>
            <tbody>
              {sessions.length > 0 ? (
                sessions.map((session, index) => (
                  <tr key={session.id}>
                    <td>{session.date}</td>
                    <td>{session.time}</td>
                    <td>{session.reason}</td>
                    <td>{session.notes}</td>
                    <td>{session.supportLevel}</td>
                    <td>{session.visitReason}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No sessions found</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* ✅ New Session Input */}
          <h3>Record New Session</h3>
          <div className="new-session">
            <input type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} />
            <input type="time" value={sessionTimeStart} onChange={(e) => setSessionTimeStart(e.target.value)} />
            <input type="time" value={sessionTimeEnd} onChange={(e) => setSessionTimeEnd(e.target.value)} />
            <input type="text" placeholder="Reason of Arrival" value={sessionReason} onChange={(e) => setSessionReason(e.target.value)} />
            <textarea placeholder="Session Notes" value={sessionNotes} onChange={(e) => setSessionNotes(e.target.value)} />
            
            {/* Support Level */}
            <div className="support-level">
              {[1, 2, 3, 4, 5].map(level => (
                <span key={level} className={`star ${supportLevel >= level ? "selected" : ""}`} onClick={() => setSupportLevel(level)}>★</span>
              ))}
            </div>

            {/* Visit Reason */}
            <div className="visit-reason">
              {["Academic", "Career", "Relationship", "Sexual Problems", "Self-harm", "Placements", "Depression", "Others"].map((reason) => (
                <label key={reason}>
                  <input type="checkbox" checked={visitReasons.includes(reason)} onChange={() => setVisitReasons(prev => prev.includes(reason) ? prev.filter(r => r !== reason) : [...prev, reason])} />
                  {reason}
                </label>
              ))}
              {visitReasons.includes("Others") && <input type="text" placeholder="Specify Other Reason" value={otherReason} onChange={(e) => setOtherReason(e.target.value)} />}
            </div>

            <button onClick={handleSaveSession}>Save Session</button>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminProfile;
