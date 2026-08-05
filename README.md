# 🏥 Hospital Management System API

A scalable, secure, and robust RESTful API for a modern Hospital Management System built with **Node.js**, **Express.js**, **PostgreSQL**, and **TypeORM**.

---

## 📌 Overview

The Hospital Management System API provides back-end capabilities to handle clinical operations, patient registration, doctor scheduling, department administration, appointments, billing, medical prescriptions, and role-based authorization.

---

## ✨ Features

- 🔐 **Authentication & Security:** JWT authentication (supporting both Bearer tokens and HTTP-only cookies), password hashing using `bcrypt`, and security middlewares.
- 👥 **Role-Based Access Control (RBAC):** Granular access control for `ADMIN`, `DOCTOR`, `RECEPTIONIST`, and `PATIENT` roles.
- 🏢 **Department Management:** Full CRUD operations for hospital departments, including consultation fee management and department status tracking.
- 🩺 **Doctor & Staff Management:** Profiles, department assignments, and availability schedules.
- 📋 **Patient Management:** Medical histories, personal records, and registration workflows.
- 📅 **Appointments System:** Scheduling, status updates, and doctor-patient mapping.
- 💳 **Billing & Payments:** Invoice generation and tracking for consultations and medical services.
- 💊 **Prescriptions & Medical Reports:** Digital prescription generation and medical record keeping.
- 📊 **Dashboard & Reporting:** Analytics for hospital operations and performance.

---

## 🛠️ Tech Stack

- **Runtime Environment:** [Node.js](https://nodejs.org/)
- **Web Framework:** [Express.js v5](https://expressjs.com/)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **ORM:** [TypeORM](https://typeorm.io/) (using EntitySchema definitions)
- **Authentication:** [JSON Web Token (JWT)](https://jwt.io/) & [Bcrypt](https://github.com/kelektiv/node.bcrypt.js)
- **Validation:** [express-validator](https://express-validator.github.io/docs/)
- **Security & Logging:** [Helmet](https://helmetjs.github.io/), [CORS](https://github.com/expressjs/cors), [Cookie-Parser](https://github.com/expressjs/cookie-parser), [Morgan](https://github.com/expressjs/morgan)

---

## 📁 Project Structure

```text
hospital_management/
├── src/
│   ├── app.js                   # Express application setup & middleware stack
│   ├── server.js                # Server entry point & DB connection initialization
│   ├── config/
│   │   └── db.js                # TypeORM DataSource configuration
│   ├── common/
│   │   ├── constants/           # Global application constants
│   │   ├── database/            # Base entity schemas (id, createdAt, updatedAt)
│   │   ├── enums/               # Enums (User roles, Appointment status, etc.)
│   │   ├── errors/              # Custom AppError class
│   │   ├── middleware/          # Global error handling & validation middlewares
│   │   └── utils/               # Utility functions (JWT, hashing, object filtering)
│   └── modules/                 # Feature-based modular architecture
│       ├── appointments/        # Appointments entities, repositories, controllers
│       ├── auth/                # Auth logic, login, registration, JWT protection
│       ├── billing/             # Billing & invoice management
│       ├── dashboard/           # Analytics and overview data
│       ├── department/          # Hospital department administration
│       ├── doctor/              # Doctor profiles & details
│       ├── medical-report/      # Medical records & reports
│       ├── notification/        # System & user notifications
│       ├── patient/             # Patient profiles
│       ├── prescription/        # Digital prescriptions
│       ├── receptionist/        # Receptionist profiles
│       └── user/                # User repository and core entity
├── .env.example                 # Template for environment variables
├── package.json                 # Project dependencies & scripts
└── README.md                    # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** (v18 or higher)
- **PostgreSQL** database server installed and running

---

### Setup Instructions

1. **Clone the Repository:**
   ```bash
   git clone <repository-url>
   cd hospital_management
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env` in the root directory:
   ```bash
   cp .env.example .env
   ```
   Fill in your configuration parameters in `.env`:
   ```env
   PORT=5000
   
   # PostgreSQL Connection
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_postgres_password
   DB_NAME=hospital_db

   # JWT Secrets
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRES_IN=7d
   JWT_COOKIE_EXPIRES_IN=7
   ```

4. **Prepare the Database:**
   Create the database in PostgreSQL:
   ```sql
   CREATE DATABASE hospital_db;
   ```

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   The server will start listening at `http://localhost:5000`.

---

## 🔌 API Endpoints Summary

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user | Public |
| `POST` | `/api/auth/login` | Login & receive JWT | Public |
| `POST` | `/api/auth/forgot-password` | Request password reset token | Public |
| `PATCH` | `/api/auth/reset-password/:token` | Reset password using token | Public |
| `PATCH` | `/api/auth/update-password` | Update current password | Private |
| `PATCH` | `/api/auth/update-profile` | Update profile information | Private |

### 🏢 Department (`/api/department`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/department` | Create a new department | `ADMIN` |
| `GET` | `/api/department` | Get all active departments | `ADMIN`, `DOCTOR`, `RECEPTIONIST` |
| `GET` | `/api/department/:id` | Get department details by ID | `ADMIN`, `DOCTOR`, `RECEPTIONIST` |
| `PATCH` | `/api/department/:id` | Update department details | `ADMIN` |
| `DELETE` | `/api/department/:id` | Soft delete / deactivate department | `ADMIN` |

---

## 🔒 Authentication & Authorization Flow

1. **Token Provisioning:** Upon successful login or registration, a JWT token is generated and delivered via JSON response and set as an `HTTP-Only` cookie (`jwt`).
2. **Protected Routes:** Include the token in requests using one of two methods:
   - **Header:** `Authorization: Bearer <your_jwt_token>`
   - **Cookie:** Automatically sent by browsers/clients via the `jwt` cookie.
3. **Role Restriction:** Routes use `authMiddleware.restrictTo('ADMIN', ...)` to restrict access to authorized roles.

---

## 🛡️ Error Handling

The application uses a centralized error handling strategy with custom `AppError` exceptions and an asynchronous wrapper (`asyncHandler`) to catch unhandled promises. 

Standard error responses follow this format:
```json
{
  "success": false,
  "status": "fail",
  "message": "Detailed description of the error"
}
```

---

## 📜 License

This project is licensed under the **ISC License**.
