// Dummy student data (shown for any login)
const dummyStudent = {
  name: "Student Name",
  enrollment: "2023UXX****",
  attendance: [
    { subject: "Mathematics", held: 40, attended: 32 },
    { subject: "Data Structures", held: 38, attended: 34 },
    { subject: "Operating Systems", held: 35, attended: 27 },
    { subject: "Theory of Computation", held: 30, attended: 21 },
    { subject: "Computer Networks", held: 32, attended: 30 }
  ]
};

// DOM elements
const loginContainer = document.getElementById("login-container");
const dashboardContainer = document.getElementById("dashboard-container");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const welcomeText = document.getElementById("welcome-text");
const subjectsContainer = document.getElementById("subjects-container");
const logoutBtn = document.getElementById("logout-btn");

// Handle login form submit
loginForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  // Ignore real validation: always log in and show dummy data
  loginError.textContent = "";
  showDashboard(username || "student");
});

// Render dashboard with subject cards
function showDashboard(username) {
  const student = dummyStudent;

  welcomeText.textContent = `Welcome, ${student.name} (${student.enrollment})`;

  // Clear previous subject cards
  subjectsContainer.innerHTML = "";

  student.attendance.forEach(record => {
    const percentage = record.held > 0
      ? ((record.attended / record.held) * 100).toFixed(2)
      : "0.00";

    // Create card
    const card = document.createElement("div");
    card.classList.add("subject-card");

    // Color whole card red if attendance < 75%
    if (parseFloat(percentage) < 75) {
      card.classList.add("subject-bad");
    } else {
      card.classList.add("subject-good");
    }

    // Header row: subject name + percentage
    const header = document.createElement("div");
    header.classList.add("subject-header");

    const nameEl = document.createElement("div");
    nameEl.classList.add("subject-name");
    nameEl.textContent = record.subject;

    const percentEl = document.createElement("div");
    percentEl.classList.add("subject-percentage");
    percentEl.textContent = percentage + " %";

    header.appendChild(nameEl);
    header.appendChild(percentEl);

    // Meta info: attended / held
    const meta = document.createElement("div");
    meta.classList.add("subject-meta");
    meta.textContent = `Classes attended: ${record.attended} / ${record.held}`;

    // Progress bar
    const progressBar = document.createElement("div");
    progressBar.classList.add("progress-bar");

    const progressFill = document.createElement("div");
    progressFill.classList.add("progress-fill");
    progressFill.style.width = percentage + "%";

    progressBar.appendChild(progressFill);

    // Assemble card
    card.appendChild(header);
    card.appendChild(meta);
    card.appendChild(progressBar);

    subjectsContainer.appendChild(card);
  });

  // Toggle views
  loginContainer.classList.add("hidden");
  dashboardContainer.classList.remove("hidden");
}

// Logout
logoutBtn.addEventListener("click", function () {
  dashboardContainer.classList.add("hidden");
  loginContainer.classList.remove("hidden");

  loginForm.reset();
  loginError.textContent = "";
});
