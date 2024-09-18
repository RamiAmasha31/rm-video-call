# Video Conferencing Platform with Firebase and Stream Video SDK

Welcome to the Video Conferencing Platform project! This application allows users to create, join, and manage video meetings. It leverages React, Vite, Express.js, Firebase Firestore, and the Stream Video SDK to deliver a seamless video conferencing experience.

## Table of Contents

1. [Introduction](#introduction)
2. [Features](#features)
3. [System Environment](#system-environment)
4. [Installation and Setup](#installation-and-setup)
5. [Usage](#usage)
6. [File Structure](#file-structure)
7. [Code Documentation](#code-documentation)
8. [User Guide](#user-guide)
9. [Maintenance Guide](#maintenance-guide)
10. [Promotion Video](#promotion-video)

## Introduction

This project is designed to facilitate video conferencing with features such as meeting creation, real-time transcription, and user management. It includes a frontend built with React and Vite, and a backend powered by Express.js and Firebase Firestore.

## Features

- **Create and Manage Video Meetings**
- **Join Meetings via a Link**
- **Real-time Audio Transcription**
- **User Logs and Recordings**
- **Search, Filter, and Pagination for Logs**

## System Environment

### Operating System

- Compatible with Windows, macOS, and Linux.

### Software Requirements

- **Node.js**: version v20.15.0. [Download Link](https://nodejs.org/en)
- **Npm**: For managing project dependencies (included with Node.js).
- **Vite + React**: For the frontend.
- **Express.js**: For the backend API server.
- **Firebase Firestore**: Used as the cloud database.
- **Git**: For version control and code management.

### Hardware Requirements

- **Internet Connection**: Required for Firebase services and deploying changes.

## Installation and Setup

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   ```
2. **install Dependencies**: Navigate to both the server and client directories and run the following command in each:

```bash
npm install
```

3. **Environment Variables Setup**:Create a .env file inside the server folder and provide the following values:

```bash
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
FIREBASE_APP_ID=your_firebase_app_id
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret
```

4. **open two terminals**:

- **Run the server**:Navigate to the server directory and start the Express server:

```bash
npm start
```

- **Run the client side**: Navigate to the root directory (where the frontend is) and start the Vite development server:

```bash
npm run dev
```
