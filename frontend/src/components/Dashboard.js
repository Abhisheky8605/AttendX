// src/components/Dashboard.js

import React from "react";

function Dashboard({ attendanceData, onLogout }) {
  // Calculate overall statistics
  const calculateStats = () => {
    if (!attendanceData || attendanceData.length === 0) {
      return {
        totalSubjects: 0,
        overallAttendance: 0,
        subjectsBelow75: 0,
        totalPresent: 0,
        totalClasses: 0,
      };
    }

    let totalPresent = 0;
    let totalClasses = 0;
    let subjectsBelow75 = 0;

    attendanceData.forEach((subject) => {
      totalPresent += subject["Classes Present"];
      totalClasses += subject["Total Classes"];

      if (subject["Attendance %"] < 75) {
        subjectsBelow75++;
      }
    });

    const overallAttendance =
      totalClasses > 0 ? ((totalPresent / totalClasses) * 100).toFixed(2) : 0;

    return {
      totalSubjects: attendanceData.length,
      overallAttendance,
      subjectsBelow75,
      totalPresent,
      totalClasses,
    };
  };

  const stats = calculateStats();

  // Helper function to determine color based on attendance percentage
  const getAttendanceColor = (percentage) => {
    if (percentage >= 85) return "#28a745"; // Green
    if (percentage >= 75) return "#ffc107"; // Yellow
    return "#dc3545"; // Red
  };

  return (
    <div style={styles.container}>
      {/* Header with Logout */}
      <div style={styles.header}>
        <h1>📊 Your Attendance Dashboard</h1>
        <button onClick={onLogout} style={styles.logoutButton}>
          🚪 Logout
        </button>
      </div>

      {/* Statistics Cards */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <h3>Overall Attendance</h3>
          <p
            style={{
              fontSize: "32px",
              fontWeight: "bold",
              color: getAttendanceColor(parseFloat(stats.overallAttendance)),
            }}
          >
            {stats.overallAttendance}%
          </p>
          <p style={styles.statSubtext}>
            {stats.totalPresent} / {stats.totalClasses} classes
          </p>
        </div>

        <div style={styles.statCard}>
          <h3>Total Subjects</h3>
          <p style={styles.statNumber}>{stats.totalSubjects}</p>
        </div>

        <div style={styles.statCard}>
          <h3>⚠️ Below 75%</h3>
          <p
            style={{
              ...styles.statNumber,
              color: stats.subjectsBelow75 > 0 ? "#dc3545" : "#28a745",
            }}
          >
            {stats.subjectsBelow75}
          </p>
        </div>
      </div>

      {/* Attendance Table */}
      <div style={styles.tableContainer}>
        <h2>Subject-wise Attendance</h2>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Subject Code</th>
              <th style={styles.th}>Subject Name</th>
              <th style={styles.th}>Present</th>
              <th style={styles.th}>Absent</th>
              <th style={styles.th}>Total</th>
              <th style={styles.th}>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.map((subject, index) => (
              <tr
                key={index}
                style={{
                  ...styles.tableRow,
                  backgroundColor: index % 2 === 0 ? "#f9f9f9" : "white",
                }}
              >
                <td style={styles.td}>{subject["Subject Code"]}</td>
                <td style={styles.td}>{subject["Subject Name"]}</td>
                <td style={styles.td}>{subject["Classes Present"]}</td>
                <td style={styles.td}>{subject["Classes Absent"]}</td>
                <td style={styles.td}>{subject["Total Classes"]}</td>
                <td
                  style={{
                    ...styles.td,
                    fontWeight: "bold",
                    color: getAttendanceColor(subject["Attendance %"]),
                  }}
                >
                  {subject["Attendance %"]}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div style={styles.legend}>
        <p>
          <span style={{ color: "#28a745" }}>●</span> ≥85% - Excellent
        </p>
        <p>
          <span style={{ color: "#ffc107" }}>●</span> 75-84% - Good
        </p>
        <p>
          <span style={{ color: "#dc3545" }}>●</span> &lt;75% - At Risk
        </p>
      </div>
    </div>
  );
}

// STYLES
const styles = {
  container: {
    maxWidth: "1200px",
    margin: "20px auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },
  logoutButton: {
    padding: "10px 20px",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
  },
  statsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
    marginBottom: "30px",
  },
  statCard: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  statNumber: {
    fontSize: "32px",
    fontWeight: "bold",
    margin: "10px 0",
    color: "#007bff",
  },
  statSubtext: {
    fontSize: "14px",
    color: "#666",
  },
  tableContainer: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    marginBottom: "20px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "15px",
  },
  tableHeader: {
    backgroundColor: "#007bff",
    color: "white",
  },
  th: {
    padding: "12px",
    textAlign: "left",
    borderBottom: "2px solid #dee2e6",
  },
  tableRow: {
    borderBottom: "1px solid #dee2e6",
  },
  td: {
    padding: "12px",
    textAlign: "left",
  },
  legend: {
    display: "flex",
    justifyContent: "center",
    gap: "30px",
    padding: "15px",
    backgroundColor: "#f8f9fa",
    borderRadius: "4px",
  },
};

export default Dashboard;
