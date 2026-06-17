const API_URL = "https://portfolio-3-production.up.railway.app/api/projects";

// Load projects on page load
document.addEventListener("DOMContentLoaded", loadProjects);

async function loadProjects() {
  try {
    const response = await fetch(`${API_URL}/projects`);
    const data = await response.json();

    const projectsList = document.getElementById("projects-list");

    if (!data.success || data.count === 0) {
      projectsList.innerHTML =
        '<div class="error">لا توجد مشاريع حالياً. قم بإضافة مشاريع من لوحة التحكم</div>';
      return;
    }

    projectsList.innerHTML = data.data
      .map(
        (project) => `
      <div class="project-card">
        <div class="project-image">
          ${project.image ? `<img src="${project.image}" alt="${project.title}">` : "📁"}
        </div>
        <div class="project-content">
          <h3>${project.title}</h3>
          <p>${project.description}</p>
          ${
            project.technologies.length > 0
              ? `
            <div class="technologies">
              ${project.technologies.map((tech) => `<span class="tech-tag">${tech}</span>`).join("")}
            </div>
          `
              : ""
          }
          <div class="project-links">
            ${project.link ? `<a href="${project.link}" target="_blank">عرض</a>` : ""}
            ${project.github ? `<a href="${project.github}" target="_blank">GitHub</a>` : ""}
          </div>
        </div>
      </div>
    `,
      )
      .join("");
  } catch (error) {
    console.error("Error loading projects:", error);
    document.getElementById("projects-list").innerHTML =
      '<div class="error">حدث خطأ في تحميل المشاريع</div>';
  }
}
