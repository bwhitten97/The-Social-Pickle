import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Privacy.css';

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="privacy-container">
      <div className="privacy-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Privacy Policy</h1>
      </div>
      
      <div className="privacy-content">
        <p className="last-updated">Last updated: August 07, 2025</p>
        
        <div className="privacy-intro">
          <p>
            We care about your privacy. This Privacy Policy explains what data we collect, why we collect it, and how we use it.
          </p>
        </div>

        <section className="privacy-section">
          <h2>1. What We Collect</h2>
          <ul>
            <li><strong>Profile info</strong>: name, location, playing preferences, photos</li>
            <li><strong>Device info</strong>: browser, device type, operating system</li>
            <li><strong>Usage data</strong>: activity logs, feature use, time of access</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>2. How We Use Your Data</h2>
          <ul>
            <li>To provide and improve the app experience</li>
            <li>To show you matches and events nearby</li>
            <li>To monitor platform safety and prevent abuse</li>
            <li>To send app-related updates and notifications</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>3. Sharing Your Data</h2>
          <p>
            We do <strong>not</strong> sell your personal data. We may share it with:
          </p>
          <ul>
            <li>Trusted third-party services (e.g., database or analytics tools)</li>
            <li>Law enforcement if required by law</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>4. Your Choices</h2>
          <p>
            You can update or delete your profile anytime. To request full deletion of your data, email us at <a href="mailto:support@socialpickle.co">support@socialpickle.co</a>.
          </p>
        </section>

        <section className="privacy-section">
          <h2>5. Data Security</h2>
          <p>
            We use secure servers and industry-standard practices to protect your data — but no system is 100% secure.
          </p>
        </section>

        <section className="privacy-section">
          <h2>6. Children</h2>
          <p>
            We don't knowingly collect personal info from children under 13.
          </p>
        </section>

        <section className="privacy-section">
          <h2>7. Changes to This Policy</h2>
          <p>
            We may update this policy over time. We'll notify users of major changes.
          </p>
        </section>

        <section className="privacy-section">
          <h2>8. Contact Us</h2>
          <p>
            Questions? Email us at: <a href="mailto:support@socialpickle.co">support@socialpickle.co</a>
          </p>
        </section>
      </div>
    </div>
  );
};

export default Privacy;