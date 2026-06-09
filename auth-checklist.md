# Authentication Implementation Checklist

## Backend

- [x] 1. Install auth dependencies (`python-jose`, `passlib`, `bcrypt`) — add to `requirements.txt`
- [x] 2. Add `User` model to `db/database.py` — `id`, `email`, `hashed_password`, `created_at`
- [x] 3. Add auth schemas to `models/schemas.py` — `UserRegister`, `UserLogin`, `TokenResponse`
- [x] 4. Create `services/auth_service.py` — password hashing, JWT create/verify helpers
- [x] 5. Create `routers/auth.py` — `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- [x] 6. Add JWT middleware/dependency `get_current_user` for protecting routes
- [x] 7. Register auth router in `main.py`

## Frontend

- [x] 8. Create `context/AuthContext.jsx` — `user`, `token`, `login`, `logout`, `register` state
- [x] 9. Create `pages/Login.jsx` — email/password form
- [x] 10. Create `pages/Register.jsx` — email/password/confirm form
- [x] 11. Create `components/ProtectedRoute.jsx` — redirects to `/login` if not authenticated
- [x] 12. Update `App.jsx` — wrap with `AuthProvider`, add `/login` `/register` routes, protect dashboard routes
- [x] 13. Update `Navbar.jsx` — show user email + logout button when logged in
