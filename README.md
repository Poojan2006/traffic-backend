# 🚦 Traffic Violation Management System (Trivo)

An AI-powered, full-stack application designed to modernize urban traffic enforcement. Trivo empowers civilians to report violations, utilizes Google Gemini AI to automatically assess evidence, and provides an end-to-end dashboard for police officers to issue fines and track geospatial hotspots.

---

## ✨ Key Features

- **🤖 AI Evidence Analysis:** Upload a photo of a traffic violation, and the integrated Google Gemini AI will automatically detect the offense type and calculate the recommended fine based on the Indian Motor Vehicles Act.
- **👮‍♂️ Role-Based Dashboards:** Distinct, secure interfaces customized for **Civilians**, **Police Officers**, and **Admins** using JWT Authentication.
- **📍 Geospatial Heatmaps:** A dynamic, interactive map plotting the exact GPS coordinates of reported violations, allowing police to visualize city-wide enforcement hotspots.
- **📄 Downloadable E-Challans:** Automatically generates clean, professional PDF receipts for verified and paid violations.
- **🏆 Civic Rewards System:** Gamifies community reporting. Civilians earn points and climb "Civic Ranks" (Bronze, Silver, Gold Sentinel) for every successfully verified report they submit.
- **✨ Premium UI:** A stunning, fully-responsive dark mode glassmorphism interface built with React.

---

## 📂 Repository Structure (Monorepo)

This repository contains both the frontend and backend applications:

```text
/
├── traffic-backend/      # Spring Boot Java Application (REST APIs, Security, AI)
└── traffic-frontend/     # React + Vite Application (UI, Maps, PDF Gen)
```

---

## 🛠️ Technology Stack

**Backend (`traffic-backend/`):**
- Java 17 & Spring Boot 3.5.x
- Spring Security (JWT Tokens)
- Spring Data JPA & H2 In-Memory Database
- Spring AI (Google Gemini Flash Integration)

**Frontend (`traffic-frontend/`):**
- React 18 & Vite
- Vanilla CSS (Glassmorphism & Plus Jakarta Sans)
- `react-leaflet` (Interactive Maps)
- `jsPDF` & `html2canvas` (PDF Generation)
- `axios` (API Networking)

---

## 🚀 Getting Started

### 1. Configure Secrets (.env)
Both the frontend and backend require a `.env` file to store sensitive keys securely.
1. Navigate to `traffic-backend/` and copy the example file:
   ```bash
   cp .env.example .env
   ```
2. Open the new `.env` file and insert your **Google Gemini API Key** and a random **JWT Secret String**. *(You can get a free API key at [Google AI Studio](https://aistudio.google.com/app/apikey))*.

### 2. Run the Backend (Spring Boot)
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd traffic-backend
   ```
2. Compile and run the server using Maven wrapper:
   ```bash
   ./mvnw clean spring-boot:run
   ```
*(The backend will start locally on `http://localhost:8080`. The database automatically seeds default Admin and Police accounts on startup).*

### 3. Run the Frontend (React)
1. Open a second terminal window and navigate to the frontend folder:
   ```bash
   cd traffic-frontend
   ```
2. Install the necessary node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
*(The frontend will start locally on `http://localhost:5173` or port 5177).*

---

## 🔐 Default Test Accounts

When the backend starts up, it automatically seeds the database with the following accounts for testing:

| Role     | Email            | Password   |
|----------|------------------|------------|
| **Admin**  | `admin@trivo.com`  | `admin123`   |
| **Police** | `police@trivo.com` | `police123`  |

*(You can freely register new Civilian accounts via the 'Sign Up' page in the UI).*
# traffic-backend
# traffic-frontend
