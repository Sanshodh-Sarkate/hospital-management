# Hospital Management System - Detailed API Documentation 📘

**Base URL**: `http://localhost:5000/api`  
**Authentication Type**: Bearer Token (`Authorization: Bearer <accessToken>`) + HTTP-Only Cookie (`refreshToken`)

---

## 🔑 1. Authentication Module (`/api/auth`)

### 1.1 Register User Account
Registers a new user account (Default role: `PATIENT`).

- **Method**: `POST`
- **Route**: `/api/auth/register`
- **Access**: Public
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "firstName": "KetanPatel",
  "lastName": "PatientPatel",
  "email": "ketan.patient@yopmail.com",
  "password": "Password123!",
  "phoneNumber": "9876549212"
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "de6d278a-1cea-4dd6-a6f9-e93019204253",
      "firstName": "KetanPatel",
      "lastName": "PatientPatel",
      "email": "ketan.patient@yopmail.com",
      "phoneNumber": "9876549212",
      "role": "PATIENT",
      "isActive": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  }
}
```

---

### 1.2 User Login
Authenticates user, returns Access Token, and sets `refreshToken` in HTTP-Only Cookie.

- **Method**: `POST`
- **Route**: `/api/auth/login`
- **Access**: Public
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "email": "admin@yopmail.com",
  "password": "Password123!"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "User logged in successfully",
  "data": {
    "user": {
      "id": "fdf8aff7-ff97-4052-a29a-9dca78d449ab",
      "firstName": "gara",
      "lastName": "gara",
      "email": "admin@yopmail.com",
      "role": "ADMIN"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  }
}
```

---

### 1.3 Refresh Access Token
Issues a new Access Token and rotates Refresh Token using HTTP-Only Cookie.

- **Method**: `POST`
- **Route**: `/api/auth/refresh-token`
- **Access**: Public (Requires `refreshToken` Cookie)
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Access token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  }
}
```

---

### 1.4 Logout User
Revokes Refresh Token hash in database and clears HTTP-Only cookie.

- **Method**: `POST`
- **Route**: `/api/auth/logout`
- **Access**: Authenticated
- **Headers**: `Authorization: Bearer <accessToken>`
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 1.5 Change Password
Changes password and revokes existing refresh sessions.

- **Method**: `PATCH`
- **Route**: `/api/auth/change-password`
- **Access**: Authenticated
- **Headers**: `Authorization: Bearer <accessToken>`, `Content-Type: application/json`
- **Request Body**:
```json
{
  "currentPassword": "Password123!",
  "newPassword": "NewPassword123!"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Password changed successfully. Please log in again."
}
```

---

## 🏛️ 2. Department Module (`/api/departments`)

### 2.1 Create Department
- **Method**: `POST`
- **Route**: `/api/departments`
- **Access**: `ADMIN`
- **Headers**: `Authorization: Bearer <ADMIN_ACCESS_TOKEN>`, `Content-Type: application/json`
- **Request Body**:
```json
{
  "departmentName": "Cardiology",
  "description": "Heart & Vascular Care Center",
  "floor": 3,
  "defaultConsultationFee": 500
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "Department created successfully",
  "data": {
    "id": "4bbb2896-d046-46ff-a24c-c4dff01064d6",
    "departmentName": "Cardiology",
    "description": "Heart & Vascular Care Center",
    "floor": 3,
    "defaultConsultationFee": "500.00",
    "isActive": true
  }
}
```

---

### 2.2 Get All Departments
Supports APIFeatures (`search`, `sort`, `page`, `limit`).

- **Method**: `GET`
- **Route**: `/api/departments?search=Cardio&page=1&limit=10`
- **Access**: Authenticated
- **Headers**: `Authorization: Bearer <accessToken>`
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Departments fetched successfully",
  "data": {
    "items": [
      {
        "id": "4bbb2896-d046-46ff-a24c-c4dff01064d6",
        "departmentName": "Cardiology",
        "floor": 3,
        "defaultConsultationFee": "500.00"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

---

## 👨‍⚕️ 3. Doctor Module (`/api/doctors`)

### 3.1 Create Doctor Profile
Creates a new Doctor profile. Validates `licenseNumber` uniqueness and `phoneNumber` (10 digits).

- **Method**: `POST`
- **Route**: `/api/doctors`
- **Access**: `ADMIN`
- **Headers**: `Authorization: Bearer <ADMIN_ACCESS_TOKEN>`, `Content-Type: application/json`
- **Request Body**:
```json
{
  "firstName": "NamanShah",
  "lastName": "DoctorShah",
  "email": "dr.naman@yopmail.com",
  "password": "Password123!",
  "phoneNumber": "9876543210",
  "departmentId": "4bbb2896-d046-46ff-a24c-c4dff01064d6",
  "specialization": "Cardiology",
  "qualification": "MBBS, MD (Cardiology)",
  "experienceYears": 10,
  "licenseNumber": "DOC-CARD-2026-001",
  "consultationFee": 600,
  "gender": "MALE",
  "dateOfBirth": "1988-04-15",
  "address": "123 Medical Enclave, Hospital Road",
  "emergencyContact": "9876543211"
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "Doctor created successfully",
  "data": {
    "id": "2f2c0ff4-3874-4714-b8ee-95849e49b323",
    "specialization": "Cardiology",
    "licenseNumber": "DOC-CARD-2026-001",
    "consultationFee": "600.00",
    "user": {
      "firstName": "NamanShah",
      "lastName": "DoctorShah",
      "email": "dr.naman@yopmail.com"
    }
  }
}
```

---

### 3.2 Check Doctor Availability & Time Slot Conflicts
Checks doctor availability status and detects booked appointment conflicts for a time slot.

- **Method**: `GET`
- **Route**: `/api/doctors/2f2c0ff4-3874-4714-b8ee-95849e49b323/check-availability?dateTime=2026-08-25T10:30:00Z`
- **Access**: Authenticated (`RECEPTIONIST`, `PATIENT`, `ADMIN`, `DOCTOR`)
- **Headers**: `Authorization: Bearer <accessToken>`
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Doctor availability checked successfully",
  "data": {
    "isAvailable": true,
    "reason": "Doctor is available for the requested time slot",
    "requestedDateTime": "2026-08-25T10:30:00.000Z",
    "doctor": {
      "id": "2f2c0ff4-3874-4714-b8ee-95849e49b323",
      "name": "Dr. NamanShah DoctorShah",
      "availabilityStatus": "AVAILABLE",
      "consultationFee": "600.00",
      "specialization": "Cardiology"
    }
  }
}
```

