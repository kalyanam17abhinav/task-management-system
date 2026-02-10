# Task Management System

A full-stack task management application built with React and Node.js.

## Features
- User authentication (register/login)
- Create, read, update, delete tasks
- Task filtering and search
- Task statistics dashboard
- Priority levels (low, medium, high)
- Status tracking (pending, in progress, completed)

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MySQL database
- Git

### Database Setup
1. Create a MySQL database named `task_manager`
2. Run the SQL script in `server/database_setup.sql`

### Server Setup
1. Navigate to server directory: `cd server`
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and update with your database credentials
4. Start server: `npm start` or `node server.js`
5. Server runs on http://localhost:5000

### Client Setup
1. Navigate to client directory: `cd client`
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Client runs on http://localhost:5173

### Production Build
1. Client: `npm run build`
2. Server: Use PM2 or similar process manager
