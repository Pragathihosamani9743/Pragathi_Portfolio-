// Navigation logic
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const section = e.currentTarget.getAttribute('href').substring(1);
    showSection(section);
    setActiveNavLink(e.currentTarget);
  });
});

function showSection(sectionName) {
  document.querySelectorAll('.content-section').forEach(section => {
    section.classList.remove('active');
  });
  document.getElementById(sectionName).classList.add('active');
}

function setActiveNavLink(activeLink) {
  navLinks.forEach(link => {
    link.classList.remove('active');
  });
  activeLink.classList.add('active');
}

// Profile photo upload
const photoInput = document.getElementById('photoUpload');
const profileImage = document.getElementById('profileImage');

photoInput.addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      profileImage.src = e.target.result;
      localStorage.setItem('profileImage', e.target.result);
    };
    reader.readAsDataURL(file);
  }
});

window.addEventListener('load', function () {
  const savedImage = localStorage.getItem('profileImage');
  if (savedImage) {
    profileImage.src = savedImage;
  }
});

// Skill list logic
const skillsContainer = document.getElementById('skillsList');
const skillInput = document.getElementById('skillInput');
const addSkillBtn = document.getElementById('addSkillBtn');

function renderSkills() {
  const skills = JSON.parse(localStorage.getItem('skills')) || [];
  skillsContainer.innerHTML = '';
  skills.forEach((skill, index) => {
    const skillEl = document.createElement('div');
    skillEl.className = 'skill-item';
    skillEl.innerHTML = `
      <span>${skill}</span>
      <button onclick="deleteSkill(${index})"><i class="fas fa-trash"></i></button>
    `;
    skillsContainer.appendChild(skillEl);
  });
}

function deleteSkill(index) {
  const skills = JSON.parse(localStorage.getItem('skills')) || [];
  skills.splice(index, 1);
  localStorage.setItem('skills', JSON.stringify(skills));
  renderSkills();
}

if (addSkillBtn) {
  addSkillBtn.addEventListener('click', () => {
    const skill = skillInput.value.trim();
    if (!skill) return;
    const skills = JSON.parse(localStorage.getItem('skills')) || [];
    skills.push(skill);
    localStorage.setItem('skills', JSON.stringify(skills));
    skillInput.value = '';
    renderSkills();
  });
  renderSkills();
}

// Project & Certificate Managers
let projectManager = null;
let certificateManager = null;

