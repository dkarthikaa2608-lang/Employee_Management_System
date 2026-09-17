EMPLOYEE MANAGEMENT SYSTEM - READY PROJECT
==============================================

This project is prepared as a complete beginner-friendly CRUD web application.

TECHNOLOGY
----------
Frontend : HTML5, CSS3, JavaScript
Backend  : Python Flask
Database : SQLite

FEATURES
--------
1. Create employee
2. Read employee list
3. Update employee
4. Delete employee
5. Search by employee name
6. Search by department
7. Client-side validation
8. Server-side validation
9. Email validation
10. Phone validation
11. Salary validation
12. Duplicate email handling
13. Invalid ID handling
14. Professional responsive UI
15. REST API endpoints

FOLDER STRUCTURE
----------------
Employee_Management_System_FINAL/
|
+-- Frontend/
|   +-- index.html
|   +-- style.css
|   +-- script.js
|   |
|   +-- Backend/
|       +-- app.py
|       +-- database.py
|       +-- employee.db
|       +-- requirements.txt
|
+-- START_PROJECT.bat
+-- README.txt

HOW TO RUN
----------
STEP 1:
Install Python 3 on your Windows laptop if it is not already installed.

STEP 2:
Open the project folder in VS Code.

STEP 3:
Open a terminal in the Backend folder.

STEP 4:
Run:
    pip install -r requirements.txt

STEP 5:
Run:
    python app.py

STEP 6:
Open this address in Chrome:
    http://127.0.0.1:5000

IMPORTANT:
Do NOT double-click index.html for the normal run.
Run Flask first and open http://127.0.0.1:5000

ALTERNATIVE ONE-CLICK RUN
-------------------------
Double-click START_PROJECT.bat from the main project folder.
It will install Flask and start the application.

API ENDPOINTS
-------------
GET    /api/employees
GET    /api/employees/<id>
POST   /api/employees
PUT    /api/employees/<id>
DELETE /api/employees/<id>

TEST DATA
---------
You can add an employee from the form.

Example:
Name       : Priya
Email      : priya@gmail.com
Phone      : 9876543210
Department : AIML
Job Role   : Software Developer
Salary     : 45000

SEARCH TEST
-----------
After adding employees, type:
    Priya
in the search box.

The matching employee will be displayed immediately.
You can also search by department such as:
    AIML
    CSE
    IT

STOP SERVER
-----------
In the terminal where Flask is running, press:
    Ctrl + C

PROJECT NOTE
------------
The SQLite database file is created/updated automatically.
Do not delete employee.db while the application is running.
