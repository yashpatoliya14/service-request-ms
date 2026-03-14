# Service Request Management System

## 📌 Application Overview

### Name of the Application:

**Service Request Management System**

### Purpose of the Application:

Service Request Management System is a robust issue tracking and service request management platform. It is designed to streamline the process of submitting, tracking, and resolving service requests within an organization. It connects users with technicians and provides real-time updates and communication to ensure efficient issue resolution.

### 🔥 Main Features and Functionalities:

- **Next.js & React**: Modern, fast, and SEO-friendly frontend structure.
- **Socket.io**: Real-time communication for live chat between users and technicians on specific requests.
- **Prisma & PostgreSQL**: Reliable database ORM with type-safe queries and relational data management.
- **Tailwind CSS & Framer Motion**: Clean, adaptive user interface with smooth animations and transitions.
- **Role-Based Workspaces**: Dedicated portals and tools for different user roles (Admin, Technicians, Requesters).
- **Authentication**: Secure JWT-based authentication with bcrypt password hashing.
- **Real-Time Request Tracking**: Users can track the status and priority of their service requests dynamically.
- **Technician Dashboard**: Specialized view for technicians to manage, update, and resolve their assigned tasks.
- **Nodemailer**: Email functionality for notifications and OTP-based verification/password resets.

### 🎯 Target Audience:

Organizations, IT departments, and service teams that require a centralized system to manage internal or external service requests and technical support tickets.

---

## 🛠️ Panels & Roles

* **Admin**: Manage all user roles, assign technicians to departments, update master status lists, and oversee all system requests.
* **Technician**: View assigned tasks, update request statuses (e.g., In Progress, Completed), and communicate directly with the requester in real-time.
* **Requester (User)**: Submit new service requests, attach details and priority levels, track progress, and chat with assigned technicians for updates.

---

## 🛋️ User Experience

- 🔍 **Interactive Dashboards**
- ⚡ **Real-Time Live Chat via WebSockets**
- ✨ **Clean UI components powered by Radix UI**

### 👤 Key Features

- 🔒 **Secure login and access control**
- 📝 **Detailed Request creation and management**
- 🛂 **Live Status tracking and History Logs**
- 📱 **Fully responsive design for mobile and desktop**

---

## 🚀 Technology Stack

### 🎨 Frontend:

- **React.js (v19)**
- **Next.js (v16 App Router)**
- **Tailwind CSS (v4)** for styling
- **Framer Motion** for animations
- **Lucide React** for iconography
- **Radix UI** for accessible primitive components

### 🔧 Backend:

- **Next.js API Routes**
- **Node.js (tsx) Custom Server** for WebSockets
- **Prisma ORM**
- **PostgreSQL** Database
- **Socket.io** for real-time bi-directional event-based communication
- **JWT (jose)** for stateless authentication

---

## 🛋 Version Information

| Package       | Version |
| ------------- | ------- |
| next          | 16.1.1  |
| react         | 19.2.3  |
| tailwindcss   | ^4.0.0  |
| prisma        | ^5.22.0 |
| socket.io     | ^4.8.3  |

---

## 👥 Team Contributions

### **Member 1: Patoliya Yash**

**Role:** Full Stack Developer

#### Contributions:

- Designed and implemented the complete PostgreSQL database schema via Prisma.
- Developed the secure JWT-based authentication and authorization system.
- Created the user, technician, and admin dashboards using Tailwind CSS and Radix UI.
- Integrated Socket.io for real-time chat functionality on request detail pages.
- Built reusable React components and established the App Router file structure.
- Developed backend API routes for handling CRUD operations for service requests.
- Configured concurrently script to run both Next.js and the custom Socket Server simultaneously.
- Implemented error handling and API client utility wrappers.

---

## 📂 Setup Instructions

### Prerequisites:

- Node.js installed
- PostgreSQL database set up (Local or Cloud URL)

### Installation Steps:

1. **Clone the Repository:**

   ```sh
   git clone <repository_url>
   cd system-request-ms
   ```

2. **Install Dependencies:**

   ```sh
   npm install
   ```

3. **Set Up Environment Variables:**
   Create a `.env` file in the root directory and add the required environment variables:
   
   ```env
   NEXT_DATABASE_URL="postgresql://username:password@localhost:5432/mydb"
   JWT_SECRET="your_secure_secret_string"
   ```

4. **Initialize Database:**
   Generate the Prisma Client based on the schema:

   ```sh
   npx prisma generate
   ```

5. **Run the Application:**

   ```sh
   npm run dev
   ```
   *This command leverages `concurrently` to start both the Next.js frontend dev server (port 3000) and the Socket.io backend server (port 4000).*

Now, your application should be running successfully at [http://localhost:3000](http://localhost:3000)!

---

## 💡 Future Enhancements

- File and image attachment support for service requests.
- Push notifications for real-time status updates.
- Advanced filtering, sorting, and reporting exports for Admins.

---

Happy coding! 🚀
