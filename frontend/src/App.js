// src/App.js

import React, { useState } from "react";
import "./App.css";
import LoginForm from "./components/LoginForm";
import Dashboard from "./components/Dashboard";

function App() {
  // STATE - Controls what the app shows and stores data

  // Are we logged in? (true/false)
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Attendance data from backend (array of subjects)
  const [attendanceData, setAttendanceData] = useState([]);

  // FUNCTION 1: Called when login is successful
  const handleLoginSuccess = (data) => {
    console.log("Login successful! Received data:", data);

    // Store the attendance data in state
    setAttendanceData(data);

    // Switch to logged-in mode
    setIsLoggedIn(true);
  };

  // FUNCTION 2: Called when user clicks logout
  const handleLogout = () => {
    console.log("Logging out...");

    // Clear the data
    setAttendanceData([]);

    // Go back to login screen
    setIsLoggedIn(false);
  };

  // RENDER - Decide what to show
  return (
    <div className="App">
      {/* Conditional Rendering: Show LoginForm OR Dashboard */}
      {!isLoggedIn ? (
        // Not logged in → Show LoginForm
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      ) : (
        // Logged in → Show Dashboard
        <Dashboard attendanceData={attendanceData} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
