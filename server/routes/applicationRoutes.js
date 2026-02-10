import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '../data/db.json');

// Helper to read DB
const readDb = () => {
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return { applications: [], policies: [], payments: [] };
    }
};

// Helper to write DB
const writeDb = (data) => {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Error writing DB:', err);
    }
};

// @desc    Submit application
// @route   POST /api/applications
// @access  Private (User)
router.post('/', protect, (req, res) => {
    const db = readDb();
    const newApplication = {
        id: Date.now(),
        ...req.body,
        userId: req.user.id, // Verified user from token
        status: 'submitted',
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    db.applications.push(newApplication);
    writeDb(db);
    res.status(201).json(newApplication);
});

// @desc    Get user applications
// @route   GET /api/applications
// @access  Private
router.get('/', protect, (req, res) => {
    const db = readDb();

    // If admin, return all
    if (req.user.role === 'admin') {
        const userIdFilter = req.query.userId;
        if (userIdFilter) {
            return res.json(db.applications.filter(app => app.userId === userIdFilter));
        }
        return res.json(db.applications);
    }

    // If user, return only own applications
    const userApps = db.applications.filter(app => app.userId === req.user.id);
    res.json(userApps);
});

// @desc    Update application status
// @route   PATCH /api/applications/:id/status
// @access  Private (Admin Only)
router.patch('/:id/status', protect, admin, (req, res) => {
    const db = readDb();
    const { status, remarks } = req.body;
    const appId = parseInt(req.params.id);

    const appIndex = db.applications.findIndex(a => a.id === appId);
    if (appIndex === -1) return res.status(404).json({ message: 'Application not found' });

    // Update status
    db.applications[appIndex].status = status;
    db.applications[appIndex].remarks = remarks || '';
    db.applications[appIndex].updatedAt = new Date().toISOString();

    // If approved, generate payment
    if (status === 'approved') {
        const app = db.applications[appIndex];
        const policy = db.policies.find(p => p.id === app.policyId);

        if (policy) {
            const newPayment = {
                id: Date.now(),
                applicationId: app.id,
                userId: app.userId,
                policyName: policy.name,
                amount: policy.benefitAmount,
                status: 'processed',
                method: 'Direct Transfer',
                initiatedAt: new Date().toISOString(),
                completedAt: new Date().toISOString()
            };
            db.payments.push(newPayment);
        }
    }

    writeDb(db);
    res.json(db.applications[appIndex]);
});

export default router;
