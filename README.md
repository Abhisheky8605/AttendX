Attendance Dashboard

A web application to view student attendance data from the IMS NSIT portal. Built with React frontend and Flask backend using Selenium for web scraping.

## Overview

This application automates the process of logging into the IMS portal and extracting attendance information. It handles CAPTCHA authentication, maintains session state, and presents the data in a clean interface.

## Features

- Automated login with CAPTCHA handling
- Session management between CAPTCHA fetch and form submission
- Year and semester selection
- Attendance data extraction and visualization
- Support for multiple subject codes

## Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- Google Chrome browser
- ChromeDriver matching your Chrome version

## Installation

### Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

The backend will start on port 5001.

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

The frontend will start on port 3000.

## Usage

1. Enter your roll number and click "Get CAPTCHA"
2. Enter your password and the CAPTCHA text
3. Select your academic year and semester
4. Click "Get Attendance" to view your data

## Project Structure

```
attendance-dashboard/
├── backend/
│   ├── app.py
│   ├── scraper/
│   │   ├── scraper_with_driver.py
│   │   └── utils.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   └── App.js
│   └── package.json
└── README.md
```

## API Endpoints

### POST /api/captcha

Fetches CAPTCHA image and creates a session.

Request:

```json
{
  "roll_no": "2023UIT3082"
}
```

Response:

```json
{
  "success": true,
  "captcha_base64": "data:image/png;base64,...",
  "session_id": "abc123..."
}
```

### POST /api/attendance

Retrieves attendance data using an existing session.

Request:

```json
{
  "session_id": "abc123...",
  "password": "yourpassword",
  "captcha": "12345",
  "year": 0,
  "semester": 5
}
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "Subject Code": "ITITC601",
      "Subject Name": "Web Technology",
      "Attendance %": 50.0
    }
  ]
}
```

## Configuration

Sessions expire after 5 minutes by default. To change this, modify SESSION_TIMEOUT in backend/app.py.

The backend runs in visible browser mode to avoid anti-automation detection. For headless deployment, install xvfb:

```bash
sudo apt install xvfb
xvfb-run python app.py
```

## Troubleshooting

**Session expired error**: Get a new CAPTCHA or increase the timeout value.

**Login failed**: Verify your credentials and CAPTCHA entry are correct.

**Chrome version mismatch**: Update Chrome and clear the chromedriver cache:

```bash
rm -rf ~/.local/share/undetected_chromedriver/
```

**No data found**: Check that you selected the correct year and semester.
