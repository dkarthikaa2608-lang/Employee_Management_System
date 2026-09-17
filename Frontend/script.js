const API_URL = "/api/employees";

const form = document.getElementById("employeeForm");
const employeeBody = document.getElementById("employeeBody");
const searchInput = document.getElementById("searchInput");
const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const refreshBtn = document.getElementById("refreshBtn");
const formTitle = document.getElementById("formTitle");
const formMessage = document.getElementById("formMessage");
const employeeCount = document.getElementById("employeeCount");
const emptyState = document.getElementById("emptyState");

let employees = [];
let editingId = null;

document.addEventListener("DOMContentLoaded", loadEmployees);
form.addEventListener("submit", saveEmployee);
searchInput.addEventListener("input", renderEmployees);
cancelEditBtn.addEventListener("click", resetForm);
refreshBtn.addEventListener("click", loadEmployees);

async function loadEmployees() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Unable to load employees.");
        }

        employees = data;
        renderEmployees();
    } catch (error) {
        showMessage(error.message, "error");
    }
}

function renderEmployees() {
    const searchText = searchInput.value.toLowerCase().trim();

    const filteredEmployees = employees.filter(employee =>
        employee.name.toLowerCase().includes(searchText) ||
        employee.department.toLowerCase().includes(searchText)
    );

    employeeBody.innerHTML = "";

    filteredEmployees.forEach(addEmployeeRow);

    employeeCount.textContent =
        `${filteredEmployees.length} employee${filteredEmployees.length === 1 ? "" : "s"}`;

    emptyState.classList.toggle("hidden", filteredEmployees.length !== 0);
}

function addEmployeeRow(employee) {
    const row = document.createElement("tr");

    row.innerHTML = `
        <td>${escapeHtml(employee.id)}</td>
        <td>${escapeHtml(employee.name)}</td>
        <td>${escapeHtml(employee.email)}</td>
        <td>${escapeHtml(employee.phone)}</td>
        <td>${escapeHtml(employee.department)}</td>
        <td>${escapeHtml(employee.role)}</td>
        <td class="salary">${formatSalary(employee.salary)}</td>
        <td>
            <button class="edit-btn" type="button">Edit</button>
            <button class="delete-btn" type="button">Delete</button>
        </td>
    `;

    row.querySelector(".edit-btn").addEventListener("click", () => editEmployee(employee));
    row.querySelector(".delete-btn").addEventListener("click", () => deleteEmployee(employee.id));

    employeeBody.appendChild(row);
}

async function saveEmployee(event) {
    event.preventDefault();

    const employee = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        department: document.getElementById("department").value.trim(),
        role: document.getElementById("role").value.trim(),
        salary: document.getElementById("salary").value.trim()
    };

    const validationError = validateEmployee(employee);
    if (validationError) {
        showMessage(validationError, "error");
        return;
    }

    const isEditing = editingId !== null;
    const url = isEditing ? `${API_URL}/${editingId}` : API_URL;

    try {
        submitBtn.disabled = true;
        submitBtn.textContent = isEditing ? "Updating..." : "Adding...";

        const response = await fetch(url, {
            method: isEditing ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(employee)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Operation failed.");
        }

        showMessage(
            isEditing ? "Employee updated successfully!" : "Employee added successfully!",
            "success"
        );

        resetForm(false);
        await loadEmployees();
    } catch (error) {
        showMessage(error.message, "error");
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = editingId !== null ? "Update Employee" : "Add Employee";
    }
}

function validateEmployee(employee) {
    if (!employee.name || !employee.email || !employee.phone ||
        !employee.department || !employee.role || !employee.salary) {
        return "Please fill all fields.";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(employee.email)) {
        return "Please enter a valid email address.";
    }

    if (!/^\d{10}$/.test(employee.phone)) {
        return "Phone number must contain exactly 10 digits.";
    }

    if (Number(employee.salary) <= 0) {
        return "Salary must be greater than 0.";
    }

    return null;
}

function editEmployee(employee) {
    editingId = employee.id;

    document.getElementById("name").value = employee.name;
    document.getElementById("email").value = employee.email;
    document.getElementById("phone").value = employee.phone;
    document.getElementById("department").value = employee.department;
    document.getElementById("role").value = employee.role;
    document.getElementById("salary").value = employee.salary;

    formTitle.textContent = "Update Employee";
    submitBtn.textContent = "Update Employee";
    cancelEditBtn.classList.remove("hidden");
    form.scrollIntoView({ behavior: "smooth", block: "start" });
    showMessage("Editing selected employee.", "success");
}

async function deleteEmployee(id) {
    const employee = employees.find(item => item.id === id);
    const name = employee ? employee.name : "this employee";

    if (!confirm(`Are you sure you want to delete ${name}?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Unable to delete employee.");
        }

        showMessage("Employee deleted successfully!", "success");

        if (editingId === id) {
            resetForm(false);
        }

        await loadEmployees();
    } catch (error) {
        showMessage(error.message, "error");
    }
}

function resetForm(clearMessage = true) {
    form.reset();
    editingId = null;
    formTitle.textContent = "Add Employee";
    submitBtn.textContent = "Add Employee";
    cancelEditBtn.classList.add("hidden");

    if (clearMessage) {
        showMessage("", "");
    }
}

function showMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = `message ${type}`;
}

function formatSalary(value) {
    const number = Number(value);
    if (Number.isNaN(number)) return value;
    return `₹${number.toLocaleString("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    })}`;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
