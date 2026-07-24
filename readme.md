## Reverse: 1999 Wordle

---

![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-005571.svg?style=for-the-badge&logo=fastapi)
![Docker](https://img.shields.io/badge/docker-257bd6?style=for-the-badge&logo=docker&logoColor=white)
![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![TypeScript](https://img.shields.io/badge/typescript-%233178C6.svg?style=for-the-badge&logo=typescript&logoColor=white)

## Description:

A Wordle-inspired guessing game based on Reverse: 1999 characters, featuring deterministic daily challenges and attribute-based comparison mechanics.

The concept: using a deterministic shuffle with a fixed seed to ensure reproducible ordering, every day there's a different character chosen from a database in PostgreSQL. You can take guesses and get hints about specific characteristics such as afflatus, version, etc — whether it's right, wrong, higher, or lower. Each guess is supposed to get you closer to today's character. Good luck!

## Live Demo

The project is fully deployed and available at:

**[https://r1999dle.vercel.app/]**

| Service    | Platform |
| ---------- | -------- |
| Frontend   | Vercel   |
| Backend    | Render   |
| Database   | Neon     |

## Architecture

The project follows a client-server architecture.

### Components

- **Frontend (React)**  
  Handles UI rendering, user input, and game interaction. Communicates with the backend via REST API.
- **Backend (FastAPI)**  
  Provides REST endpoints, handles game logic, and manages the daily character selection system.
- **Database (PostgreSQL)**  
  Stores the character dataset used by the game.

### Data Flow

1. The frontend sends requests (e.g., character guesses) to the backend.
2. The backend retrieves or processes data using the in-memory dataset.
3. The backend applies game logic (comparison between guessed and daily character).
4. The response is returned as JSON to the frontend.
5. The frontend updates the UI based on the response.

### Architecture Overview

User → React Frontend → FastAPI Backend → PostgreSQL / In-memory Data → FastAPI → React Frontend

---

## Current Project State

The project is complete and deployed.

### Backend

- Fully functional REST API built with FastAPI;
- Character dataset loaded from PostgreSQL database;
- Deterministic daily character system based on date;
- Complete game logic for daily character guessing (attribute comparison system);
- Endpoints for retrieving characters and submitting guesses;

### Frontend

- Complete React application with component-based structure;
- Full game interface with daily and unlimited modes;
- Attribute-based guess history with visual feedback (correct, partial, incorrect);
- Progress bar tracking remaining attempts;
- Winner/loser modal with countdown to next daily character;
- Shareable results via clipboard copy and Twitter post;
- Statistics tracking via localStorage;
- Internationalization support via i18next;
- Multiple visual themes with animated backgrounds;
- Fully responsive layout supporting mobile and desktop;

### Database

- PostgreSQL database integrated with backend;
- Character dataset successfully loaded into memory on startup;
- `database/` folder contains `schema.sql`, `seed.sql`, and `generate-seed.py` — add new characters to `data.json` and run the script to regenerate the seed;

---

## Technologies Used

### Backend

- Python;
- FastAPI;
- PostgreSQL;

### Frontend

- React;
- TypeScript;
- React Router;
- i18next (internationalization);
- CSS3;

### Infrastructure

- Docker & Docker Compose;
- Vercel (frontend);
- Render (backend);
- Neon (database);

### Dev Tools

- Vite;
- ESLint;
- Prettier;

### Development Practices

- Git & GitHub;
- Conventional Commits;
- Clean Code principles;

## Endpoint Map:

The API url base is `http://127.0.0.1:8000/`. All endpoints are listed below.

### Characters — `/characters`

| Method | Endpoint                  | Description                   | Authentication |
| ------ | ------------------------- | ----------------------------- | -------------- |
| `GET`  | `/characters`             | Returns all characters        | No             |
| `GET`  | `/characters/{slug}`      | Returns a specific character  | No             |
| `GET`  | `/characters/random-id`   | Returns a random character id | No             |

**Response of `/characters`:**

```json
[
  {
    "name": "Balloon Party",
    "slug": "balloon-party"
  },
  {
    "name": "La Source",
    "slug": "la-source"
  }
  // more characters...
]
```

**Response of `/characters/{slug}` with an example:**

```json
{
  "name": "Liang Yue",
  "rarity": 6,
  "afflatus": "Star",
  "dmg_type": "Reality",
  "race": "Mixed",
  "version": 2.5
}
```

**Response of `/characters/random-id`:**

```json
{
  "id": 42
}
```

**Note:** The definition of "slug" in this case is the lowercase name of the character without any accent or punctuation, and any space is changed for a "-". Example: Ms. New Babel -> ms-new-babel.

### Guess — `/guess`

| Method | Endpoint      | Description                                               | Authentication |
| ------ | ------------- | --------------------------------------------------------- | -------------- |
| `POST` | `/guess`      | Guess against today's daily character                     | No             |
| `POST` | `/guess/{id}` | Guess against a specific character by id (unlimited mode) | No             |
| `GET`  | `/guess/daily-result` | Returns today's character name and slug           | No             |

**Body of `/guess` and `/guess/{id}`:**

```json
{
  "slug": "liang-yue"
}
```

**Response of `/guess` and `/guess/{id}`:**

```json
{
  "name": { "value": "Liang Yue", "correct": false },
  "rarity": { "value": 6, "comparison": "Lower" },
  "afflatus": { "value": "Star", "correct": false },
  "dmg_type": { "value": "Reality", "correct": false },
  "race": { "value": "Mixed", "correct": false },
  "version": { "value": 2.5, "comparison": "Lower" }
}
```

**Response of `/guess/daily-result`:**

```json
{
  "name": "Baby Blue",
  "slug": "baby-blue"
}
```

## How to Run

### With Docker (recommended)

#### Prerequisites

- Docker & Docker Compose installed
- A `.env` file in the project root with the following variables:

```env
DB_NAME=r1999_wordle
DB_USER=your_user
DB_PASSWORD=your_password
```

#### Run

```bash
docker compose up --build
```

| Service  | URL                    |
| -------- | ---------------------- |
| Frontend | http://localhost:5173  |
| Backend  | http://localhost:8000  |
| Database | localhost:5433         |

### Without Docker

#### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL running locally

#### 1. Clone the repository

```bash
git clone https://github.com/your-username/reverse-1999-wordle.git
cd reverse-1999-wordle
```

#### 2. Database

```bash
cd database
python generate-seed.py  # generates seed.sql from data.json
```

Then in your PostgreSQL instance:

```sql
CREATE DATABASE r1999_wordle;
```

Run `schema.sql` then `seed.sql` to set up and populate the database.

#### 3. Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
```

Configure your connection in `backend/database.py`, then:

```bash
uvicorn main:app --reload
```

Available at http://127.0.0.1:8000

#### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Available at http://localhost:5173

---

## Contributing:

Developed by:

- [Raphael Augusto Paulino Leite](https://github.com/rapael-augusto)

## A Few, Non Technical, Words:

So, I built this project for two reasons:
1. I like Reverse: 1999.
2. There wasn't already a Reverse: 1999 Wordle (at least, I don't think there was at the moment).

Even though it started as a small learning project and a way for me to apply what I knew about React, it also became a journey where I learned how to build a proper back end, create animations, work with the HTML canvas, and much more.
I didn't expect anyone to actually play it, but seeing people enjoy it makes me really proud of having built it.

So, thank you for being here and for witnessing this project. Remember to "Make good use of this umbrella", 'kay?
