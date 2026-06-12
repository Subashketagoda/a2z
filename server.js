const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;
const dbPath = path.join(__dirname, 'db.json');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'a2z-tech-solutions-session-secret-987654321',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Set to true if running on HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Helper Functions for DB Interactions
async function readDB() {
    try {
        const data = await fs.readFile(dbPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading database file, returning default structure:', error);
        return { inquiries: [], projects: [], services: [], settings: {}, auth: {} };
    }
}

async function writeDB(data) {
    try {
        await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Error writing to database file:', error);
        throw error;
    }
}

// Startup Initialization: Secure credentials on boot if in plaintext
async function initializeCredentials() {
    try {
        const db = await readDB();
        if (db.auth && db.auth.password) {
            console.log('Securing plain-text credentials on boot...');
            db.auth.passwordHash = bcrypt.hashSync(db.auth.password, 10);
            delete db.auth.password; // Remove plaintext password
            await writeDB(db);
            console.log('Credentials successfully hashed and secured.');
        }
    } catch (error) {
        console.error('Error securing credentials on boot:', error);
    }
}
initializeCredentials();

// Authentication Middleware
function requireAuth(req, res, next) {
    if (req.session && req.session.isAdmin) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized. Authentication required.' });
    }
}

// ==========================================
// PUBLIC API ENDPOINTS
// ==========================================

// Get public project showcase list
app.get('/api/projects', async (req, res) => {
    const db = await readDB();
    res.json(db.projects || []);
});

// Get public website settings
app.get('/api/settings', async (req, res) => {
    const db = await readDB();
    res.json(db.settings || {});
});

// Get public website services list
app.get('/api/services', async (req, res) => {
    const db = await readDB();
    res.json(db.services || []);
});

// Submit contact / inquiry form
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        const db = await readDB();
        const newInquiry = {
            id: 'inquiry-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
            name,
            email,
            subject,
            message,
            date: new Date().toISOString()
        };

        db.inquiries = db.inquiries || [];
        db.inquiries.push(newInquiry);
        await writeDB(db);

        res.status(201).json({ success: true, message: 'Inquiry submitted successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to process inquiry submission.' });
    }
});

// Authenticate Admin Session (using credentials from db.json)
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    const db = await readDB();
    const dbUser = db.auth.username || 'admin';
    const dbHash = db.auth.passwordHash;

    if (username === dbUser && dbHash && bcrypt.compareSync(password, dbHash)) {
        req.session.isAdmin = true;
        res.json({ success: true, message: 'Logged in successfully.' });
    } else {
        res.status(401).json({ error: 'Invalid username or password.' });
    }
});

// Destroy Admin Session
app.post('/api/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: 'Failed to log out.' });
        }
        res.clearCookie('connect.sid');
        res.json({ success: true, message: 'Logged out successfully.' });
    });
});

// Check Admin Session Status
app.get('/api/auth-check', (req, res) => {
    res.json({ authenticated: !!(req.session && req.session.isAdmin) });
});

// ==========================================
// PROTECTED ADMIN API ENDPOINTS (INQUIRIES)
// ==========================================

// Get all contact form inquiries
app.get('/api/inquiries', requireAuth, async (req, res) => {
    const db = await readDB();
    res.json(db.inquiries || []);
});

// Delete a specific inquiry by ID
app.delete('/api/inquiries/:id', requireAuth, async (req, res) => {
    try {
        const db = await readDB();
        const initialCount = db.inquiries.length;
        
        db.inquiries = db.inquiries.filter(item => item.id !== req.params.id);
        
        if (db.inquiries.length === initialCount) {
            return res.status(404).json({ error: 'Inquiry not found.' });
        }

        await writeDB(db);
        res.json({ success: true, message: 'Inquiry deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete inquiry.' });
    }
});

// ==========================================
// PROTECTED ADMIN API ENDPOINTS (PROJECTS SHOWCASE)
// ==========================================

