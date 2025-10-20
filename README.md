---

# 📚 **QuillMark — Book Review System**

QuillMark is a full-stack **Book Review and Management System** built using **React.js (frontend)** and **Express + SQLite + MongoDB (backend)**.
It allows users to browse, review, and rate books, while administrators can manage the library collection directly from the UI.

---

## 🚀 **Overview**

QuillMark simplifies how readers and admins interact with book collections.
It combines an elegant, secure login/signup system with role-based access (Admin/User), persistent session management, and dual-database integration (SQLite for core data, MongoDB for analytics and demo storage).

---

## 🧩 **Key Features**

### 👤 **User Features**

* Secure **signup** and **login** with validation and hashed passwords.
* **Browse all books** with search and genre filters.
* **Add reviews and ratings** for any book.
* Submit reviews directly to **MongoDB** (demo integration).
* Clean, mobile-friendly UI with modern glass-style login/signup pages.

### 🛠️ **Admin Features**

* Full CRUD control:

  * ➕ Add new books.
  * ✏️ Edit existing book details.
  * ❌ Delete books.
* Access to average rating and total ratings count.
* Instant database seeding with a default admin account:

  ```
  username: admin
  password: admin123
  ```

### 💾 **Database**

* **SQLite (better-sqlite3)** — Primary relational DB for users, books, reviews, and ratings.
* **MongoDB** — Secondary NoSQL demo collection for saving user review snapshots.

---

## ⚙️ **Tech Stack**

| Layer         | Technology                       | Purpose                        |
| ------------- | -------------------------------- | ------------------------------ |
| Frontend      | React.js, React Router v7        | Component-based SPA UI         |
| Styling       | CSS3                             | Custom responsive UI           |
| Backend       | Node.js, Express                 | REST API server                |
| Database      | SQLite + MongoDB                 | Structured + unstructured data |
| Security      | bcrypt.js, UUID                  | Password hashing & sessions    |
| Communication | Fetch API (REST)                 | Frontend ↔ Backend             |
| Auth          | In-memory session (X-Session-Id) | Lightweight token system       |

---

## 🗂️ **Project Structure**

```
Book-Review-System/
│
├── backend/
│   ├── server.js             # Express server + routes + SQLite + Mongo setup
│   ├── db.sqlite             # SQLite database
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js            # Main router + AuthContext
│   │   ├── api.js            # REST API service wrappers
│   │   ├── App.css           # Global UI styles
│   │   ├── auth.css          # Login/Signup glass UI
│   │   ├── index.js          # ReactDOM render
│   │   ├── data/
│   │   │   └── books.js      # Default cover fallback util
│   │   ├── components/
│   │   │   ├── navbar.js     # Role-based navigation bar
│   │   │   └── StarRating.js # Interactive star component
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── Reviewdetails.js
│   │   │   ├── Addreview.js
│   │   │   ├── Editreview.js
│   │   │   ├── Deletereview.js
│   │   │   ├── login.js
│   │   │   └── signup.js
│   └── package.json
│
└── README.md
```

---

## 🔐 **Authentication Flow**

1. **Signup/Login** → User credentials validated → Passwords hashed via `bcryptjs`.
2. Server returns `sessionId` (UUID) stored in `localStorage`.
3. Each subsequent API request includes `X-Session-Id` header.
4. Middleware authorizes user before executing protected routes.

---

## 🌐 **Backend Endpoints**

| Endpoint             | Method | Access        | Description                         |
| -------------------- | ------ | ------------- | ----------------------------------- |
| `/auth/signup`       | POST   | Public        | Register a new user                 |
| `/auth/login`        | POST   | Public        | Authenticate user                   |
| `/auth/logout`       | POST   | Authenticated | End session                         |
| `/auth/me`           | GET    | Authenticated | Get current user                    |
| `/books`             | GET    | Authenticated | List all books                      |
| `/books/:id`         | GET    | Authenticated | Get book by ID                      |
| `/books`             | POST   | Admin         | Add a new book                      |
| `/books/:id`         | PUT    | Admin         | Update book details                 |
| `/books/:id`         | DELETE | Admin         | Delete a book                       |
| `/books/:id/reviews` | GET    | Authenticated | Get reviews for book                |
| `/books/:id/reviews` | POST   | Authenticated | Add new review                      |
| `/mongo/insert`      | POST   | Authenticated | Insert review snapshot into MongoDB |

---

## 🧠 **Database Schema (SQLite)**

**books**
| id | title | author | year | genre | cover | description |

**reviews**
| id | book_id | username | stars | text | created_at |

**ratings**
| id | book_id | stars |

**users**
| id | username | password_hash | role |

---

## 🖼️ **UI Highlights**

| Page                  | Description                                          |
| --------------------- | ---------------------------------------------------- |
| 🏠 **Home**           | Browse books, search, filter by genre                |
| 📘 **Review Details** | View description, submit ratings, push to MongoDB    |
| ➕ **Add Book**        | Admin-only book form                                 |
| ✏️ **Edit/Delete**    | Manage entries directly                              |
| 🔑 **Login/Signup**   | Glass-style responsive screens with background image |

---

## 🧮 **Sample Workflow**

1. Run backend → `npm start` in `/backend`
2. Run frontend → `npm start` in `/frontend`
3. Login as `admin / admin123`
4. Add new books → Appears instantly on home grid.
5. Users can log in → Browse, rate, and review.
6. Optionally send review snapshots to MongoDB (`/mongo/insert`).

---
## 🧰 **Setup & Usage**

### 1️⃣ Clone and install:

```bash
git clone <repo-url>
cd backend && npm install
cd ../frontend && npm install
```

### 2️⃣ Run backend:

```bash
node server.js
# or for live reload:
npx nodemon server.js
```

### 3️⃣ Run frontend:

```bash
npm start
```

### 4️⃣ Environment variables:

```bash
MONGO_URL=mongodb://127.0.0.1:27017
MONGO_DB=mwa_demo
```
---

## 🏁 **Future Enhancements**

* JWT-based authentication.
* User profile pages and review history.
* Cloud MongoDB (Atlas) integration.
* Book image uploads via Multer.
* Pagination and advanced search.
* Analytics dashboard for admins.

---

## 📜 **License**

MIT © 2025 QuillMark Developers

---
