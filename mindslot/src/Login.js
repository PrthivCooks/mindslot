import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, rtdb, signInWithEmailAndPassword, ref, get } from "./firebaseConfig";
import { sendPasswordResetEmail } from "firebase/auth";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.endsWith("@vit.ac.in") && !email.endsWith("@vitstudent.ac.in")) {
      setError("Only VIT emails (@vit.ac.in / @vitstudent.ac.in) are allowed.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // ✅ Fetch role & counselor ID from Firebase
      const userRef = ref(rtdb, `users/${user.uid}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        const userData = snapshot.val();
        const role = userData.role; // ✅ Role assigned manually in Firebase
        const counsellorId = userData.counsellorId; // ✅ Counsellor ID assigned manually

        // ✅ Redirect based on role
        if (role?.startsWith("admin")) {
          navigate(`/admin-home/${counsellorId}`); // ✅ Admin goes to AdminHome
        } else {
          navigate("/booking"); // ✅ Normal users go to Booking Page
        }
      } else {
        setError("User data not found. Contact admin.");
      }
    } catch (err) {
      setError("Login failed. Please check your email & password.");
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setResetMessage("Enter your email to reset password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetMessage("Password reset email sent! Check your inbox.");
    } catch (err) {
      setResetMessage("Failed to send reset email. Try again.");
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <p className="error-text">{error}</p>}
      {resetMessage && <p className="reset-text">{resetMessage}</p>}
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="VIT Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Login</button>
      </form>
      <p className="forgot-password" onClick={handleForgotPassword}>Forgot Password?</p>
      <p>New user? <a href="/signup">Sign Up</a></p>
    </div>
  );
};

export default Login;
