# 🛠 Backend – Django Project Guide

This backend powers the Questionnaire Admin Dashboard. It is built with **Django** and **Django REST Framework (DRF)**.  
The project is organized by apps (e.g. `users`, `questionnaire`, etc.), each app typically containing:

- `models.py` → database tables (ORM models)  
- `serializers.py` → data validation and JSON conversion  
- `views.py` → request/response logic (API endpoints)  
- `routes.py` (or `urls.py`) → URL mappings to views  
- `admin.py` → Django admin site config  
- `tasks.py` → background jobs (Celery)  

A new developer should start by understanding how these files connect together.

---

# 📂 Users App

The `users` app defines custom user accounts and authentication-related logic.  
This is the **best place to learn the Django flow** because it’s small and self-contained.

Reference hierarchy:

```text
backend/users/
├── admin.py        # Integration with Django admin dashboard
├── apps.py         # Django app config
├── managers.py     # Custom user manager
├── models.py       # User model definition
├── routes.py       # URL routes for user endpoints
├── serializers.py  # JSON validation and conversion
├── tasks.py        # Background tasks (e.g. session cleanup)
└── views.py        # API views for user operations
```

---

## 🔎 How Files Connect

Django apps follow a **chain**:

1. **Model (`models.py`)** → Defines database schema.  
2. **Serializer (`serializers.py`)** → Translates between Python objects and JSON (validates input).  
3. **View (`views.py`)** → Handles HTTP requests and responses using models + serializers.  
4. **Route (`routes.py`)** → Connects views to actual URLs.  

This pattern repeats in every app.

---

## 📄 File Documentation

### **models.py**
- Defines database tables using Django ORM.
- In this project, we use a **custom User model** based on `AbstractBaseUser`.  
- The `UserManager` in `managers.py` handles creation (`create_user`, `create_superuser`).

**Work with it:**
```python
user = User.objects.create(email="a@b.com", password="...")
users = User.objects.filter(is_staff=True)
```

---

### **serializers.py**
- Defines how User data is **validated and exposed in APIs**.  
- Example serializers:
  - `UserSerializer` → read-only representation (`id`, `email`, etc.).  
  - `RegisterSerializer` → validates input for creating new users (`email`, `password`).  

**Work with it:**
```python
serializer = UserSerializer(user)
print(serializer.data)  # {"id": 1, "email": "a@b.com", "is_staff": false}
```

---

### **views.py**
- Defines the **API endpoints** that handle requests.  
- Example:
  - `RegisterView` → uses `RegisterSerializer` to create new users.  
  - `UserListView` → returns all users.

**Work with it:**
```python
# POST /users/register/ {"email": "a@b.com", "password": "secret"}
# → Creates a new user
# GET /users/ → Lists all users
```

---

### **routes.py**
- Maps URLs to views.  
- Example:
```python
urlpatterns = [
    path("users/register/", RegisterView.as_view(), name="register"),
    path("users/", UserListView.as_view(), name="users"),
]
```

This makes the API accessible via `/users/register/` and `/users/`.

---

### **admin.py**
- Integrates the custom `User` model with Django’s **built-in admin site**.  
- Useful for superusers to manage users manually via a GUI.

---

### **tasks.py**
- Defines background jobs using **Celery**.  
- Example: `clearsessions` runs Django’s `clearsessions` command automatically.

---

## 🔄 End-to-End Example: User Flow

This example ties everything together.

1. **POST** `/users/register/` with:
   ```json
   { "email": "a@b.com", "password": "secret" }
   ```
   → `RegisterSerializer` validates input → `create_user` saves to DB → response:
   ```json
   { "id": 1, "email": "a@b.com", "is_staff": false }
   ```

2. **GET** `/users/`  
   → `UserListView` fetches all users → `UserSerializer` formats → response:
   ```json
   [
     { "id": 1, "email": "a@b.com", "is_staff": false }
   ]
   ```

---

# 🧭 Key Takeaways for New Developers

- **Models** define how data is stored.  
- **Serializers** ensure safe, structured data flow in/out of the app.  
- **Views** define behavior when an API endpoint is hit.  
- **Routes** connect endpoints to URLs.  
- **Admin** makes models manageable in the built-in GUI.  
- **Tasks** allow running background jobs.  

This pattern repeats in other apps (`questionnaire`, `logicbuilder`, `videomanagement`).  