---

### 3.3 Update Doctor Availability Status
- **Method**: `PATCH`
- **Route**: `/api/doctors/2f2c0ff4-3874-4714-b8ee-95849e49b323/availability`
- **Access**: `ADMIN`, `DOCTOR`, `RECEPTIONIST`
- **Headers**: `Authorization: Bearer <accessToken>`, `Content-Type: application/json`
- **Request Body**:
```json
{
  "availabilityStatus": "ON_LEAVE"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Doctor availability updated successfully",
  "data": {
    "id": "2f2c0ff4-3874-4714-b8ee-95849e49b323",
    "availabilityStatus": "ON_LEAVE"
  }
}
```

---

## 📅 4. Appointment Module (`/api/appointments`)

### 4.1 Book Appointment
Requires `departmentId`, `doctorId`, and future `appointmentDateTime`.

- **Method**: `POST`
- **Route**: `/api/appointments`
- **Access**: Authenticated (`PATIENT`, `RECEPTIONIST`, `ADMIN`)
- **Headers**: `Authorization: Bearer <accessToken>`, `Content-Type: application/json`
- **Request Body**:
```json
{
  "departmentId": "4bbb2896-d046-46ff-a24c-c4dff01064d6",
  "doctorId": "2f2c0ff4-3874-4714-b8ee-95849e49b323",
  "appointmentDateTime": "2026-08-25T10:30:00.000Z",
  "appointmentType": "CONSULTATION",
  "reason": "Routine cardiac health checkup"
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "Appointment created successfully",
  "data": {
    "id": "6eef6516-4f31-44f0-8864-d52fcede0c81",
    "appointmentDateTime": "2026-08-25 10:30:00",
    "appointmentType": "CONSULTATION",
    "status": "PENDING",
    "reason": "Routine cardiac health checkup",
    "department": {
      "id": "4bbb2896-d046-46ff-a24c-c4dff01064d6",
      "departmentName": "Cardiology"
    }
  }
}
```

---

