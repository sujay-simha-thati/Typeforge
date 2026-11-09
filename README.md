Here is a professional project summary for **TYPEFORGE**, tailored specifically to highlight your **GitHub and Render** deployment architecture:

---

# Project Summary: TYPEFORGE

### Tagline: Master Your Typing. Measure Your Speed. Improve Every Day.

## 1. Executive Overview

**TYPEFORGE** is a modern, high-performance, full-stack typing speed training platform engineered for students, professionals, and users looking to enhance their keyboard proficiency. By combining a sleek, dark-themed glassmorphism interface with a robust enterprise-grade Java backend, TYPEFORGE delivers a seamless experience for speed measurement, accuracy tracking, and touch-typing education. The application is version-controlled via **GitHub** and deployed live on **Render**.

## 2. Technology Stack & Infrastructure

* **Backend:** Java 17, Spring Boot, Spring Web, RESTful APIs, Maven.
* **Frontend:** HTML5, Tailwind CSS, Modern JavaScript (ES6+).
* **Data Persistence:** Browser LocalStorage for user preferences and historical performance logs.
* **Deployment & Hosting:**
* **Version Control:** GitHub repository for seamless code management.
* **Cloud Platform:** Render Web Service hosting.
* **Containerization:** Production-ready `Dockerfile` and Maven build configuration supporting automated cloud builds.



## 3. Core Features & Functionality

* **Dynamic Typing Modes:** Offers structured challenges including Quick Sprint (1 min), Deep Focus (5 min), and Endurance Challenge (10 min) across Easy, Medium, and Hard difficulty levels.
* **Custom Paragraph Practice:** Enables users to paste long articles, code snippets, or notes to train on domain-specific vocabulary.
* **Real-Time Typing Arena:** Features live keystroke tracking, instantaneous WPM calculation, dynamic accuracy measurement, and character-level visual feedback (green for correct, red for incorrect).
* **Performance Results Dashboard:** Automatically computes Gross WPM, Net WPM, and accuracy percentage, accompanied by a personalized improvement guide.
* **Interactive Learning Centre:** Provides touch-typing guidance, home row finger allocation diagrams, and proper ergonomic posture recommendations.
* **Persistent History Log:** Tracks past test results, best performance benchmarks, and historical growth over time.

## 4. System Architecture & Backend API

The application follows a modular MVC (Model-View-Controller) architecture:

* **`/api/health`:** System status check endpoint ensuring high availability on cloud servers.
* **`/api/calculate`:** Secure server-side calculation endpoint that processes raw keystroke counts, validates input metrics, and returns precise speed and accuracy statistics.

## 5. Deployment Workflow (GitHub & Render)

* **Continuous Integration:** Source code is pushed to a public **GitHub** repository, ensuring proper version tracking and backup.
* **Cloud Deployment:** **Render** automatically pulls from the GitHub repository, builds the application using Maven or the project's `Dockerfile`, and exposes the live backend API globally. *(Note: On Render's free tier, inactive instances spin down after a brief period and automatically wake up upon the next incoming request).*
