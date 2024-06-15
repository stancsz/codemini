// app/page.tsx
"use client";

import Link from "next/link";

const HomePage = () => {
  return (
    <div className="homepage-container">
      <h1 className="homepage-title">Welcome to CodeMini</h1>
      <p className="homepage-description">CodeMini is a powerful code editor and project management tool designed to simplify and enhance your coding experience. It makes coding easy with minimal code edits. Currently in an experimental state, any suggestion please raise an issue to <a href="https://github.com/stancsz/codemini/issues" target="_blank" className="github-link">GitHub</a>. New contributors are welcomed to work together on this project.</p>
      <nav>
        <ul className="homepage-nav-list">
          <li className="homepage-nav-item"><Link href="/login" className="homepage-nav-link">Login</Link></li>
          <li className="homepage-nav-item"><Link href="/signup" className="homepage-nav-link">Sign Up</Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default HomePage;
