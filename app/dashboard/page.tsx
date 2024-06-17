"use client";

import { useEffect, useState } from "react";
import { auth } from "../../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useRouter } from "next/navigation";
import "./dashboard.css";
import Link from "next/link";

const DashboardPage = () => {
  const [user, setUser] = useState<any>(null);
  const [showMessage, setShowMessage] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const tokenRef = doc(db, `user/${currentUser.uid}/openai`, "token");
        const tokenDoc = await getDoc(tokenRef);
        if (!tokenDoc.exists() || (tokenDoc.data().apiKey || "").length <= 5) {
          setShowMessage(true);
        }
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="dashboard-container">
      {showMessage && (
        <div className="floating-message">
          <p>
            You haven't configured an OpenAI API token yet. In order for this app to work properly, you need to add your token
            <a href="/set-tokens"> here</a>. You can get your key here: <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">https://platform.openai.com/api-keys</a>
          </p>
          <button onClick={() => setShowMessage(false)}>Close</button>
        </div>
      )}
      <div className={`welcome-section ${showMessage ? "blur-background" : ""}`}>
        <h2>Welcome to CodeMini</h2>
        <p>This is your dashboard where you can manage your projects, set your OpenAI tokens, and navigate through the features of CodeMini.</p>
        <ul className="dashboard-nav-list">
          <li className="dashboard-nav-item">
            <Link href="/code-editor" className="dashboard-nav-link">Go to Code Editor</Link>
          </li>
          <li className="dashboard-nav-item">
            <Link href="/set-tokens" className="dashboard-nav-link">Set Tokens</Link>
          </li>
          <li className="dashboard-nav-item">
            <Link href="/reset-password" className="dashboard-nav-link">Reset Password</Link>
          </li>
        </ul>
        {user && <p className="user-info">Logged in as {user.email}</p>}
      </div>
    </div>
  );
};

export default DashboardPage;