window.addEventListener('DOMContentLoaded', () => {
  // Lazy init after DOM
  class ProjectManager {
    constructor() {
      this.projects = JSON.parse(localStorage.getItem('projects')) || [];
      this.currentEditId = null;
      this.init();
    }

    init() {
      this.setupEvents();
      this.renderProjects();
    }

    setupEvents() {
      document.getElementById('addProjectBtn')?.addEventListener('click', () => this.openModal());
      document.querySelector('#projectModal .close')?.addEventListener('click', () => this.closeModal());
      document.getElementById('cancelBtn')?.addEventListener('click', () => this.closeModal());
      document.getElementById('projectForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveProject();
      });
    }

    openModal(project = null) {
      const modal = document.getElementById('projectModal');
      const form = document.getElementById('projectForm');
      modal.querySelector('.modal-header h2').textContent = project ? 'Edit Project' : 'Add New Project';
      form.reset();
      if (project) {
        document.getElementById('projectName').value = project.name;
        document.getElementById('projectDescription').value = project.description;
        document.getElementById('githubLink').value = project.github;
        document.getElementById('publishedLink').value = project.link;
        document.getElementById('projectDomain').value = project.domain;
        this.currentEditId = project.id;
      } else {
        this.currentEditId = null;
      }
      modal.style.display = 'block';
    }

    closeModal() {
      document.getElementById('projectModal').style.display = 'none';
      this.currentEditId = null;
    }

    saveProject() {
      const name = document.getElementById('projectName').value.trim();
      const description = document.getElementById('projectDescription').value.trim();
      const github = document.getElementById('githubLink').value.trim();
      const link = document.getElementById('publishedLink').value.trim();
      const domain = document.getElementById('projectDomain').value.trim();
      if (!name || !description || !domain) return alert('Fill all required fields');

      if (this.currentEditId) {
        const index = this.projects.findIndex(p => p.id === this.currentEditId);
        if (index !== -1) this.projects[index] = { id: this.currentEditId, name, description, github, link, domain };
      } else {
        this.projects.push({ id: Date.now().toString(), name, description, github, link, domain });
      }
      this.save();
      this.renderProjects();
      this.closeModal();
    }

    save() {
      localStorage.setItem('projects', JSON.stringify(this.projects));
    }

    delete(id) {
      if (confirm('Delete this project?')) {
        this.projects = this.projects.filter(p => p.id !== id);
        this.save();
        this.renderProjects();
      }
    }

    edit(id) {
      const project = this.projects.find(p => p.id === id);
      if (project) this.openModal(project);
    }

    renderProjects() {
      const container = document.getElementById('projectsList');
      container.innerHTML = '';
      if (this.projects.length === 0) {
        container.innerHTML = '<p class="no-projects">No projects yet.</p>';
        return;
      }
      const grouped = {};
      this.projects.forEach(p => {
        if (!grouped[p.domain]) grouped[p.domain] = [];
        grouped[p.domain].push(p);
      });

      for (let domain in grouped) {
        const title = document.createElement('h2');
        title.textContent = domain;
        container.appendChild(title);
        grouped[domain].forEach(p => {
          const item = document.createElement('div');
          item.className = 'project-item';
          item.innerHTML = `
            <div class="project-content">
              <h3>${p.name}</h3>
              <p>${p.description}</p>
              ${p.github ? `<p><a href="${p.github}" target="_blank">GitHub</a></p>` : ''}
              ${p.link ? `<p><a href="${p.link}" target="_blank">Live Site</a></p>` : ''}
            </div>
            <div class="project-actions">
              <button class="edit-btn" onclick="projectManager.edit('${p.id}')"><i class="fas fa-edit"></i></button>
              <button class="delete-btn" onclick="projectManager.delete('${p.id}')"><i class="fas fa-trash"></i></button>
            </div>`;
          container.appendChild(item);
        });
      }
    }
  }

  class CertificateManager {
    constructor() {
      this.certificates = JSON.parse(localStorage.getItem('certificates')) || [];
      this.currentEditId = null;
      this.init();
    }

    init() {
      this.setupEvents();
      this.renderCertificates();
    }

    setupEvents() {
      document.getElementById('addCertificateBtn')?.addEventListener('click', () => this.openModal());
      document.getElementById('closeCertModal')?.addEventListener('click', () => this.closeModal());
      document.getElementById('cancelCertBtn')?.addEventListener('click', () => this.closeModal());
      document.getElementById('certificateForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveCertificate();
      });
    }

    openModal(cert = null) {
      const modal = document.getElementById('certificateModal');
      const form = document.getElementById('certificateForm');
      modal.querySelector('.modal-header h2').textContent = cert ? 'Edit Certificate' : 'Add Certificate';
      form.reset();
      if (cert) {
        document.getElementById('certificateName').value = cert.name;
        document.getElementById('certificateCategory').value = cert.category;
        document.getElementById('certificateImage').value = cert.image || '';
        document.getElementById('certificateDrive').value = cert.drive || '';
        this.currentEditId = cert.id;
      } else {
        this.currentEditId = null;
      }
      modal.style.display = 'block';
    }

    closeModal() {
      document.getElementById('certificateModal').style.display = 'none';
      this.currentEditId = null;
    }

    saveCertificate() {
      const name = document.getElementById('certificateName').value.trim();
      const category = document.getElementById('certificateCategory').value.trim();
      const image = document.getElementById('certificateImage').value.trim();
      const drive = document.getElementById('certificateDrive').value.trim();
      if (!name || !category) return alert('Fill all fields');

      if (this.currentEditId) {
        const index = this.certificates.findIndex(c => c.id === this.currentEditId);
        if (index !== -1) {
          this.certificates[index] = { id: this.currentEditId, name, category, image, drive };
        }
      } else {
        this.certificates.push({ id: Date.now().toString(), name, category, image, drive });
      }
      this.save();
      this.renderCertificates();
      this.closeModal();
    }

    save() {
      localStorage.setItem('certificates', JSON.stringify(this.certificates));
    }

    delete(id) {
      if (confirm('Delete this certificate?')) {
        this.certificates = this.certificates.filter(c => c.id !== id);
        this.save();
        this.renderCertificates();
      }
    }

    edit(id) {
      const cert = this.certificates.find(c => c.id === id);
      if (cert) this.openModal(cert);
    }

    renderCertificates() {
      const container = document.getElementById('certificatesList');
      container.innerHTML = '';
      if (this.certificates.length === 0) {
        container.innerHTML = '<p class="no-projects">No certificates yet.</p>';
        return;
      }
      const grouped = {};
      this.certificates.forEach(c => {
        if (!grouped[c.category]) grouped[c.category] = [];
        grouped[c.category].push(c);
      });

      for (let cat in grouped) {
        const title = document.createElement('h2');
        title.textContent = cat;
        container.appendChild(title);
        grouped[cat].forEach(c => {
          const item = document.createElement('div');
          item.className = 'project-item';
          item.innerHTML = `
            <div class="project-content">
              <h3>${c.name}</h3>
              ${c.image ? `<img src="${c.image}" alt="Certificate Image" style="max-width:100%; margin:10px 0;" />` : ''}
              ${c.drive ? `<p><a href="${c.drive}" target="_blank">View Certificate</a></p>` : ''}
            </div>
            <div class="project-actions">
              <button class="edit-btn" onclick="certificateManager.edit('${c.id}')"><i class="fas fa-edit"></i></button>
              <button class="delete-btn" onclick="certificateManager.delete('${c.id}')"><i class="fas fa-trash"></i></button>
            </div>`;
          container.appendChild(item);
        });
      }
    }
  }

  projectManager = new ProjectManager();
  certificateManager = new CertificateManager();
});
