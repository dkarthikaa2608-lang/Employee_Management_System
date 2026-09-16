from flask import Flask, jsonify, request, send_from_directory
from pathlib import Path
import re
import sqlite3

from database import get_connection, init_db

app = Flask(__name__)

BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR.parent


def validate_employee(data):
    if not isinstance(data, dict):
        return "Invalid request data."

    required_fields = ["name", "email", "phone", "department", "role", "salary"]

    for field in required_fields:
        value = data.get(field)
        if value is None or str(value).strip() == "":
            return f"{field.capitalize()} is required."

    email = str(data["email"]).strip()
    phone = str(data["phone"]).strip()

    if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", email):
        return "Please enter a valid email address."

    if not re.fullmatch(r"\d{10}", phone):
        return "Phone number must contain exactly 10 digits."

    try:
        salary = float(data["salary"])
        if salary <= 0:
            return "Salary must be greater than 0."
    except (TypeError, ValueError):
        return "Salary must be a valid number."

    return None


def employee_from_row(row):
    return {
        "id": row["id"],
        "name": row["name"],
        "email": row["email"],
        "phone": row["phone"],
        "department": row["department"],
        "role": row["role"],
        "salary": row["salary"]
    }


@app.route("/")
def home():
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.route("/style.css")
def style():
    return send_from_directory(FRONTEND_DIR, "style.css")


@app.route("/script.js")
def script():
    return send_from_directory(FRONTEND_DIR, "script.js")


@app.route("/api/employees", methods=["GET"])
def get_employees():
    connection = get_connection()
    rows = connection.execute(
        "SELECT * FROM employees ORDER BY id ASC"
    ).fetchall()
    connection.close()

    return jsonify([employee_from_row(row) for row in rows])


@app.route("/api/employees/<int:employee_id>", methods=["GET"])
def get_employee(employee_id):
    connection = get_connection()
    row = connection.execute(
        "SELECT * FROM employees WHERE id = ?",
        (employee_id,)
    ).fetchone()
    connection.close()

    if row is None:
        return jsonify({"error": "Employee not found."}), 404

    return jsonify(employee_from_row(row))


@app.route("/api/employees", methods=["POST"])
def create_employee():
    data = request.get_json(silent=True)
    error = validate_employee(data)

    if error:
        return jsonify({"error": error}), 400

    connection = get_connection()

    try:
        cursor = connection.execute("""
            INSERT INTO employees
            (name, email, phone, department, role, salary)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            str(data["name"]).strip(),
            str(data["email"]).strip(),
            str(data["phone"]).strip(),
            str(data["department"]).strip(),
            str(data["role"]).strip(),
            float(data["salary"])
        ))

        connection.commit()
        employee_id = cursor.lastrowid

        row = connection.execute(
            "SELECT * FROM employees WHERE id = ?",
            (employee_id,)
        ).fetchone()

        return jsonify(employee_from_row(row)), 201

    except sqlite3.IntegrityError:
        return jsonify({"error": "An employee with this email already exists."}), 409

    finally:
        connection.close()


@app.route("/api/employees/<int:employee_id>", methods=["PUT"])
def update_employee(employee_id):
    data = request.get_json(silent=True)
    error = validate_employee(data)

    if error:
        return jsonify({"error": error}), 400

    connection = get_connection()

    try:
        existing = connection.execute(
            "SELECT id FROM employees WHERE id = ?",
            (employee_id,)
        ).fetchone()

        if existing is None:
            return jsonify({"error": "Employee not found."}), 404

        connection.execute("""
            UPDATE employees
            SET name = ?, email = ?, phone = ?, department = ?, role = ?, salary = ?
            WHERE id = ?
        """, (
            str(data["name"]).strip(),
            str(data["email"]).strip(),
            str(data["phone"]).strip(),
            str(data["department"]).strip(),
            str(data["role"]).strip(),
            float(data["salary"]),
            employee_id
        ))

        connection.commit()

        row = connection.execute(
            "SELECT * FROM employees WHERE id = ?",
            (employee_id,)
        ).fetchone()

        return jsonify(employee_from_row(row))

    except sqlite3.IntegrityError:
        return jsonify({"error": "Another employee already uses this email."}), 409

    finally:
        connection.close()


@app.route("/api/employees/<int:employee_id>", methods=["DELETE"])
def delete_employee(employee_id):
    connection = get_connection()

    cursor = connection.execute(
        "DELETE FROM employees WHERE id = ?",
        (employee_id,)
    )

    if cursor.rowcount == 0:
        connection.close()
        return jsonify({"error": "Employee not found."}), 404

    connection.commit()
    connection.close()

    return jsonify({"message": "Employee deleted successfully."})


@app.errorhandler(404)
def page_not_found(error):
    return jsonify({"error": "Resource not found."}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error."}), 500


if __name__ == "__main__":
    init_db()
    print("Employee Management System is running.")
    print("Open: http://127.0.0.1:5000")
    app.run(host="127.0.0.1", port=5000, debug=True)
