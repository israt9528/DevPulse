# DevPulse

**Live URL:** [Insert Live Deployment URL Here]

A collaborative backend platform for software teams to report bugs, suggest features, and coordinate resolutions. Built with Node.js and PostgreSQL using raw SQL for maximum performance and query control.

---

## ✨ Features

1. **Secure Authentication:** JWT-based stateless authentication with securely hashed passwords using bcrypt.
2. **Role-Based Access Control (RBAC):** Distinct permissions for contributors (create/manage own issues) and maintainers (global management).
3. **Issue Management:** Complete CRUD operations for bugs and feature requests.
4. **Advanced Querying:** Filter and sort issues dynamically by status, type, and date.
5. **Raw SQL Performance:** Built directly on top of PostgreSQL's native pg driver, bypassing heavy ORMs.

---

## ⚙️ Setup & Installation

**1. Prerequisites**

- Node.js (v24.x LTS or higher)
- PostgreSQL database

**2. Clone the Repository**

```bash
git clone [https://github.com/yourusername/devpulse.git](https://github.com/yourusername/devpulse.git)
cd devpulse
```

**3. Install Dependencies**

```bash
npm install
```

**4. Environment Variables**
Create a `.env` file in the root directory and add the following configurations:

```env
PORT=3000
DATABASE_URL=postgres://username:password@localhost:5432/devpulse_db
JWT_SECRET=your_super_secret_jwt_key
```

**5. Database Setup**
Since this project uses Raw SQL, initialize your database manually. Connect to PostgreSQL and execute the schema script:

```bash
psql -d devpulse_db -f src/db/schema.sql
```

**6. Run the Application**

- **Development Mode:** `npm run dev`
- **Production Build:** `npm run build && npm start`

---

## 🌐 API Endpoints

_All protected routes require an `Authorization` header containing a valid JWT: `Authorization: <JWT_TOKEN>`_

### Authentication Module

- **POST** `/api/auth/signup` - (Public) Register a new user (contributor or maintainer).
- **POST** `/api/auth/login` - (Public) Authenticate user credentials and return a signed JWT.

### Issues Module

- **POST** `/api/issues` - (Authenticated) Create a new bug report or feature request.
- **GET** `/api/issues` - (Public) Retrieve all issues. Supports `?sort`, `?type`, and `?status` query parameters.
- **GET** `/api/issues/:id` - (Public) Retrieve full details of a specific issue, including nested reporter data.
- **PATCH** `/api/issues/:id` - (Restricted) Update issue details. Maintainers can update any issue; Contributors can only update their own open issues.
- **DELETE** `/api/issues/:id` - (Maintainer Only) Permanently remove an issue from the system.

---

## 🗄️ Database Schema Summary

_Note: Foreign key constraints are validated via application logic rather than at the database level._

### `users` Table

- **id**: SERIAL (Primary Key, Auto-incrementing)
- **name**: VARCHAR (NOT NULL)
- **email**: VARCHAR (UNIQUE, NOT NULL)
- **password**: VARCHAR (NOT NULL, Stored as bcrypt hash)
- **role**: VARCHAR (DEFAULT 'contributor', must be 'contributor' or 'maintainer')
- **created_at**: TIMESTAMP (DEFAULT CURRENT_TIMESTAMP)
- **updated_at**: TIMESTAMP (DEFAULT CURRENT_TIMESTAMP)

### `issues` Table

- **id**: SERIAL (Primary Key, Auto-incrementing)
- **title**: VARCHAR(150) (NOT NULL)
- **description**: TEXT (NOT NULL, Minimum 20 characters)
- **type**: VARCHAR (NOT NULL, must be 'bug' or 'feature_request')
- **status**: VARCHAR (DEFAULT 'open', must be 'open', 'in_progress', or 'resolved')
- **reporter_id**: INT (NOT NULL, App-level relation to users.id)
- **created_at**: TIMESTAMP (DEFAULT CURRENT_TIMESTAMP)
- **updated_at**: TIMESTAMP (DEFAULT CURRENT_TIMESTAMP)
