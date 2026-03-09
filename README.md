# Fair Dice Project

Follow these quick steps to get the Django backend and the web app running on your local machine.

## Prerequisites
- Python 3.x installed
- An SQL client (MySQL Workbench, DBeaver, etc.)

## 1. Set Up a Virtual Environment
Open your terminal, navigate to the project folder, and create a Python virtual environment to keep the dependencies isolated.

If you are on Windows, run these two commands one after the other:

```bash
python -m venv venv
venv\Scripts\activate
```

If you are on macOS or Linux, run:

```bash
python3 -m venv venv
source venv/bin/activate
```

## 2. Install Dependencies
Make sure your virtual environment is active (you should see a `(venv)` tag in your terminal). Then, install everything the project needs by running:

```bash
pip install -r requirements.txt
```

## 3. Apply Database Migrations
Generate all the required tables (including the user table for authentication) by running:

```bash
python manage.py migrate
```

## 4. Start the Server
Fire up the Django development server with:

```bash
python manage.py runserver
```

## 5. Play the Game
Open your favorite web browser and go to:

```
http://127.0.0.1:8000
```

That's it! You can now test the registration, login, and the dice commitment protocol.

