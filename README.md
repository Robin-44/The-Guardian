The Guardian - Angular and Node.js Application

This project demonstrates an advanced medication reminder system using Angular for the frontend and Node.js with Express for the backend. The app integrates features like user authentication using Auth0, notification management with Web Push, and robust backend logic using MongoDB for data storage.

Features

Authentication
Login and Logout: The app integrates Auth0 Angular SDK to handle user authentication seamlessly.
Profile Management: Displays user information fetched from Auth0.
Route Protection: Ensures secure access to protected routes using an authentication guard.
Medication Reminders
Survey Form: Allows users to input medication details, including dosage, frequency, and reminder timings.
Reminder Notifications:
Initial Reminders: Notify users when it's time to take their medication.
Follow-Up Reminders: Resend notifications if no action is taken.
Service Worker Integration: Handles notifications via a custom service worker for reliability and performance.
User Dashboard
List of Medications: Displays all recorded medications with their respective reminders.
Update and Delete: Users can edit or delete their data.
Data Export: Download user data as Excel or PDF files.
Privacy and Security
User Data Management: Users can request data deletion, which removes all associated information, including reminders and subscriptions.
JWT Authentication: Secures API routes to ensure only authorized users can access sensitive data.
Backend Services
MongoDB Integration: Data storage for users, medications, reminders, and subscriptions.
Express Middleware: Handles authentication, data validation, and error handling.
Web Push API: Sends real-time notifications to users for reminders.
Setup and Configuration

1. Prerequisites
Ensure you have the following installed:

Node.js and npm
MongoDB
Angular CLI
2. Clone the Repository
bash
Copier le code
git clone <repository-url>
cd project-directory
3. Configure Environment Variables
Create a .env file in the root of your project with the following:

bash
Copier le code
MONGO_URI=<Your MongoDB URI>
JWT_SECRET=<Your JWT Secret>
VAPID_PUBLIC_KEY=<Your VAPID Public Key>
VAPID_PRIVATE_KEY=<Your VAPID Private Key>
4. Auth0 Configuration
Create an auth_config.json file in the project root:

json
Copier le code
{
  "domain": "<YOUR AUTH0 DOMAIN>",
  "clientId": "<YOUR AUTH0 CLIENT ID>",
  "audience": "<YOUR AUTH0 API AUDIENCE IDENTIFIER>"
}
5. Install Dependencies
npm install

6. Run the Application
Development Mode:
npm run dev
Backend: Runs on http://localhost:3000
Frontend: Runs on http://localhost:4200
Production Mode:

npm run prod
Both frontend and backend run on http://localhost:3000
7. Docker Support
Build and run the app in a Docker container:

How the App Works

1. Service Worker Collaboration
The custom service worker intercepts push notifications, listens for notificationclick events, and forwards data to the Angular app.
The Angular app uses the data to navigate users to specific routes or open modals.
2. Backend API
Protected Routes: APIs use Gurad for secure user-specific data access.
Notification Management:
The backend sends Web Push notifications for reminders using node-cron for scheduling.
Data Operations:
CRUD operations for user responses, reminders, and subscriptions.
3. Frontend
Auth0 SDK: Simplifies authentication and user management.
Angular Services: Facilitates API communication and state management.
Responsive Design: Built with Bootstrap for a polished user experience.
Build and Deployment

1. Build the Project
The build artifacts will be stored in the dist/ directory.

2. Deploy
Use services like Heroku, Netlify, or Vercel for deployment.
Ensure MongoDB is hosted on MongoDB Atlas or another cloud provider.
Usage

Key Technologies

Frontend: Angular, Auth0 SDK, Bootstrap
Backend: Node.js, Express, MongoDB
Notifications: Web Push API, Service Worker
Authentication: Guard, Auth0
Scheduling: Node-cron
Contributing

Fork the repository.
Submit pull requests for features or bug fixes.

FAQ

What happens if I delete my data?
All associated data, including reminders, subscriptions, and survey responses, are permanently deleted.

Why use Guard for authentication?
Guard provides stateless, secure, and scalable authentication for APIs.

How are notifications managed?
Notifications are sent using Web Push API and are managed by a custom service worker.

For further questions, open an issue on the repository!
