"use client";
import { useEffect, useState } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth"; // Update with your actual import path for Firebase Auth
import { auth } from "../firebase"; // Update with your actual import path for Firebase Auth
import "./globals.css";
import "./layout.css"; // Import the new CSS file

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null); // Set user to null to re-render the navbar
      router.push("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <html lang="en">
      <head>
        {/* Include metadata tags */}
      </head>
      <body className={inter.className}>
        <nav className="nav-bar">
          <ul className="nav-list">
            <li className="nav-item">
              <Link href="/" className="nav-link">Home</Link> 
            </li>
            {user ? (
              <>
                <li className="nav-item">
                  <span className="nav-link">{user.email}</span>
                </li>
                <li className="nav-item">
                  <button onClick={handleLogout} className="nav-button">Logout</button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link href="/login" className="nav-link">Login</Link>
                </li>
                <li className="nav-item">
                  <Link href="/signup" className="nav-link">Signup</Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        {children}
      </body>
    </html>
  );
}
