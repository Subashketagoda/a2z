document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. MOBILE NAVBAR BURGER TOGGLE
    // ==========================================
    const burger = document.getElementById('burger-menu');
    const navLinksList = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links a');

    if (burger) {
        burger.addEventListener('click', () => {
            navLinksList.classList.toggle('nav-active');
            burger.classList.toggle('toggle');
        });
    }

    // Close menu when link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navLinksList.classList.contains('nav-active')) {
                navLinksList.classList.remove('nav-active');
                burger.classList.remove('toggle');
            }
        });
    });

    // ==========================================
    // 2. STICKY NAVBAR ON SCROLL
    // ==========================================
    const header = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // ==========================================
    // 3. CANVAS PARTICLE SYSTEM
    // ==========================================
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particlesArray = [];
        let numberOfParticles = 70;

        // Resize Canvas
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            if (window.innerWidth < 768) {
                numberOfParticles = 30; // Better performance on mobile
            } else {
                numberOfParticles = 75;
            }
            initParticles();
        }

        // Particle Class
        class Particle {
            constructor(width, height) {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 2 + 1;
                this.speedX = Math.random() * 0.4 - 0.2;
                this.speedY = Math.random() * 0.4 - 0.2;
                
                // Color array mapping visual theme
                const colors = ['rgba(0, 242, 254, 0.45)', 'rgba(79, 172, 254, 0.35)', 'rgba(168, 85, 247, 0.25)'];
                this.color = colors[Math.floor(Math.random() * colors.length)];
            }

            update(width, height) {
                this.x += this.speedX;
                this.y += this.speedY;

                // Bounce borders
                if (this.x > width || this.x < 0) this.speedX = -this.speedX;
                if (this.y > height || this.y < 0) this.speedY = -this.speedY;
            }

            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function initParticles() {
            particlesArray = [];
            for (let i = 0; i < numberOfParticles; i++) {
                particlesArray.push(new Particle(canvas.width, canvas.height));
            }
        }

        // Connect close particles with thin lines
        function connectParticles() {
            let maxDistance = 120;
            for (let a = 0; a < particlesArray.length; a++) {
                for (let b = a; b < particlesArray.length; b++) {
                    let dx = particlesArray[a].x - particlesArray[b].x;
                    let dy = particlesArray[a].y - particlesArray[b].y;
                    let distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < maxDistance) {
                        let opacity = (1 - (distance / maxDistance)) * 0.12;
                        ctx.strokeStyle = `rgba(0, 242, 254, ${opacity})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                        ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                        ctx.stroke();
                    }
                }
            }
        }

        // Animation Loop
        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update(canvas.width, canvas.height);
                particlesArray[i].draw();
            }
            connectParticles();
            requestAnimationFrame(animateParticles);
        }

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        animateParticles();
    }

    // ==========================================
    // 4. SPOTLIGHT HOVER EFFECT HELPER
    // ==========================================
    function initSpotlightHover(selector) {
        const targetCards = document.querySelectorAll(selector);
        targetCards.forEach(card => {
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            });
        });
    }

    // ==========================================
    // 5. SCROLL ENTRANCE INTERSECTION OBSERVER
    // ==========================================
    const fadeElements = document.querySelectorAll('.fade-in');
    const scrollObserverOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
                observer.unobserve(entry.target); // Stop observing once animated
            }
        });
    }, scrollObserverOptions);

    fadeElements.forEach(el => scrollObserver.observe(el));

    // ==========================================
    // 6. SCROLL NUMERICAL COUNTERS ANIMATION
    // ==========================================
    const statNumbers = document.querySelectorAll('.stat-number');
    let countersStarted = false;

    function startCounters() {
        statNumbers.forEach(stat => {
            const target = +stat.getAttribute('data-target');
            const duration = 2000; // 2 seconds
            const startTime = performance.now();

            function updateCounter(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // Ease out cubic
                const ease = 1 - Math.pow(1 - progress, 3);
                
                const currentValue = Math.floor(ease * target);
                
                if (target === 99) {
                    stat.innerText = currentValue + '%';
                } else if (target === 150) {
                    stat.innerText = currentValue + '+';
                } else if (target === 24) {
                    stat.innerText = currentValue + '/7';
                } else {
                    stat.innerText = currentValue;
                }

                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                }
            }
            requestAnimationFrame(updateCounter);
        });
    }

    const statsSection = document.querySelector('.stats-bar');
    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !countersStarted) {
                    countersStarted = true;
                    startCounters();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        statsObserver.observe(statsSection);
    }

    // ==========================================
    // 7. ACTIVE NAVIGATION ON SCROLL
    // ==========================================
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let currentSectionId = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            // Target halfway into the viewport
            if (window.scrollY >= (sectionTop - sectionHeight / 3)) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${currentSectionId}`) {
                item.classList.add('active');
            }
        });
    });

    // ==========================================
    // 8. PORTFOLIO GRID DYNAMIC LOADING & FILTERING
    // ==========================================
    const portfolioGrid = document.getElementById('portfolio-grid-target');

    async function loadPortfolioProjects() {
        if (!portfolioGrid) return;
        try {
            const res = await fetch('/api/projects');
            if (!res.ok) throw new Error('Failed to fetch projects');
            const projects = await res.json();
            
            portfolioGrid.innerHTML = '';
            
            if (projects.length === 0) {
                portfolioGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-secondary);">No showcase items available currently.</div>';
                return;
            }
            
            projects.forEach((proj, index) => {
                const card = document.createElement('div');
                card.className = `portfolio-card fade-in delay-${(index % 3) + 1}`;
                card.setAttribute('data-category', proj.category);
                
                let categoryName = 'Solution';
                if (proj.category === 'web') categoryName = 'Web Design';
                else if (proj.category === 'app') categoryName = 'Custom App';
                else if (proj.category === 'marketing') categoryName = 'E-Commerce';
                
                card.innerHTML = `
                    <div class="portfolio-image">
                        <div class="portfolio-badge">${categoryName}</div>
                        <i class="${proj.icon}" style="font-size: 4rem; color: rgba(0, 242, 254, 0.25);"></i>
                    </div>
                    <div class="portfolio-info">
                        <h3>${escapeHTML(proj.title)}</h3>
                        <p>${escapeHTML(proj.description)}</p>
                        <a href="#contact" class="portfolio-footer-link">Request Case Study <i class="fa-solid fa-chevron-right"></i></a>
                    </div>
                `;
                
                portfolioGrid.appendChild(card);
                
                // Add to scroll entrance observer
                scrollObserver.observe(card);
            });
            
            // Re-bind filter buttons to new cards
            initPortfolioFilters();
            
        } catch (error) {
            console.error('Error loading portfolio:', error);
            portfolioGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #f87171;">Failed to load projects showcase. Please check connection.</div>';
        }
    }

    function initPortfolioFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const portfolioCards = document.querySelectorAll('.portfolio-card');

        filterButtons.forEach(btn => {
            // Remove previous event listeners by cloning
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener('click', () => {
                // Remove active class
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                newBtn.classList.add('active');

                const filterValue = newBtn.getAttribute('data-filter');

                portfolioCards.forEach(card => {
                    card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                        card.style.display = 'block';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'scale(1)';
                        }, 50);
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'scale(0.95)';
                        setTimeout(() => {
                            card.style.display = 'none';
                        }, 300);
                    }
                });
            });
        });
    }

    // Simple HTML escaping helper
    function escapeHTML(str) {
        return str.replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;')
                  .replace(/'/g, '&#039;');
    }

    // ==========================================
    // 9. CONTACT FORM INTERACTIVE SUBMISSION (API-DRIVEN)
    // ==========================================
    const contactForm = document.getElementById('main-contact-form');
    const formFeedback = document.getElementById('form-feedback');

    if (contactForm) {
        contactForm.addEventListener('submit', async e => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Sending Message...';

            const nameVal = document.getElementById('contact-name').value;
            const emailVal = document.getElementById('contact-email').value;
            const subjectVal = document.getElementById('contact-subject').value;
            const messageVal = document.getElementById('contact-message').value;

            try {
                const res = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: nameVal,
                        email: emailVal,
                        subject: subjectVal,
                        message: messageVal
                    })
                });

                submitBtn.disabled = false;
                submitBtn.innerText = originalText;

                const data = await res.json();
                
                if (res.ok && data.success) {
                    // Show success message
                    formFeedback.className = 'form-message success';
                    formFeedback.innerHTML = '<i class="fa-solid fa-circle-check"></i> Message sent successfully! Our engineers will email you shortly.';
                    contactForm.reset();
                } else {
                    formFeedback.className = 'form-message error';
                    formFeedback.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${data.error || 'Failed to submit.'}`;
                }
            } catch (err) {
                submitBtn.disabled = false;
                submitBtn.innerText = originalText;
                formFeedback.className = 'form-message error';
                formFeedback.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Network connection failure. Please try again.';
            }

            formFeedback.style.display = 'block';
            
            // Auto-clear message after 7 seconds
            setTimeout(() => {
                formFeedback.style.display = 'none';
            }, 7000);
        });
    }

    // ==========================================
    // 10. DYNAMIC SERVICES LOADING
    // ==========================================
    const servicesGrid = document.getElementById('services-grid-target');

    async function loadServices() {
        if (!servicesGrid) return;
        try {
            const res = await fetch('/api/services');
            if (!res.ok) throw new Error('Failed to fetch services');
            const services = await res.json();
            
            servicesGrid.innerHTML = '';
            
            if (services.length === 0) {
                servicesGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-secondary);">No services available currently.</div>';
                return;
            }
            
            services.forEach((service, index) => {
                const card = document.createElement('div');
                card.className = `service-card fade-in delay-${(index % 3) + 1}`;
                
                card.innerHTML = `
                    <div class="service-icon">
                        <i class="${service.icon}"></i>
                    </div>
                    <h3>${escapeHTML(service.title)}</h3>
                    <p>${escapeHTML(service.description)}</p>
                    <a href="#contact" class="service-link">Learn More <i class="fa-solid fa-arrow-right"></i></a>
                `;
                
                servicesGrid.appendChild(card);
                scrollObserver.observe(card);
            });
            
            // Initialize spotlight spotlight hover for new cards
            initSpotlightHover('.service-card');
            
        } catch (error) {
            console.error('Error loading services:', error);
            servicesGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #f87171;">Failed to load services. Please check connection.</div>';
        }
    }

    // ==========================================
    // 11. DYNAMIC GLOBAL SITE SETTINGS LOADING
    // ==========================================
    async function loadGlobalSettings() {
        try {
            const res = await fetch('/api/settings');
            if (!res.ok) throw new Error('Failed to fetch global settings');
            const settings = await res.json();
            
            if (settings.phone) {
                const navPhone = document.getElementById('dyn-nav-phone');
                if (navPhone) {
                    navPhone.setAttribute('href', `tel:${settings.phone.replace(/\s+/g, '')}`);
                    navPhone.innerHTML = `<i class="fa-solid fa-phone"></i> ${settings.phone}`;
                }
                const navPhoneMobile = document.getElementById('dyn-nav-phone-mobile');
                if (navPhoneMobile) {
                    navPhoneMobile.setAttribute('href', `tel:${settings.phone.replace(/\s+/g, '')}`);
                    navPhoneMobile.innerHTML = `<i class="fa-solid fa-phone"></i> ${settings.phone}`;
                }
                const contactPhone = document.getElementById('dyn-contact-phone');
                if (contactPhone) {
                    contactPhone.innerHTML = `<a href="tel:${settings.phone.replace(/\s+/g, '')}" style="color: inherit; text-decoration: none;">${settings.phone}</a>`;
                }
            }
            
            if (settings.email) {
                const contactEmail = document.getElementById('dyn-contact-email');
                if (contactEmail) {
                    contactEmail.innerText = settings.email;
                }
            }
            
            if (settings.address) {
                const contactAddress = document.getElementById('dyn-contact-address');
                if (contactAddress) {
                    contactAddress.innerText = settings.address;
                }
            }
            
            if (settings.heroTitle) {
                const heroTitle = document.getElementById('dyn-hero-title');
                if (heroTitle) {
                    // Split title if it contains dynamic gradients or keep it straight
                    if (settings.heroTitle.includes(' - ')) {
                        const parts = settings.heroTitle.split(' - ');
                        heroTitle.innerHTML = `${escapeHTML(parts[0])} <br><span class="gradient-text">${escapeHTML(parts[1])}</span>`;
                    } else if (settings.heroTitle.includes(' | ')) {
                        const parts = settings.heroTitle.split(' | ');
                        heroTitle.innerHTML = `${escapeHTML(parts[0])} <br><span class="gradient-text">${escapeHTML(parts[1])}</span>`;
                    } else {
                        heroTitle.innerText = settings.heroTitle;
                    }
                }
            }
            
            if (settings.heroSubtitle) {
                const heroSubtitle = document.getElementById('dyn-hero-subtitle');
                if (heroSubtitle) {
                    heroSubtitle.innerText = settings.heroSubtitle;
                }
            }
            
        } catch (error) {
            console.error('Error loading global settings:', error);
        }
    }

    // Call dynamic initializations on DOM load
    loadGlobalSettings();
    loadServices();
    loadPortfolioProjects();

    // ==========================================
    // 12. NEWSLETTER FORM INTERACTIVE SUBMISSION
    // ==========================================
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', e => {
            e.preventDefault();
            const input = newsletterForm.querySelector('input');
            const originalValue = input.value;
            
            input.disabled = true;
            input.value = "Subscription Successful!";
            
            setTimeout(() => {
                input.disabled = false;
                input.value = "";
                alert(`Thank you for subscribing to A2Z Tech Solutions newsletter with email: ${originalValue}`);
            }, 1200);
        });
    }
});
