const API_URL = "https://portfolio-3-production.up.railway.app/api";

let currentToken = localStorage.getItem("token");
let currentUsername = localStorage.getItem("username");

// DOM Elements
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const dashboard = document.getElementById("dashboard");
const logoutBtn = document.getElementById("logout-btn");
const usernameDisplay = document.getElementById("username-display");

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  if (currentToken) {
    showDashboard();
  } else {
    showLoginForm();
  }

  setupEventListeners();
});

function setupEventListeners() {
  // Auth forms
  document
    .getElementById("login-form-element")
    .addEventListener("submit", handleLogin);
  document
    .getElementById("register-form-element")
    .addEventListener("submit", handleRegister);
  document
    .getElementById("toggle-register")
    .addEventListener("click", toggleForms);
  document
    .getElementById("toggle-login")
    .addEventListener("click", toggleForms);

  // Logout
  logoutBtn.addEventListener("click", handleLogout);

  // Project form
  document
    .getElementById("project-form")
    .addEventListener("submit", handleAddProject);

  // Navigation
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      switchSection(e.target.dataset.section, e.target);
    });
  });
}

function toggleForms(e) {
  e.preventDefault();
  loginForm.style.display =
    loginForm.style.display === "none" ? "flex" : "none";
  registerForm.style.display =
    registerForm.style.display === "none" ? "flex" : "none";
}

async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (data.success) {
      currentToken = data.token;
      currentUsername = data.user.username;
      localStorage.setItem("token", currentToken);
      localStorage.setItem("username", currentUsername);
      showDashboard();
      document.getElementById("login-form-element").reset();
    } else {
      alert("فشل التحقق من بيانات الدخول");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("حدث خطأ أثناء التحقق");
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const username = document.getElementById("reg-username").value;
  const password = document.getElementById("reg-password").value;

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (data.success) {
      currentToken = data.token;
      currentUsername = data.user.username;
      localStorage.setItem("token", currentToken);
      localStorage.setItem("username", currentUsername);
      showDashboard();
      document.getElementById("register-form-element").reset();
    } else {
      alert("فشل إنشاء الحساب");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("حدث خطأ أثناء إنشاء الحساب");
  }
}

function handleLogout() {
  currentToken = null;
  currentUsername = null;
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  showLoginForm();
}

function showLoginForm() {
  loginForm.style.display = "flex";
  registerForm.style.display = "none";
  dashboard.style.display = "none";
}

function showDashboard() {
  loginForm.style.display = "none";
  registerForm.style.display = "none";
  dashboard.style.display = "flex";
  usernameDisplay.textContent = `أهلاً ${currentUsername}`;
  loadProjects();
}

function switchSection(section, trigger) {
  document
    .querySelectorAll(".section")
    .forEach((s) => s.classList.remove("active"));
  document
    .querySelectorAll(".nav-link")
    .forEach((l) => l.classList.remove("active"));

  const sectionEl = document.getElementById(section + "-section");
  if (sectionEl) sectionEl.classList.add("active");

  // Prefer explicit trigger element; otherwise find the nav-link by data-section
  let activeLink = trigger;
  if (!activeLink) {
    activeLink = document.querySelector(`.nav-link[data-section="${section}"]`);
  }
  if (activeLink) activeLink.classList.add("active");
}
async function loadProjects() {
  try {
    const response = await fetch(`${API_URL}/projects`, {
      headers: { Authorization: `Bearer ${currentToken}` },
    });

    const data = await response.json();
    const container = document.getElementById("projects-container");

    if (!data.success || data.count === 0) {
      container.innerHTML = '<p class="no-projects">لا توجد مشاريع حالياً</p>';
      return;
    }

    container.innerHTML = `
      <table class="projects-table">
        <thead>
          <tr>
            <th>العنوان</th>
            <th>الوصف</th>
            <th>التقنيات</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          ${data.data
            .map(
              (project) => `
            <tr>
              <td>${project.title}</td>
              <td>${project.description.substring(0, 50)}...</td>
              <td>${project.technologies.join(", ")}</td>
              <td>
                <button class="btn-edit" onclick="editProject('${project._id}')">تعديل</button>
                <button class="btn-delete" onclick="deleteProject('${project._id}')">حذف</button>
              </td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    `;
  } catch (error) {
    console.error("Error:", error);
    document.getElementById("projects-container").innerHTML =
      '<p class="error">حدث خطأ في تحميل المشاريع</p>';
  }
}

async function handleAddProject(e) {
  e.preventDefault();

  const projectData = {
    title: document.getElementById("title").value,
    description: document.getElementById("description").value,
    image: document.getElementById("image").value || null,
    link: document.getElementById("link").value || null,
    github: document.getElementById("github").value || null,
    technologies: document
      .getElementById("technologies")
      .value.split(",")
      .map((t) => t.trim())
      .filter((t) => t),
    featured: document.getElementById("featured").checked,
  };

  try {
    const response = await fetch(`${API_URL}/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentToken}`,
      },
      body: JSON.stringify(projectData),
    });

    let data;
    try {
      data = await response.json();
    } catch (err) {
      const text = await response.text();
      data = {
        success: false,
        message: "Invalid JSON response from server",
        raw: text,
      };
    }

    console.log("Create project response:", response.status, data);

    if (response.ok && data.success) {
      alert("تمت إضافة المشروع بنجاح");
      document.getElementById("project-form").reset();
      switchSection("projects");
      loadProjects();
    } else {
      alert(data.message || data.raw || "فشل إضافة المشروع");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("حدث خطأ أثناء إضافة المشروع");
  }
}

async function deleteProject(id) {
  if (!confirm("هل أنت متأكد من حذف هذا المشروع؟")) return;

  try {
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${currentToken}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      alert("تم حذف المشروع بنجاح");
      loadProjects();
    } else {
      alert("فشل حذف المشروع");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("حدث خطأ أثناء حذف المشروع");
  }
}

function editProject(id) {
  alert("سيتم تطوير ميزة التعديل قريباً");
}
