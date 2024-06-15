"use client";

import { useState, useEffect } from "react";
import { db, auth } from "../../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { useRouter } from "next/navigation";
import './set-tokens.css';

const SetTokensPage = () => {
  const [token, setToken] = useState("");
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const docRef = doc(db, `user/${currentUser.uid}/openai`, "token");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const fetchedToken = docSnap.data().apiKey || "";
          setToken(fetchedToken.slice(0, 5) + fetchedToken.slice(5).replace(/./g, '*'));
        }
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSaveToken = async () => {
    if (user) {
      try {
        const docRef = doc(db, `user/${user.uid}/openai`, "token");
        await setDoc(docRef, { apiKey: token.replace(/\*/g, '') });
        alert("Token saved successfully!");
      } catch (error) {
        console.error("Error saving token:", error);
        alert("Failed to save token.");
      }
    } else {
      alert("User not logged in.");
    }
  };

  return (
    <div className="set-tokens-container">
      <h1 className="set-tokens-title">Set OpenAI Token</h1>
      <input
        type="text"
        value={token.slice(0, 5) + token.slice(5).replace(/./g, '*')}
        onChange={(e) => setToken(e.target.value)}
        placeholder="Enter your OpenAI API token"
        className="set-tokens-input"
        data-hidden={token.length > 5}
      />
      <button onClick={handleSaveToken} className="set-tokens-button">Save Token</button>
    </div>
  );
};

export default SetTokensPage;
