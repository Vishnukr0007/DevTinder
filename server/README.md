# DevTinder Backend API Architecture

```text
DevTinder
│
├── 🔐 Authentication (Completed)
├── 👤 User Profiles (Completed)
├── 🔍 Developer Discovery (Completed)
├── 🤝 Connections (Completed)
├── 💬 Messaging & WebSockets (Completed)
├── 🛠️ Projects (Completed)
├── 🌐 Community (Phase 2)
└── 👑 Administration (Completed)
```

---

## 🗄️ PostgreSQL Database ERD Architecture

```text
                               PostgreSQL
                                   │
       ┌───────────────────────────┼───────────────────────────┐
       │                           │                           │
      User                     UserSkill                    Project
       │                           │                           │
       ├───────────────────────────┤                           ├──────────────┐
       │                           │                           │              │
Connections                 SavedDeveloper               ProjectMember     Report
       │
    Messages
```

---

## 📐 Entity-Relationship Schema Map

```mermaid
erDiagram
    USER ||--o{ USER_SKILL : "possesses (Skill & Level)"
    USER ||--o{ PROJECT : "creates / owns"
    USER ||--o{ PROJECT_MEMBER : "participates in"
    PROJECT ||--o{ PROJECT_MEMBER : "contains"
    
    USER ||--o{ CONNECTION_REQUEST : "sents / receives (Connections)"
    USER ||--o{ MESSAGE : "sends / receives (Messages)"
    USER ||--o{ SAVED_DEVELOPER : "saves / is saved by"
    USER ||--o{ REPORT : "reports / is reported by"

    USER {
        string id PK
        string email UK
        string firstName
        string lastName
        string role "USER | ADMIN | MODERATOR"
        boolean isSuspended
        boolean isEmailVerified
    }

    USER_SKILL {
        string id PK
        string userId FK
        string name
        string level "BEGINNER | INTERMEDIATE | ADVANCED | EXPERT"
    }

    PROJECT {
        string id PK
        string userId FK
        string title
        string status "RECRUITING | IN_PROGRESS | COMPLETED"
        int maxMembers
    }

    PROJECT_MEMBER {
        string id PK
        string projectId FK
        string userId FK
        string role "OWNER | MEMBER"
        string status "PENDING | ACCEPTED | REJECTED | INVITED"
    }

    CONNECTION_REQUEST {
        string id PK
        string senderId FK
        string receiverId FK
        string status "PENDING | ACCEPTED | REJECTED | IGNORED"
    }

    MESSAGE {
        string id PK
        string senderId FK
        string receiverId FK
        string content
        boolean isRead
    }

    SAVED_DEVELOPER {
        string id PK
        string userId FK
        string savedId FK
    }

    REPORT {
        string id PK
        string reporterId FK
        string targetUserId FK
        string status "PENDING | RESOLVED | DISMISSED"
    }
```

---

## 🔐 1. Authentication & Security Flow

```text
                      User Logs In
                           │
                    Email + Password
                           │
                   Verify Credentials
                           │
                  Create Session / JWT
                           │
                  Authenticated User
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
   Role = USER                           Role = ADMIN
        │                                     │
 ├── View developers       ✅          ├── View developers       ✅
 ├── Send connection       ✅          ├── Manage users          ✅
 ├── Delete another user   ❌ (403)     ├── Delete user           ✅
 └── Access admin panel    ❌ (403)     └── Admin dashboard       ✅
```

---

## 🛡️ 2. Role Capability & Enforcement Matrix

| Feature / Action | Normal Developer (`USER`) | Platform Admin (`ADMIN`) | Middleware Guard |
| :--- | :---: | :---: | :--- |
| **View Developer Discovery** | ✅ Allowed | ✅ Allowed | `protect` |
| **Send Connection Request** | ✅ Allowed | ✅ Allowed | `protect` |
| **1-on-1 Real-time Chat** | ✅ Matched Users | ✅ Matched Users | `protect` |
| **Create & Join Projects** | ✅ Allowed | ✅ Allowed | `protect` |
| **Access Admin Dashboard** | ❌ **Forbidden (403)** | ✅ Allowed | `authorize("ADMIN")` |
| **Manage & Suspend Users** | ❌ **Forbidden (403)** | ✅ Allowed | `authorize("ADMIN")` |
| **Delete User Account** | ❌ **Forbidden (403)** | ✅ Allowed | `authorize("ADMIN")` |
| **Global Platform Settings**| ❌ **Forbidden (403)** | ✅ Allowed | `authorize("ADMIN")` |

---

## 🔑 3. Authentication Endpoints Overview

| Method | Endpoint Route | Access | Description |
| :---: | :--- | :---: | :--- |
| `POST` | `/api/auth/signup` | Public | Register new developer account with default `USER` role. |
| `POST` | `/api/auth/login` | Public | Authenticate user, issue JWT token & set HTTP-only cookie. |
| `POST` | `/api/auth/logout` | Public / Auth | Destroy session and clear cookie. |
| `GET` | `/api/auth/me` | Private | Fetch current authenticated user profile & skills. |
| `POST` | `/api/auth/forgot-password` | Public | Generate 15-minute password reset token. |
| `POST` | `/api/auth/reset-password` | Public | Reset password using valid reset token. |
| `POST` | `/api/auth/send-verification`| Private / Public | Generate 24-hour email verification token. |
| `POST` | `/api/auth/verify-email` | Public | Verify email address token. |

---

## 📄 4. Postman Collection Documentation

The complete Postman Collection JSON is exported and available at:
`[DevTinder_Authentication_Postman_Collection.json](./DevTinder_Authentication_Postman_Collection.json)`

### How to Import into Postman:
1. Open **Postman**.
2. Click **Import** in the top left.
3. Select `DevTinder_Authentication_Postman_Collection.json`.
4. Set the collection environment variable `baseUrl` to `http://localhost:8000`.