### 4.2 Confirm Appointment
- **Method**: `PATCH`
- **Route**: `/api/appointments/6eef6516-4f31-44f0-8864-d52fcede0c81/confirm`
- **Access**: `ADMIN`, `RECEPTIONIST`
- **Headers**: `Authorization: Bearer <accessToken>`
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Appointment confirmed successfully",
  "data": {
    "id": "6eef6516-4f31-44f0-8864-d52fcede0c81",
    "status": "CONFIRMED"
  }
}
```

---

### 4.3 Complete Appointment (Auto-Generates Invoice)
Updating status to `COMPLETED` automatically generates an invoice bill containing the Doctor's Consultation Fee and any Medical Report charges.

- **Method**: `PATCH`
- **Route**: `/api/appointments/6eef6516-4f31-44f0-8864-d52fcede0c81/status`
- **Access**: `ADMIN`, `DOCTOR`, `RECEPTIONIST`
- **Headers**: `Authorization: Bearer <accessToken>`, `Content-Type: application/json`
- **Request Body**:
```json
{
  "status": "COMPLETED"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Appointment status updated successfully",
  "data": {
    "id": "6eef6516-4f31-44f0-8864-d52fcede0c81",
    "status": "COMPLETED"
  }
}
```

---

## 📄 5. Medical Report Module (`/api/medical-reports`)

### 5.1 Create Medical Report
Can **ONLY** be created when appointment status is `CONFIRMED`. Automatically calculates `reportCharge` and generates a downloadable PDF report.

- **Method**: `POST`
- **Route**: `/api/medical-reports`
- **Access**: `DOCTOR`
- **Headers**: `Authorization: Bearer <DOCTOR_ACCESS_TOKEN>`, `Content-Type: application/json`
- **Request Body**:
```json
{
  "appointmentId": "6eef6516-4f31-44f0-8864-d52fcede0c81",
  "reportName": "Complete Blood Count (CBC)",
  "reportType": "LAB_TEST",
  "result": "Hemoglobin: 14.2 g/dL, WBC: 7,500 /mcL, Platelets: 250,000 /mcL. Normal.",
  "normalRange": "13.5 - 17.5 g/dL",
  "unit": "g/dL",
  "remarks": "Patient blood profile is healthy.",

  "reportCharge": 420
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "Medical report created successfully",
  "data": {
    "medicalReport": {
      "id": "855fcc8b-71c2-4029-9a9f-5c202549d8a5",
      "reportNumber": "REP-1786950459443",
      "reportName": "Complete Blood Count (CBC)",
      "reportType": "LAB_TEST",
      "result": "Hemoglobin: 14.2 g/dL, WBC: 7,500 /mcL, Platelets: 250,000 /mcL. Normal.",
      "reportCharge": 420,
      "reportFileUrl": "/uploads/medical-reports/REP-1786950459443.pdf",
      "generatedAt": "2026-08-17T07:07:39.446Z"
    }
  }
}
```

---

## 🧾 6. Billing & Payment Module (`/api/billings`)

### 6.1 Process Invoice Payment
- **Method**: `POST`
- **Route**: `/api/billings/YOUR_BILLING_ID/payments`
- **Access**: `ADMIN`, `RECEPTIONIST`
- **Headers**: `Authorization: Bearer <accessToken>`, `Content-Type: application/json`
- **Request Body**:
```json
{
  "amount": 1020,
  "paymentMethod": "CREDIT_CARD",
  "transactionId": "TXN-CARD-998877",
  "description": "Payment for consultation fee (₹600) and CBC test (₹420)"
}
```
- **Response (200 OK)**:
## 🏥 7. Hospital Profile Module (`/api/hospital`)

### 7.1 Get Hospital Details
Fetches details of the hospital (Name, address, contact numbers, operating hours, bed count, website, etc.).

- **Method**: `GET`
- **Route**: `/api/hospital`
- **Access**: Public / Authenticated
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Hospital details fetched successfully",
  "data": {
    "hospital": {
      "id": "e8d64111-236b-4228-bdf1-3316f731c34a",
      "name": "Apex LifeCare Super Speciality Hospital",
      "code": "HOSP-APEX-001",
      "tagline": "Excellence in Healthcare & Patient Wellness",
      "description": "A state-of-the-art multi-speciality tertiary care hospital offering advanced clinical services, 24/7 emergency response, intensive care units, and specialized surgery suites.",
      "email": "info@apexlifecarehospital.com",
      "phone": "+91 9876543210",
      "emergencyPhone": "+91 9876500911",
      "address": "100 Medical Campus Road, Near City Circle",
      "city": "Ahmedabad",
      "state": "Gujarat",
      "country": "India",
      "postalCode": "380009",
      "website": "https://www.apexlifecarehospital.com",
      "establishedYear": 2012,
      "totalBeds": 350,
      "operatingHours": "24 Hours Emergency, OPD: 09:00 AM - 08:00 PM (Mon-Sat)",
      "logoUrl": "/uploads/hospital-logo.png"
    }
  }
}
```

---

### 7.2 Update Hospital Details
Updates hospital information (Name, phone numbers, operating hours, bed capacity, logo, etc.).

- **Method**: `PATCH`
- **Route**: `/api/hospital`
- **Access**: `ADMIN`
- **Headers**: `Authorization: Bearer <ADMIN_ACCESS_TOKEN>`, `Content-Type: application/json`
- **Request Body**:
```json
{
  "name": "Apex LifeCare Super Speciality Hospital",
  "phone": "+91 9876543210",
  "emergencyPhone": "+91 9876500911",
  "operatingHours": "24/7 Emergency & OPD Services",
  "totalBeds": 400
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Hospital details updated successfully",
  "data": {
    "hospital": {
      "id": "e8d64111-236b-4228-bdf1-3316f731c34a",
      "name": "Apex LifeCare Super Speciality Hospital",
      "totalBeds": 400
    }
  }
}
```


