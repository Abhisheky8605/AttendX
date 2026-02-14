// src/services/api.js

const API_BASE_URL = "http://localhost:5001";

export const fetchCaptcha = async (rollNo) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/captcha`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ roll_no: rollNo }),
    });

    const data = await response.json();
    return data; // Now includes session_id
  } catch (error) {
    console.error("Error fetching CAPTCHA:", error);
    throw error;
  }
};

export const fetchAttendance = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/attendance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: credentials.sessionId, // Add this
        password: credentials.password,
        captcha: credentials.captcha,
        year: credentials.year || 0,
        semester: credentials.semester || 0,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching attendance:", error);
    throw error;
  }
};
