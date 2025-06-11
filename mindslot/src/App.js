import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, useParams, useLocation } from "react-router-dom";
import { auth, rtdb, ref, get } from "./firebaseConfig";
import Header from "./Header";
import HomePage from "./Home";
import Login from "./Login";
import Signup from "./Signup";
import Booking from "./User/Booking/Booking";
import BookingGrid from "./User/Booking/BookingGrid";
import Profile from "./ProfilePage";
import AdminHome from "./Admin/AdminHome";
import AdminAppointments from "./Admin/AdminAppointments"; 
import AdminAnalysis from "./Admin/AdminAnalysis"; 
import AdminProfiles from "./Admin/AdminProfile";
import "./App.css";
import AnalysisPage from "./Admin/AdminAnalysis";


function BookingGridWrapper() {
  const { counsellorId } = useParams();
  return <BookingGrid counsellorId={counsellorId} />;
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null); // Stores user role (admin1/admin2/admin3/user)
  const [counsellorId, setCounsellorId] = useState(null); // Stores assigned counsellor ID

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch role and counsellorId from database
        const userRef = ref(rtdb, `users/${currentUser.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setRole(userData.role);
          if (userData.role === "admin1") setCounsellorId(1);
          if (userData.role === "admin2") setCounsellorId(2);
          if (userData.role === "admin3") setCounsellorId(3);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <Router>
      <AppContent user={user} role={role} counsellorId={counsellorId} />
    </Router>
  );
}

function AppContent({ user, role, counsellorId }) {
  const location = useLocation(); // ✅ Now inside Router, so no errors

  // ✅ Redirect Admins to AdminHome ONLY if they haven't navigated away
  if (user && role?.startsWith("admin") && !location.pathname.includes("/admin-")) {
    return <Navigate to={`/admin-home/${counsellorId}`} />;
  }

  return (
    <>
      {/* ✅ Hide Header for Admins */}
      <Header />
      <div className="app-content">
      <Routes>
  {/* User Routes */}
  <Route path="/" element={<HomePage />} />
  <Route path="/booking" element={user && !role?.startsWith("admin") ? <Booking /> : <Navigate to="/login" />} />
  <Route path="/booking-grid/:counsellorId" element={user && !role?.startsWith("admin") ? <BookingGridWrapper /> : <Navigate to="/login" />} />
  <Route path="/profile" element={user && !role?.startsWith("admin") ? <Profile /> : <Navigate to="/login" />} />
 

  {/* Admin Routes */}
  <Route path="/admin-home/:counsellorId" element={user && role?.startsWith("admin") ? <AdminHome /> : <Navigate to="/login" />} />
  <Route path="/admin-appointments/:counsellorId" element={user && role?.startsWith("admin") ? <AdminAppointments /> : <Navigate to="/login" />} />
  <Route path="/admin-analysis/:counsellorId" element={user && role?.startsWith("admin") ? <AdminAnalysis /> : <Navigate to="/login" />} />
  <Route path="/admin-profiles/:counsellorId" element={user && role?.startsWith("admin") ? <AdminProfiles /> : <Navigate to="/login" />} />
  <Route path="/admin-profiles/:counsellorId/:regNumber" element={user && role?.startsWith("admin") ? <AdminProfiles /> : <Navigate to="/login" />} />
  <Route path="/admin-analysis" element={user && role?.startsWith("admin") ? <AnalysisPage /> : <Navigate to="/login" />} />

  {/* Auth Routes */}
  <Route path="/login" element={user ? <Navigate to={role?.startsWith("admin") ? `/admin-home/${counsellorId}` : "/booking"} /> : <Login />} />
  <Route path="/signup" element={user ? <Navigate to={role?.startsWith("admin") ? `/admin-home/${counsellorId}` : "/booking"} /> : <Signup />} />
</Routes>

      </div>
    </>
  );
}

export default App;