// Create/Add a new showcase project
app.post('/api/projects', requireAuth, async (req, res) => {
    try {
        const { title, category, description, icon } = req.body;

        if (!title || !category || !description || !icon) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        const db = await readDB();
        const newProject = {
            id: 'project-' + Date.now() + '-' + Math.floor(Math.random() * 100),
            title,
            category,
            description,
            icon
        };

        db.projects = db.projects || [];
        db.projects.push(newProject);
        await writeDB(db);

        res.status(201).json({ success: true, project: newProject });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create showcase project.' });
    }
});

// Delete a project from showcase by ID
app.delete('/api/projects/:id', requireAuth, async (req, res) => {
    try {
        const db = await readDB();
        const initialCount = db.projects.length;
        
        db.projects = db.projects.filter(item => item.id !== req.params.id);
        
        if (db.projects.length === initialCount) {
            return res.status(404).json({ error: 'Project not found.' });
        }

        await writeDB(db);
        res.json({ success: true, message: 'Project deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete showcase project.' });
    }
});

// ==========================================
// PROTECTED ADMIN API ENDPOINTS (SITE SETTINGS)
// ==========================================

// Update website settings
app.post('/api/settings', requireAuth, async (req, res) => {
    try {
        const { phone, email, address, heroTitle, heroSubtitle } = req.body;
        
        if (!phone || !email || !address || !heroTitle || !heroSubtitle) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        const db = await readDB();
        db.settings = { phone, email, address, heroTitle, heroSubtitle };
        await writeDB(db);

        res.json({ success: true, settings: db.settings });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save site settings.' });
    }
});

// ==========================================
// PROTECTED ADMIN API ENDPOINTS (SERVICES CARD)
// ==========================================

// Add or edit a homepage service card
app.post('/api/services', requireAuth, async (req, res) => {
    try {
        const { id, title, icon, description } = req.body;

        if (!title || !icon || !description) {
            return res.status(400).json({ error: 'Title, icon and description are required.' });
        }

        const db = await readDB();
        db.services = db.services || [];

        if (id) {
            // Edit existing service
            const serviceIndex = db.services.findIndex(s => s.id === id);
            if (serviceIndex === -1) {
                return res.status(404).json({ error: 'Service card not found to edit.' });
            }
            db.services[serviceIndex] = { id, title, icon, description };
            await writeDB(db);
            res.json({ success: true, service: db.services[serviceIndex], isNew: false });
        } else {
            // Add new service
            const newService = {
                id: 'service-' + Date.now() + '-' + Math.floor(Math.random() * 100),
                title,
                icon,
                description
            };
            db.services.push(newService);
            await writeDB(db);
            res.status(201).json({ success: true, service: newService, isNew: true });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to save service card.' });
    }
});

// Delete a service card by ID
app.delete('/api/services/:id', requireAuth, async (req, res) => {
    try {
        const db = await readDB();
        const initialCount = db.services.length;
        
        db.services = db.services.filter(item => item.id !== req.params.id);
        
        if (db.services.length === initialCount) {
            return res.status(404).json({ error: 'Service not found.' });
        }

        await writeDB(db);
        res.json({ success: true, message: 'Service card deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete service card.' });
    }
});

// ==========================================
// PROTECTED ADMIN API ENDPOINTS (PASSWORD CHANGE)
// ==========================================
app.post('/api/change-password', requireAuth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current password and new password are required.' });
        }

        const db = await readDB();
        const currentHash = db.auth.passwordHash;

        if (currentHash && bcrypt.compareSync(currentPassword, currentHash)) {
            db.auth.passwordHash = bcrypt.hashSync(newPassword, 10);
            await writeDB(db);
            res.json({ success: true, message: 'Password updated successfully.' });
        } else {
            res.status(400).json({ error: 'Incorrect current password.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to change admin password.' });
    }
});

// ==========================================
// STATIC FILES & SPA SERVING
// ==========================================
// Serve standard static files in root directory
app.use(express.static(path.join(__dirname)));

// Start Server
app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`  A2Z Tech Solutions Server listening on port ${PORT}`);
    console.log(`  Access dashboard: http://localhost:${PORT}/admin.html`);
    console.log(`====================================================`);
});
