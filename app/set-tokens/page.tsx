"use client";

import { useState, useEffect } from "react";
import { db, auth } from "../../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

const SetTokensPage = () => {
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const docRef = doc(db, `user/${currentUser.uid}/openai`, "token");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setToken(docSnap.data().apiKey);
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
        await setDoc(docRef, { apiKey: token });
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
    <div>
      <h1>Set OpenAI Token</h1>
      <input
        type="text"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="Enter your OpenAI API token"
      />
      <button onClick={handleSaveToken}>Save Token</button>
    </div>
  );
};

export default SetTokensPage;
