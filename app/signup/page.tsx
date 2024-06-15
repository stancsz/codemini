// app/signup/page.tsx
"use client";

import { useState } from "react";
import { auth } from "../../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import './signup.css';

const SignUpPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Redirect to dashboard or show signup success
    } catch (error) {
      console.error("Signup failed", error);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h1 className="signup-title">Sign Up</h1>
        <p className="signup-description">Welcome! Create an account to start using CodeMini.</p>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="Email"  
          className="signup-input"
        />
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Password" 
          className="signup-input"
        />
        <button onClick={handleSignUp} className="signup-button">Sign Up</button>
      </div>
    </div>
  );
};

export default SignUpPage;
