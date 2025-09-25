# Geolocation Attendance Tracking Application

## Overview
This project is a geolocation-based attendance tracking application designed for educational institutions. It allows Admins, Class Advisors, and Students to manage attendance efficiently using geolocation features.

## Features
- User authentication for Admins, Class Advisors, and Students.
- Geolocation tracking to ensure users are within a specified geofence during check-in/check-out.
- Responsive design suitable for mobile devices.
- Notifications and reminders for students regarding attendance.

## Project Structure
```
geolocation-attendance-app
├── src
│   ├── index.html          # Landing page with login/signup forms
│   ├── styles
│   │   └── main.css       # Common styles for the application
│   ├── scripts
│   │   └── app.js         # Main JavaScript logic for the application
│   └── utils
│       └── geolocation.js  # Utility functions for geolocation tasks
├── README.md               # Documentation for the project
```

## Setup Instructions
1. Clone the repository to your local machine.
2. Open the `index.html` file in a web browser to access the application.
3. Ensure you have a Firebase project set up for user authentication and database management.
4. Update the Firebase configuration in `src/scripts/app.js` with your project's credentials.

## Usage Guidelines
- Admins can manage user accounts and view attendance reports.
- Class Advisors can check attendance for their classes and send notifications.
- Students can check in/out and receive reminders about their attendance status.

## Technologies Used
- HTML, CSS, JavaScript
- Firebase for authentication and database
- Geolocation API for tracking user location

## License
This project is licensed under the MIT License.