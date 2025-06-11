import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, rtdb, createUserWithEmailAndPassword, sendEmailVerification, set, ref } from "./firebaseConfig";
import { updateProfile } from "firebase/auth";
import "./Signup.css";

const Signup = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!email.endsWith("@vit.ac.in") && !email.endsWith("@vitstudent.ac.in")) {
      setError("Only VIT emails (@vit.ac.in / @vitstudent.ac.in) are allowed.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);

      await updateProfile(userCredential.user, { displayName: name });

      // ✅ Always set role as "user"
      const userId = userCredential.user.uid;
      await set(ref(rtdb, `users/${userId}`), {
        name,
        phone,
        regNumber,
        email,
        role: "user", // 🚀 Fixed Role as "user"
        counsellorId: null, // 🚀 No admin privileges assigned
      });

      setMessage("Verification email sent! Please check your inbox.");
    } catch (err) {
      setError("Signup failed. Please check your details.");
    }
  };

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      {error && <p className="error-text">{error}</p>}
      {message && <p className="success-text">{message}</p>}
      <form onSubmit={handleSignup}>
        <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="text" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        <input type="text" placeholder="Registration Number" value={regNumber} onChange={(e) => setRegNumber(e.target.value)} required />
        <input type="email" placeholder="VIT Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <button type="submit">Sign Up</button>
      </form>
      <p>Already have an account? <a href="/login">Login</a></p>
    </div>
  );
};

export default Signup;
