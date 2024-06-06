// app/reset-password/page.tsx
"use client";

import { useState } from "react";
import { auth } from "../../firebase";
import { sendPasswordResetEmail } from "firebase/auth";

const ResetPasswordPage = () => {
  const [email, setEmail] = useState("");

  const handleResetPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      // Show reset link sent or success message
    } catch (error) {
      console.error("Reset password failed", error);
    }
  };

  return (
    <div>
      <h1>Reset Password</h1>
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        placeholder="Email" 
      />
      <button onClick={handleResetPassword}>Reset Password</button>
    </div>
  );
};

export default ResetPasswordPage;