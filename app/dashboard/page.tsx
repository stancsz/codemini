// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { auth } from "../../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

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
    <div>
      <h1>Dashboard</h1>
      <div>
            <h1>Welcome to CodeMini</h1>
            <p><a href="/code-editor">Go to Code Editor</a></p>
        </div>
      {user && <p>Welcome, {user.email}</p>}
      <button onClick={handleLogout}>Logout</button>
    </div>
    
  );
};

export default DashboardPage;