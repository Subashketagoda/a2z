document.addEventListener('DOMContentLoaded', () => {

    const loginOverlay = document.getElementById('login-overlay');
    const dashboardView = document.getElementById('dashboard-view');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn');

    // Tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    const panels = document.querySelectorAll('.panel-section');

    // Form inputs and list containers
    const projectForm = document.getElementById('project-form');
    const inquiriesBody = document.getElementById('inquiries-list-body');
    const inquiriesEmpty = document.getElementById('inquiries-empty');
    const projectsContainer = document.getElementById('projects-list-container');
    const projectsEmpty = document.getElementById('projects-empty');

    // Services Manager Selectors
    const servicesForm = document.getElementById('services-form');
    const serviceIdInput = document.getElementById('service-id');
    const serviceTitleInput = document.getElementById('service-title-input');
    const serviceIconInput = document.getElementById('service-icon-input');
    const serviceDescInput = document.getElementById('service-desc-input');
    const serviceFormTitle = document.getElementById('service-form-title');
    const serviceSubmitBtn = document.getElementById('service-submit-btn');
    const serviceCancelBtn = document.getElementById('service-cancel-btn');
    const servicesContainer = document.getElementById('services-list-container');
    const servicesEmptyState = document.getElementById('services-empty-state');

    // Settings Selectors
    const settingsForm = document.getElementById('settings-form');
    const settingsPhone = document.getElementById('settings-phone');
    const settingsEmail = document.getElementById('settings-email');
    const settingsAddress = document.getElementById('settings-address');
    const settingsHeroTitle = document.getElementById('settings-hero-title');
    const settingsHeroSubtitle = document.getElementById('settings-hero-subtitle');
    const settingsFeedback = document.getElementById('settings-feedback');

    // Password Change Selectors
    const passwordForm = document.getElementById('password-form');
    const securityCurrent = document.getElementById('security-current');
    const securityNew = document.getElementById('security-new');
    const securityConfirm = document.getElementById('security-confirm');
    const passwordFeedback = document.getElementById('password-feedback');

    // Counters
    const inquiryCounter = document.getElementById('stat-inquiries-count');
    const projectCounter = document.getElementById('stat-projects-count');
    const serviceCounter = document.getElementById('stat-services-count');

    // ==========================================
    // 1. AUTHENTICATION FLOW
    // ==========================================
    
    // Check if currently authenticated
    async function checkAuth() {
        try {
            const res = await fetch('/api/auth-check');
            const data = await res.json();
            
            if (data.authenticated) {
                showDashboard();
            } else {
                showLogin();
            }
        } catch (error) {
            console.error('Auth check error:', error);
            showLogin();
        }
    }

    function showDashboard() {
        loginOverlay.style.display = 'none';
        dashboardView.style.display = 'block';
        loadDashboardData();
    }

    function showLogin() {
        loginOverlay.style.display = 'flex';
        dashboardView.style.display = 'none';
    }

    // Submit login form
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const usernameInput = document.getElementById('username').value;
        const passwordInput = document.getElementById('password').value;

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: usernameInput, password: passwordInput })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                loginError.style.display = 'none';
                loginForm.reset();
                showDashboard();
            } else {
                loginError.innerText = data.error || 'Login failed.';
                loginError.style.display = 'block';
            }
        } catch (error) {
            loginError.innerText = 'Network error occurred. Try again.';
            loginError.style.display = 'block';
        }
    });

    // Handle logout button click
    logoutBtn.addEventListener('click', async () => {
        try {
            const res = await fetch('/api/logout', { method: 'POST' });
            if (res.ok) {
                showLogin();
            }
        } catch (error) {
            console.error('Logout error:', error);
            showLogin();
        }
    });

    // ==========================================
    // 2. DASHBOARD DATA HANDLING
    // ==========================================
    async function loadDashboardData() {
        await Promise.all([
            fetchInquiries(),
            fetchProjects(),
            fetchServices(),
            fetchSettings()
        ]);
    }

    // Load Inquiries Inbox
    async function fetchInquiries() {
        try {
            const res = await fetch('/api/inquiries');
            if (!res.ok) throw new Error('Failed to fetch inquiries.');
            const data = await res.json();

            // Set counter
            inquiryCounter.innerText = data.length;

            inquiriesBody.innerHTML = '';
            if (data.length === 0) {
                inquiriesEmpty.style.display = 'block';
                document.getElementById('inquiries-table').style.display = 'none';
                return;
            }

            inquiriesEmpty.style.display = 'none';
            document.getElementById('inquiries-table').style.display = 'table';

            // Populate Table
            data.forEach(inquiry => {
                const tr = document.createElement('tr');
                
                const formattedDate = new Date(inquiry.date).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                tr.innerHTML = `
                    <td><strong>${escapeHTML(inquiry.name)}</strong></td>
                    <td><a href="mailto:${inquiry.email}" style="color: var(--primary); text-decoration: none;">${escapeHTML(inquiry.email)}</a></td>
                    <td>
                        <div style="font-weight: 600; margin-bottom: 0.25rem;">${escapeHTML(inquiry.subject)}</div>
                        <div class="inquiry-message">${escapeHTML(inquiry.message)}</div>
                    </td>
                    <td class="inquiry-date">${formattedDate}</td>
                    <td>
                        <button class="btn btn-danger btn-delete-inquiry" data-id="${inquiry.id}">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </td>
                `;

                // Add delete event
                tr.querySelector('.btn-delete-inquiry').addEventListener('click', () => {
                    deleteInquiry(inquiry.id);
                });

                inquiriesBody.appendChild(tr);
            });
        } catch (error) {
            console.error('Fetch inquiries error:', error);
        }
    }

    // Delete an inquiry message
    async function deleteInquiry(id) {
        if (!confirm('Are you sure you want to delete this contact submission?')) return;
        try {
            const res = await fetch(`/api/inquiries/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchInquiries();
            } else {
                alert('Failed to delete inquiry.');
            }
        } catch (error) {
            console.error('Delete inquiry error:', error);
        }
    }

    // Load Showcase items
    async function fetchProjects() {
        try {
            const res = await fetch('/api/projects');
            if (!res.ok) throw new Error('Failed to fetch projects.');
            const data = await res.json();

            // Set counter
            projectCounter.innerText = data.length;

            projectsContainer.innerHTML = '';
            if (data.length === 0) {
                projectsEmpty.style.display = 'block';
                return;
            }

            projectsEmpty.style.display = 'none';

            // Populate List
            data.forEach(project => {
                const item = document.createElement('div');
                item.className = 'project-item';

                item.innerHTML = `
                    <div class="project-item-info">
                        <span class="badge-category ${project.category}">${project.category}</span>
                        <h4 style="margin-top: 0.5rem;"><i class="${project.icon}" style="color: var(--primary); margin-right: 0.5rem;"></i>${escapeHTML(project.title)}</h4>
                        <p style="margin-top: 0.25rem;">${escapeHTML(project.description)}</p>
                    </div>
                    <button class="btn btn-danger btn-delete-project" data-id="${project.id}">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                `;

                // Add delete event
                item.querySelector('.btn-delete-project').addEventListener('click', () => {
                    deleteProject(project.id);
                });

                projectsContainer.appendChild(item);
            });
        } catch (error) {
            console.error('Fetch projects error:', error);
        }
    }

    // Create a new showcase item
    projectForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const titleVal = document.getElementById('proj-title').value;
        const catVal = document.getElementById('proj-category').value;
        const iconVal = document.getElementById('proj-icon').value;
        const descVal = document.getElementById('proj-desc').value;

        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: titleVal,
                    category: catVal,
                    icon: iconVal,
                    description: descVal
                })
            });

            if (res.ok) {
                projectForm.reset();
                fetchProjects();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to create project card.');
            }
        } catch (error) {
            console.error('Create project error:', error);
        }
    });

    // Delete a showcase card
    async function deleteProject(id) {
        if (!confirm('Are you sure you want to delete this project showcase card?')) return;
        try {
            const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchProjects();
            } else {
                alert('Failed to delete showcase card.');
            }
        } catch (error) {
            console.error('Delete project error:', error);
        }
    }

    // ==========================================
    // 2.3 SERVICES MANAGEMENT
    // ==========================================

    // Fetch Services List
    async function fetchServices() {
        try {
            const res = await fetch('/api/services');
            if (!res.ok) throw new Error('Failed to fetch services.');
            const data = await res.json();

            // Set counter
            if (serviceCounter) serviceCounter.innerText = data.length;

            servicesContainer.innerHTML = '';
            if (data.length === 0) {
                servicesEmptyState.style.display = 'block';
                return;
            }

            servicesEmptyState.style.display = 'none';

            data.forEach(service => {
                const item = document.createElement('div');
                item.className = 'project-item';

                item.innerHTML = `
                    <div class="project-item-info">
                        <h4><i class="${service.icon}" style="color: var(--primary); margin-right: 0.5rem;"></i>${escapeHTML(service.title)}</h4>
                        <p style="margin-top: 0.25rem;">${escapeHTML(service.description)}</p>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn btn-logout btn-edit-service" style="border-color: var(--primary); color: var(--primary); padding: 0.5rem 0.8rem;">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="btn btn-danger btn-delete-service" data-id="${service.id}">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                `;

                // Edit Button Click
                item.querySelector('.btn-edit-service').addEventListener('click', () => {
                    serviceIdInput.value = service.id;
                    serviceTitleInput.value = service.title;
                    serviceIconInput.value = service.icon;
                    serviceDescInput.value = service.description;

                    serviceFormTitle.innerText = 'Edit Service';
                    serviceSubmitBtn.innerText = 'Save Changes';
                    serviceCancelBtn.style.display = 'inline-flex';
                });

                // Delete Button Click
                item.querySelector('.btn-delete-service').addEventListener('click', () => {
                    deleteService(service.id);
                });

                servicesContainer.appendChild(item);
            });
        } catch (error) {
            console.error('Fetch services error:', error);
        }
    }

    // Submit Services Form
    servicesForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const idVal = serviceIdInput.value;
        const titleVal = serviceTitleInput.value;
        const iconVal = serviceIconInput.value;
        const descVal = serviceDescInput.value;

        try {
            const res = await fetch('/api/services', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: idVal || undefined,
                    title: titleVal,
                    icon: iconVal,
                    description: descVal
                })
            });

            if (res.ok) {
                resetServicesForm();
                fetchServices();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to save service card.');
            }
        } catch (error) {
            console.error('Save service error:', error);
        }
    });

    // Cancel Service Edit
    serviceCancelBtn.addEventListener('click', () => {
        resetServicesForm();
    });

    function resetServicesForm() {
        servicesForm.reset();
        serviceIdInput.value = '';
        serviceFormTitle.innerText = 'Add New Service';
        serviceSubmitBtn.innerText = 'Create Service';
        serviceCancelBtn.style.display = 'none';
    }

    // Delete Service Card
    async function deleteService(id) {
        if (!confirm('Are you sure you want to delete this service card from homepage?')) return;
        try {
            const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchServices();
            } else {
                alert('Failed to delete service card.');
            }
        } catch (error) {
            console.error('Delete service error:', error);
        }
    }

    // ==========================================
    // 2.4 SITE SETTINGS MANAGEMENT
    // ==========================================

    // Fetch site settings
    async function fetchSettings() {
        try {
            const res = await fetch('/api/settings');
            if (!res.ok) throw new Error('Failed to fetch settings.');
            const data = await res.json();

            if (data.phone) settingsPhone.value = data.phone;
            if (data.email) settingsEmail.value = data.email;
            if (data.address) settingsAddress.value = data.address;
            if (data.heroTitle) settingsHeroTitle.value = data.heroTitle;
            if (data.heroSubtitle) settingsHeroSubtitle.value = data.heroSubtitle;
        } catch (error) {
            console.error('Fetch settings error:', error);
        }
    }

    // Submit Settings Form
    settingsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: settingsPhone.value,
                    email: settingsEmail.value,
                    address: settingsAddress.value,
                    heroTitle: settingsHeroTitle.value,
                    heroSubtitle: settingsHeroSubtitle.value
                })
            });

            if (res.ok) {
                showFeedback(settingsFeedback, 'Settings saved successfully!', 'success');
            } else {
                const data = await res.json();
                showFeedback(settingsFeedback, data.error || 'Failed to save settings.', 'error');
            }
        } catch (error) {
            showFeedback(settingsFeedback, 'Network error. Try again.', 'error');
        }
    });

    // ==========================================
    // 2.5 SECURITY (PASSWORD CHANGE)
    // ==========================================
    passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const currentVal = securityCurrent.value;
        const newVal = securityNew.value;
        const confirmVal = securityConfirm.value;

        if (newVal !== confirmVal) {
            showFeedback(passwordFeedback, 'New passwords do not match.', 'error');
            return;
        }

        try {
            const res = await fetch('/api/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword: currentVal, newPassword: newVal })
            });

            const data = await res.json();
            if (res.ok) {
                showFeedback(passwordFeedback, 'Password updated successfully!', 'success');
                passwordForm.reset();
            } else {
                showFeedback(passwordFeedback, data.error || 'Password update failed.', 'error');
            }
        } catch (error) {
            showFeedback(passwordFeedback, 'Network error. Try again.', 'error');
        }
    });

    // Feedback message rendering helper
    function showFeedback(element, message, type) {
        element.innerText = message;
        element.style.display = 'block';
        element.className = `form-message ${type}`;

        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    }

    // Escape HTML to prevent XSS in admin panel
    function escapeHTML(str) {
        return str.replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;')
                  .replace(/'/g, '&#039;');
    }

    // ==========================================
    // 3. INTERACTIVE PANELS AND NAVIGATION
    // ==========================================
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const targetId = btn.getAttribute('data-target');
            panels.forEach(p => {
                p.classList.remove('active');
                if (p.getAttribute('id') === targetId) {
                    p.classList.add('active');
                }
            });
        });
    });

    // ==========================================
    // 4. CANVAS PARTICLES (ADMIN THEME)
    // ==========================================
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particlesArray = [];
        let numberOfParticles = 30;

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            init();
        }

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = Math.random() * 0.3 - 0.15;
                this.speedY = Math.random() * 0.3 - 0.15;
                this.color = 'rgba(0, 242, 254, 0.2)';
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x > canvas.width || this.x < 0) this.speedX = -this.speedX;
                if (this.y > canvas.height || this.y < 0) this.speedY = -this.speedY;
            }
            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function init() {
            particlesArray = [];
            for (let i = 0; i < numberOfParticles; i++) {
                particlesArray.push(new Particle());
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
                particlesArray[i].draw();
            }
            requestAnimationFrame(animate);
        }

        window.addEventListener('resize', resize);
        resize();
        animate();
    }

    // Run Auth check
    checkAuth();
});
