// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { auth } from "../../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import './dashboard.css';

const DashboardPage = () => {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      <div className="welcome-section">
        <h2>Welcome to CodeMini</h2>
        <p>This is your dashboard where you can manage your projects, set your OpenAI tokens, and navigate through the features of CodeMini.</p>
        <p><a href="/code-editor" className="dashboard-link">Go to Code Editor</a></p>
        {user && <p className="user-info">Logged in as {user.email}</p>}
      </div>
      <button onClick={handleLogout} className="logout-button">Logout</button>
    </div>
  );
};

export default DashboardPage;