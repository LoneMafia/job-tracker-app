# job-tracker-app

# AI-Powered Job Application Tracker

---

An advanced, feature-rich web application designed to replace cumbersome spreadsheets for tracking job applications. This tool moves beyond simple data entry, offering a comprehensive suite of features including a **full analytics dashboard, task management, and an AI-powered assistant** to help users optimize their job search.

Built with **React** and **Firebase**, and deployed on **Vercel**.

---

## Key Features

* **Secure User Accounts**: Full authentication system with email and password, ensuring your data is private and accessible from any device.
* **Personalized Dashboard**: A welcoming and responsive interface that greets you by name and adapts to both desktop and mobile screens.
* **Comprehensive Application Tracking**: Add, edit, and delete job applications with a rich set of fields, including status, deadlines, contacts, job descriptions, and resume versions.
* **Advanced Analytics Suite**:
    * **Application Funnel**: A dynamic, color-coded Sankey diagram that visualizes your entire job application pipeline from "Pending" to "Offer" or "Rejected".
    * **Status Breakdown**: A donut chart showing the current distribution of all your applications.
    * **Application Timeline**: A line chart tracking your application submission rate over the past 90 days.
    * **Key Metrics**: At-a-glance cards for total applications, interview rate, offer rate, and average time to first response.
* **AI-Powered Assistant**:
    * **Resume/JD Matching**: Analyzes your master resume against a job description to provide a match score and suggest keywords.
    * **Interview Prep**: Generates likely interview questions based on the job role.
    * **Communication Helper**: Drafts professional follow-up emails.
* **Productivity Tools**:
    * **Task Management**: A to-do list for each individual application.
    * **Calendar Integration**: Easily add application deadlines to your Google Calendar.
* **Customization & Data Management**:
    * **Theme Support**: Switch between light and dark modes.
    * **Customizable Sources**: Add and manage your own job sources in the settings.
    * **Bulk CSV Import**: Easily migrate all your data from a spreadsheet.

---

## Tech Stack

* **Frontend**: React (with Hooks and functional components)
* **Backend & Database**: Google Firebase (Firestore, Authentication)
* **Styling**: Tailwind CSS
* **Charts & Visualizations**: Recharts
* **Deployment**: Vercel

---

## Setup & Deployment

This project is set up to be deployed easily on Vercel.

### 1. Firebase Setup

* Create a new Firebase project. **Important**: During setup, ensure you select the `nam5 (us-central)` region for Firestore to use the free tier's full capabilities.
* In your project, enable the following services:
    * **Authentication**: Enable the "Email/Password" sign-in provider.
    * **Firestore Database**: Create a database, starting in "test mode".
* Go to `Project settings -> General` and register a new web app.
* Copy the `firebaseConfig` object.

### 2. Project Files

* Create a GitHub repository.
* Create the necessary project files (`package.json`, `.gitignore`, `public/index.html`, `src/index.js`, `src/index.css`, `tailwind.config.js`, `postcss.config.js`).
* Place the main application code in `src/App.js`.
* Crucially, paste your unique `firebaseConfig` object into the top of `src/App.js`.

### 3. Deployment

* Connect your GitHub repository to a new Vercel project.
* Vercel will automatically detect the `react-scripts` build command.
* Deploy. Vercel will handle the entire build process.

---

## How to Use

1.  Navigate to the deployed Vercel URL.
2.  Create a new account with your name, email, and password.
3.  Use the "Import CSV" button to bulk-upload existing applications from a spreadsheet.
4.  Use the "Add Application" button to add new entries.
5.  Navigate between the **All Applications, Dashboard, and Settings** views using the sidebar.
6.  Click on any application in the list to view its details, manage tasks, or use the AI Assistant.
