// app/reset-password/page.tsx
"use client";

import { useState } from "react";
import { auth } from "../../firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import './reset-password.css';

const ResetPasswordPage = () => {
  const [email, setEmail] = useState("");

  const handleResetPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      // Show reset link sent or success message
      alert('Password reset link sent! Please check your email.');
    } catch (error) {
      console.error("Reset password failed", error);
      alert('Failed to send password reset link. Please try again.');
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <h1 className="reset-password-title">Reset Password</h1>
        <p className="reset-password-description">Enter your email address to receive a link to reset your password.</p>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="Email" 
          className="reset-password-input"
        />
        <button onClick={handleResetPassword} className="reset-password-button">Reset Password</button>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
