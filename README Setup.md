# 🧩 Admin Dashboard Setup Guide (Windows)

## ⚙️ 1. Install Required Tools

### 🟢 Node.js (NPM)
- [Download Node.js](https://nodejs.org/en/download)
- Add the **npm bin folder** to your Windows *Environment Variables*.

### 🧭 Git
- [Download Git](https://git-scm.com/downloads)
- Add the **Git bin folder** to your *Environment Variables*.

### 🐍 Python
- [Download Python](https://www.python.org/downloads/)
- Add the **Python bin folder** to your *Environment Variables*.

### 🐳 Docker
- [Download Docker Desktop](https://www.docker.com/get-started/)
- Add the **Docker bin folder** to your *Environment Variables*.

### 🧰 Make (GNUWin32)
- [Download GNU Make (Complete Package)](https://gnuwin32.sourceforge.net/packages/make.htm)
- Add the **Make bin folder** to your *Environment Variables*.

### 🗄️ MySQL
- [Download MySQL Installer](https://dev.mysql.com/downloads/file/?id=544662)
- During installation:
  - Use **Port:** `3306`  
  - Set **Admin Password:** `password`
- Add the **MySQL bin folder** to your *Environment Variables*.

> ⚠️ **Important:**  
> If the port or password changes, update the following line in your `.env` file:  
> ```
> DATABASE_URL=mysql-connector://admin_dashboard:password@db:3306/admin_dashboard
> ```

### 💻 *(Optional)* MySQL Workbench
- [Download MySQL Workbench](https://dev.mysql.com/downloads/file/?id=544368)

### 🧩 Visual Studio Code
- [Download Visual Studio Code](https://code.visualstudio.com/)

---

## 🪣 2. Configure Source Control

In **VS Code**:
1. Open the **Source Control** panel.  
2. Add the remote repository:

   ```bash
   git@github.com:ronakvir/admin_dashboard_METY_TECH.git
   ```

## 🔄 3. Verify Installation

> 💡 If commands fail (pip, make, git, docker, etc.), ensure all *Environment Variables* are correctly configured.  
> 🔁 **Restart your computer** to apply changes.

---

## 🧱 4. Initialize the Project

Open the project in **VS Code**, then run the following commands in the integrated terminal:

```bash
cp backend/admin_dashboard/settings/local.py.example backend/admin_dashboard/settings/local.py
cp backend/.env.example backend/.env
```

## 🧾 5. Configure Environment Variables

Open your newly created `.env` file and replace its contents with the following:

```bash
DJANGO_SETTINGS_MODULE=admin_dashboard.settings.local
CELERY_BROKER_URL=amqp://broker:5672//
REDIS_URL=redis://result:6379

# Please choose postgres or sqlite as your DB:
#DATABASE_URL=postgres://admin_dashboard:password@db:5432/admin_dashboard
#DATABASE_URL=sqlite:///db.sqlite3

DATABASE_URL=mysql-connector://admin_dashboard:password@db:3307/admin_dashboard

SKIP_PREFLIGHT_CHECK=true
FAST_REFRESH=false

GEMINI_API_KEY=AIzaSyDSxjolBQ8xwIQ0BVuQ5en1jDx9NXztnzQ
```

## 🧩 6. Setup and Run Docker

Run the following commands in the project terminal:

```bash
make docker_setup
make docker_migrate
make docker_up
docker ps
docker exec -it admin_dashboard_mety_tech-backend-1 bash
python manage.py createsuperuser
```

When prompted:
- Enter your desired **email**  
- Enter and confirm your **password**  
→ This creates your local superuser account.

---

## 🌐 7. Access the Application

Once Docker is running, open your browser and go to:

👉 [http://localhost:8000/](http://localhost:8000/)

---

## 🧩 Notes
- Ensure all **environment variables** are set correctly.
- **Restart your PC** after installing and configuring paths.
- Use **MySQL Workbench** for database visualization (optional).

---

✅ You’re all set! Your local development environment should now be up and running.
