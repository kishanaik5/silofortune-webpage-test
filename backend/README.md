# Silo Fortune Project Documentation

This repository contains the source code for the Silo Fortune website and backend API.

## 🛠️ Tech Stack & Versions

### Backend
*   **Language**: Python 3.8+
*   **Framework**: FastAPI (`0.109.0`)
*   **Server**: Uvicorn (`0.27.0`)
*   **Database**: PostgreSQL
*   **ORM**: SQLAlchemy (`2.0.25`)
*   **Authentication**: Python-jose (JWT) (`3.3.0`), Passlib (Bcrypt) (`1.7.4`)
*   **Validation**: Pydantic (`2.6.0`)
*   **Database Driver**: Psycopg2-binary (`2.9.9`)
*   **Environment**: Python-dotenv (`1.0.1`)

### Frontend
*   **Structure**: HTML5
*   **Styling**: Vanilla CSS3 (Custom Design System, Glassmorphism)
*   **Logic**: Vanilla JavaScript (ES6+)
*   **Fonts**: Google Fonts (Inter, Outfit)

## 🚀 Getting Started

### 1. Prerequisites
*   **Python 3.8+** installed.
*   **PostgreSQL** installed and running locally.

### 2. Database Setup
1.  Ensure PostgreSQL service is active.
2.  Create the database:
    ```sql
    CREATE DATABASE silo_fortune;
    ```
3.  (Optional) Configure connection string in `.env` or `backend/database.py`. Default is:
    `postgresql://postgres:postgres@localhost:5432/silo_fortune`

### 3. Install Backend Dependencies
Navigate to the root directory and run:
```bash
pip install -r backend/requirements.txt
```

### 4. Run the Server
From the root directory:
```bash
python -m uvicorn backend.main:app --reload
```
*   **API Base URL**: `http://127.0.0.1:8000`
*   **Interactive Docs**: `http://127.0.0.1:8000/docs`

### 5. Accessing the Frontend
Open `index.html` in your browser (Live Server recommended for best results).

## 🔑 Admin Credentials (Temporary)

To access the Admin Dashboard for managing Jobs and Blogs, use the following credentials:

*   **Email**: `admin@silofortune.com`
*   **Password**: `admin123`

> **Note**: These are temporary credentials for development/testing purposes. Please change them in a production environment.

## 📂 Project Structure
*   **`backend/`**: Contains FastAPI app, database models, schemas, and API logic.
*   **`*.html`**: Frontend pages (index, marketing, developers, blogs, careers, contact).
*   **`styles.css`**: Main stylesheet containing the design system.
*   **`script.js`**: Frontend logic for API interactions and UI dynamism.

