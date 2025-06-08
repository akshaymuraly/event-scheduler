# Project Setup and Installation Guide

This guide will help you set up and run both the frontend and backend components of the project.

## 🎨 Frontend Setup

### Prerequisites
- Node.js installed on your system
- npm package manager

### Installation Steps

1. **Navigate to the frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm i
   ```

3. **Environment Configuration**
   
   Create a `.env` file in the frontend directory and add the following variable:
   ```env
   NEXT_PUBLIC_GRAPHQL_URI=http://localhost:4000/graphql
   ```

4. **Run the Application**
   
   Choose one of the following options:
   
   **Development Mode:**
   ```bash
   npm run dev
   ```
   
   **Production Mode:**
   ```bash
   npm run build
   npm start
   ```

---

## ⚙️ Backend Setup

### Prerequisites
- Node.js installed on your system
- npm package manager
- MongoDB database

### Installation Steps

1. **Navigate to the backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm i
   ```

3. **Environment Configuration**
   
   Create a `.env` file in the backend directory and add the following variables:
   
   ```env
   # Database Configuration
   MONGODB_URI=Usable DB URI
   MONGODB_DB_NAME=event-scheduler-db
   
   # Server Configuration
   PORT=4000
   NODE_ENV=development
   
   # CORS Configuration
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Run the Application**
   ```bash
   npm run dev
   ```

---

## 🚀 Quick Start

1. Set up and start the backend server first
2. Then set up and start the frontend application
3. Access the application at `http://localhost:3000`

## 📝 Notes

- Ensure MongoDB is running before starting the backend
- Make sure both frontend and backend are running simultaneously for full functionality
- The backend GraphQL endpoint will be available at `http://localhost:4000/graphql`
