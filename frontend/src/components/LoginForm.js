// src/components/LoginForm.js

import React, { useState } from "react";
import { fetchCaptcha, fetchAttendance } from "../services/api";

function LoginForm({ onLoginSuccess }) {
  // STATE - Data that can change
  const [rollNo, setRollNo] = useState("");
  const [password, setPassword] = useState("");
  const [captchaText, setCaptchaText] = useState("");
  const [captchaImage, setCaptchaImage] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [year, setYear] = useState(0);
  const [semester, setSemester] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // FUNCTION 1: Get CAPTCHA when user clicks button
  const handleGetCaptcha = async () => {
    // Validate roll number first
    if (!rollNo) {
      setError("Please enter your roll number first");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetchCaptcha(rollNo);

      if (response.success) {
        setCaptchaImage(response.captcha_base64);
        setSessionId(response.session_id);
        setError("");
      } else {
        setError(response.error || "Failed to fetch CAPTCHA");
      }
    } catch (err) {
      setError("Network error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  // FUNCTION 2: Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    if (!rollNo || !password || !captchaText) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetchAttendance({
        sessionId: sessionId,
        rollNo,
        password,
        captcha: captchaText,
        year: year,
        semester: semester,
      });

      if (response.success) {
        // Pass data to parent component (App.js)
        onLoginSuccess(response.data);
      } else {
        setError(response.error || "Failed to fetch attendance");
      }
    } catch (err) {
      setError("Network error. Check backend and try again.");
    } finally {
      setLoading(false);
    }
  };

  // RENDER
  return (
    <div style={styles.container}>
      <h1>🎓 Attendance Dashboard</h1>

      {/* Error message */}
      {error && <div style={styles.error}>⚠️ {error}</div>}

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Roll Number Input */}
        <div style={styles.inputGroup}>
          <label>Roll Number:</label>
          <input
            type="text"
            value={rollNo}
            onChange={(e) => setRollNo(e.target.value)}
            placeholder="Enter your roll number"
            style={styles.input}
            disabled={loading}
          />
        </div>

        {/* Password Input */}
        <div style={styles.inputGroup}>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            style={styles.input}
            disabled={loading}
          />
        </div>

        {/* Get CAPTCHA Button */}
        <button
          type="button"
          onClick={handleGetCaptcha}
          disabled={loading || !rollNo}
          style={{
            ...styles.captchaButton,
            opacity: loading || !rollNo ? 0.6 : 1,
            cursor: loading || !rollNo ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Loading..." : "🔄 Get CAPTCHA"}
        </button>

        {/* Display CAPTCHA Image */}
        {captchaImage && (
          <div style={styles.captchaContainer}>
            <img src={captchaImage} alt="CAPTCHA" style={styles.captchaImage} />
          </div>
        )}

        {/* CAPTCHA Input */}
        {captchaImage && (
          <div style={styles.inputGroup}>
            <label>Enter CAPTCHA:</label>
            <input
              type="text"
              value={captchaText}
              onChange={(e) => setCaptchaText(e.target.value)}
              placeholder="Type the text above"
              style={styles.input}
              disabled={loading}
            />
          </div>
        )}

        {/* Year Selection */}
        {captchaImage && (
          <div style={styles.inputGroup}>
            <label>Academic Year:</label>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              style={styles.select}
              disabled={loading}
            >
              <option value={0}>2024-25 (Current Year)</option>
              <option value={1}>2023-24</option>
              <option value={2}>2022-23</option>
              <option value={3}>2021-22</option>
            </select>
            <small style={styles.smallText}>
              Select your current academic year
            </small>
          </div>
        )}

        {/* Semester Selection */}
        {captchaImage && (
          <div style={styles.inputGroup}>
            <label>Semester:</label>
            <select
              value={semester}
              onChange={(e) => setSemester(parseInt(e.target.value))}
              style={styles.select}
              disabled={loading}
            >
              <option value={0}>Semester 1</option>
              <option value={1}>Semester 2</option>
              <option value={2}>Semester 3</option>
              <option value={3}>Semester 4</option>
              <option value={4}>Semester 5</option>
              <option value={5}>Semester 6</option>
              <option value={6}>Semester 7</option>
              <option value={7}>Semester 8</option>
            </select>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !captchaImage}
          style={{
            ...styles.submitButton,
            opacity: loading || !captchaImage ? 0.6 : 1,
            cursor: loading || !captchaImage ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Loading..." : "📊 Get Attendance"}
        </button>

        {/* Helper text */}
        {captchaImage && (
          <div style={styles.helperText}>
            <p>💡 Select your current academic year and semester</p>
          </div>
        )}
      </form>
    </div>
  );
}

// STYLES
const styles = {
  container: {
    maxWidth: "500px",
    margin: "50px auto",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    backgroundColor: "#f9f9f9",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
    border: "1px solid #ccc",
    borderRadius: "4px",
  },
  select: {
    padding: "10px",
    fontSize: "16px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    backgroundColor: "white",
    cursor: "pointer",
  },
  captchaButton: {
    padding: "10px",
    fontSize: "16px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  captchaContainer: {
    textAlign: "center",
    padding: "10px",
    backgroundColor: "white",
    border: "1px solid #ddd",
    borderRadius: "4px",
  },
  captchaImage: {
    maxWidth: "100%",
    height: "auto",
  },
  submitButton: {
    padding: "12px",
    fontSize: "18px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "background-color 0.3s",
  },
  error: {
    padding: "10px",
    backgroundColor: "#f8d7da",
    color: "#721c24",
    borderRadius: "4px",
    marginBottom: "15px",
    border: "1px solid #f5c6cb",
  },
  helperText: {
    fontSize: "14px",
    color: "#666",
    textAlign: "center",
    marginTop: "-5px",
  },
  smallText: {
    fontSize: "12px",
    color: "#888",
    marginTop: "4px",
  },
};

export default LoginForm;
