# 	Sadik Company Support 

A full-stack customer support ticketing platform with a real AI assistant
(Claude) that can be embedded on **any website** as a chat widget, plus a
staff dashboard for managing tickets.

**Architecture (unchanged from the original project):**
FastAPI + SQLAlchemy + MySQL backend, JWT authentication, plain HTML/CSS/JS
frontend. No framework or database changes — the database schema
(`users`, `tickets`, `comments`) is exactly as it was.

---

## What's inside

```
backend/    FastAPI API (auth, tickets, comments, admin, AI, widget)
frontend/   Plain HTML/CSS/JS dashboard (login, tickets, admin panel)
```

The embeddable chat widget itself is served **by the backend** at
`/static/widget.js`, since it needs to be reachable from other websites,
independent of where your own dashboard frontend is hosted.

---

## 1. Backend setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Edit `backend/.env`:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ai_customer_support

SECRET_KEY=replace-with-a-long-random-string

ANTHROPIC_API_KEY=sk-ant-...        # from https://console.anthropic.com/settings/keys
ANTHROPIC_MODEL=claude-haiku-4-5-20251001

ALLOWED_ORIGINS=*                   # or a comma-separated list of domains
```

Create the MySQL database once (tables are auto-created on first run):

```sql
CREATE DATABASE ai_customer_support;
```

Run the API:

```bash
uvicorn app.main:app --reload
```

The API is now live at `http://127.0.0.1:8000`. Interactive docs at
`http://127.0.0.1:8000/docs`.

### Making a user an admin

There's intentionally no API endpoint to self-promote to admin (that would
be a security hole). Register a normal account through the app, then run:

```sql
UPDATE users SET role = 'admin' WHERE email = 'you@example.com';
```

Log out and back in afterward so a fresh JWT picks up the new role.

---

## 2. Frontend setup

The frontend is static HTML/JS — no build step. Just open
`frontend/index.html` in a browser, or serve the folder:

```bash
cd frontend
python3 -m http.server 5500
```

Then visit `http://127.0.0.1:5500`.

If your backend isn't running on `http://127.0.0.1:8000`, update
`frontend/assets/js/config.js`:

```js
window.API_BASE_URL = "https://your-api-domain.com";
```

**Pages:**
- `index.html` / `register.html` — sign in / create account
- `dashboard.html` — a customer's own tickets, create new ones
- `ticket.html` — ticket detail, comment thread; admins additionally get
  a status dropdown and an "AI: Suggest a reply" button
- `admin.html` — stats + every ticket across all customers (admin only)
- `widget-demo.html` — shows the embeddable widget running on a mock,
  completely unrelated storefront page, to prove it works standalone

---

## 3. Embedding the AI widget on any website

Add this single tag to any site's HTML, anywhere before `</body>`:

```html
<script
  src="https://your-api-domain.com/static/widget.js"
  data-api="https://your-api-domain.com"
  data-business="Your Company Name"
></script>
```

That's it — no login, no build step, no dependency on the dashboard
frontend at all. It renders a chat bubble that:
1. Answers questions using Claude in real time (`POST /ai/widget-chat`,
   public, no auth).
2. Offers "Talk to a human" — collects name/email/details and calls
   `POST /widget/create-ticket`, which creates a real ticket (auto-creating
   a lightweight account behind the scenes so the visitor never needs to
   see a password) that immediately shows up in the admin dashboard.

Widget styling is isolated in a Shadow DOM, so it can never clash with the
host site's CSS.

---

## What was actually broken, and what was fixed

The project you uploaded had a corrupted/incomplete zip (only backend
source survived; frontend, docs, and tests were empty). Beyond rebuilding
the frontend, going through the recovered backend surfaced several real
bugs, which are now fixed:

1. **The "AI" wasn't AI.** `/ai/suggest-response` was hardcoded keyword
   matching (`if "order" in message: ...`) — no LLM was ever called. It now
   calls the real Anthropic API (`app/services/ai_service.py`), and there's
   a new public `/ai/widget-chat` endpoint for the embeddable widget.
2. **The AI endpoint required login**, which is impossible for an
   anonymous visitor on someone else's website. It's now split into an
   authenticated agent-assist endpoint and a public widget endpoint.
3. **CORS only allowed `localhost:5173`/`5174`.** A widget embedded on any
   other domain would've been blocked by the browser. Now configurable via
   `ALLOWED_ORIGINS` in `.env` (defaults to `*`).
4. **The admin router was never registered in `main.py`.** `routes/admin.py`
   existed but `app.include_router(admin.router)` was missing, so several
   admin endpoints were unreachable dead code.
5. **Admin ticket-status updates were scoped to the admin's own tickets**,
   due to a query filtering by the admin's `user_id` instead of the
   ticket's actual owner — meaning an admin could only manage tickets that
   happened to belong to themselves. Fixed, and extended with proper
   admin routes to view/reply to any customer's ticket.
6. **`main.py` had duplicate, dead route definitions** shadowed by
   `routes/tickets.py` and `routes/login.py` (Starlette matches the first
   registered route for a given path, so the copies in `main.py` never
   actually ran). Removed the dead code and consolidated on the router
   modules.
7. **`requirements.txt` was a full `pip freeze` of a Jupyter dev
   environment** (100+ unrelated packages), not the project's actual
   dependencies. Replaced with a minimal, pinned list.
8. Removed several unused/duplicate scaffold files
   (`app/api/login.py`, `app/me.py`, `app/user_service.py`,
   `app/services/user_service.py`) that duplicated logic living elsewhere
   and were never imported.

Everything above was verified with real end-to-end tests (register → login
→ create ticket → admin cross-ticket reply/status update → guest widget
ticket creation) before packaging.

---

## API quick reference

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/register` | none | Create account |
| POST | `/login` | none | Get JWT (form-encoded `username`/`password`) |
| GET | `/me` | user | Current profile |
| POST | `/tickets` | user | Create ticket |
| GET | `/tickets` | user | List my tickets |
| GET/PUT/DELETE | `/tickets/{id}` | user (owner) | View/update/delete a ticket |
| PATCH | `/tickets/{id}/close` | user (owner) | Close a ticket |
| GET/POST | `/tickets/{id}/comments` | user (owner) | View/add comments |
| GET | `/admin/dashboard` | admin | Stats |
| GET | `/admin/tickets` | admin | All tickets |
| GET/POST | `/admin/tickets/{id}` , `/admin/tickets/{id}/comments` | admin | View/reply to any ticket |
| PATCH | `/admin/tickets/{id}/status` | admin | Update any ticket's status |
| POST | `/ai/suggest-response` | user | Agent-assist AI draft reply |
| POST | `/ai/widget-chat` | none | Public widget chat |
| POST | `/widget/create-ticket` | none | Public guest ticket creation |
| GET | `/static/widget.js` | none | The embeddable widget script |
