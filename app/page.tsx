// app/page.tsx
"use client";

import Link from "next/link";

const HomePage = () => {
  return (
    <div>
      <h1>Welcome to CodeMini</h1>
      <nav>
        <ul>
          <li><Link href="/login">Login</Link></li>
          <li><Link href="/signup">Sign Up</Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default HomePage;