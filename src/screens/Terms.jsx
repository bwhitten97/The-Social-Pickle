import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Terms.css';

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="terms-container">
      <div className="terms-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Terms of Use</h1>
      </div>
      
      <div className="terms-content">
        <p className="last-updated">Last updated: August 07, 2025</p>
        
        <div className="terms-intro">
          <p>
            Welcome to The Social Pickle! These Terms of Use ("Terms") are a legal agreement between you ("you" or "user") and The Social Pickle ("we," "our," or "us") that govern your access to and use of our mobile app and services (the "Platform").
          </p>
          <p>
            <strong>By creating an account or using The Social Pickle, you agree to these Terms.</strong>
          </p>
        </div>

        <section className="terms-section">
          <h2>1. Who Can Use The Social Pickle</h2>
          <p>
            You must be at least 13 years old to use the app. If you are under 18, you must have permission from a parent or legal guardian.
          </p>
        </section>

        <section className="terms-section">
          <h2>2. What You Agree To</h2>
          <ul>
            <li>You'll provide accurate info when signing up.</li>
            <li>You'll use the app respectfully — no harassment, hate speech, or offensive content.</li>
            <li>You'll only use the Platform for personal, recreational, and social purposes — not commercial spam or solicitation.</li>
            <li>You're responsible for your own actions and interactions with other users.</li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>3. Safety</h2>
          <p>
            We are not responsible for the behavior of users or any in-person events organized through the Platform. Use common sense and prioritize your personal safety.
          </p>
        </section>

        <section className="terms-section">
          <h2>4. Your Content</h2>
          <p>
            You own the content you upload (like photos or bios), but by posting it, you give us permission to display it on the app.
          </p>
          <p>
            We reserve the right to remove content that violates these Terms or is harmful to the community.
          </p>
        </section>

        <section className="terms-section">
          <h2>5. Account Termination</h2>
          <p>
            We may suspend or terminate your account if you break these rules or misuse the app.
          </p>
        </section>

        <section className="terms-section">
          <h2>6. Changes to the Terms</h2>
          <p>
            We may update these Terms from time to time. We'll notify you of major changes. Continued use after changes means you agree to them.
          </p>
        </section>

        <section className="terms-section">
          <h2>7. Disclaimer</h2>
          <p>
            We provide the app "as-is" without warranties of any kind. We don't guarantee availability, compatibility, or uninterrupted service.
          </p>
        </section>

        <section className="terms-section">
          <h2>8. Contact Us</h2>
          <p>
            Questions? Email us at: <a href="mailto:blake@socialpickle.co">blake@socialpickle.co</a>
          </p>
        </section>
      </div>
    </div>
  );
};

export default Terms;