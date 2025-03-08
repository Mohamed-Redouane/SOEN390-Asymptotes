# 🏫 ONCampus - Concordia Campus Guide

<p align="center">
  <img src="https://github.com/user-attachments/assets/4345910f-a2d4-4a38-9040-c836e6e95eea" alt="Project Image">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.0.0-blue" alt="React Version">
  <img src="https://img.shields.io/badge/Express.js-5.0.0-yellow" alt="Express Version">
  <img src="https://img.shields.io/badge/PostgreSQL-16-blue" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/TailwindCSS-4.0.0-teal" alt="TailwindCSS">
  <img src="https://img.shields.io/badge/Cypress-14.0.0-green" alt="Cypress">
  <img src="https://img.shields.io/badge/Vitest-1.2.0-orange" alt="Vitest">
  <img src="https://img.shields.io/badge/GitHub_Actions-CI/CD-success" alt="GitHub Actions">
</p>

## 📌 Table of Contents
<a name="top"></a>
<details>
<summary>Click to expand</summary>

- [Description](#-description)
- [Features](#-features)
- [Built With](#-built-with)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Testing](#-testing)
- [Team Members](#-team-members)
</details>

---

## 📖 Description
**ONCampus** is a **Campus Guide Web Application** for **Concordia University**. It helps students navigate **both the SGW and Loyola campuses**, find indoor and outdoor directions, and access **points of interest**.  

### 🎯 Purpose:
- Assist students in **finding buildings, classrooms, and facilities**.
- Provide **real-time outdoor and indoor navigation**.
- Support **Google Calendar integration** for directions to the next class.
- Support **Concordia Open Data API** for class schedules.
- Offer **smart planning** for multiple tasks.

---

## 🚀 Features
### ✅ **Campus Map Exploration**
✔ Support for **SGW & Loyola** campus maps.  
✔ Highlight **campus buildings** for easy identification.  
✔ **Toggle switch** between campuses.  
✔ Show the **user’s current location** on campus.  
✔ Provide **building information pop-ups**.

### 🗺 **Outdoor Directions**
✔ Search for buildings.  
✔ Start from the **current location**.  
✔ Get **Google API-powered** directions.  
✔ **Multi-modal transportation** (Walk, Car, Public Transit, Shuttle).  
✔ Time-aware and location-aware **Concordia Shuttle Service**.

### 📆 **Directions to Next Class**
✔ **Google Calendar integration** for automated next-class directions.  
✔ Support for **multiple calendars**.  

### 🏢 **Indoor Navigation**
✔ Locate **rooms on different floors**.  
✔ Display the **shortest path**.  
✔ Offer **disability-friendly routes**.  
✔ Highlight **points of interest** (washrooms, water fountains, elevators).  
✔ **Cross-campus indoor directions**.

### 🍔 **Outdoor Points of Interest**
✔ Show nearby **restaurants, coffee shops, and study areas**.  
✔ Provide directions to selected points of interest.

### 🧠 **Smart Planner**
✔ Generate an **optimized task plan** with directions.  
✔ Minimize walking time and exposure to weather.  

---

## 🛠 Built With

- **Frontend:** React, Vite, TailwindCSS  
- **Backend:** Node.js, Express.js, PostgreSQL  
- **Testing:** Cypress (E2E), Vitest (unit tests)  
- **CI/CD:** GitHub Actions  
- **APIs:** Google Maps API, Google Calendar API, Concordia Open Data API  
- **Deployment:** Docker, Railway  

---

## 💻 Installation

### 📋 Prerequisites:
- **Node.js** (version 18.16.0 or later)  
- **npm** (or `yarn`)  
- **PostgreSQL** (with a configured database)  

### 🔧 Setup Instructions:
1. **Clone the repository**:
   ```bash
   git clone https://github.com/Mohamed-Redouane/SOEN390-Asymptotes.git
   cd SOEN390-Asymptotes
   ```

2. **Install dependencies**:

   **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   **Backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Start the application**:
   - Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔑 Environment Variables
We provide a file named `.env.example` with placeholder environment variables. To configure your local environment:

1. **Create a `.env` File**  
   Copy `.env.example` to a new file called `.env` in the **Backend** folder (and in the **Frontend** folder if applicable):
   ```bash
   cp .env.example .env
   ```
2. **Update Values**  
   Open `.env` and replace the placeholder values with the correct information for your local environment (e.g., database credentials, API keys).
3. **Do Not Commit `.env`**  
   Your `.env` file should be ignored by Git to keep sensitive data private.

---

## 🧪 Testing
Run unit and end-to-end tests:

- **Vitest (Unit Tests)**:
  ```bash
  npm run test
  ```

- **Cypress (E2E Tests)**:
  ```bash
  npx cypress open
  ```

---

## 👥 Team Members

| Name                     | Student ID |
|--------------------------|------------|
| Alvaro Gonzalez          | 40153040   |
| Naika Jean-Baptiste      | 40227367   |
| Yassine Ouali            | 40187964   |
| William Charron-Boyle    | 40264407   |
| Kadir Altinay            | 40166610   |
| Mohammed Saaim Intikhab  | 40196916   |
| Mohamed Redhouane Nemroud| 40153847   |
| Rasel Abdul Samad        | 40209924   |
| Mehdi Kahouache          | 40250581   |
| Darren Vafi              | 40246358   |

---

<p align="right">(<a href="#top">Back to top</a>)</p>
