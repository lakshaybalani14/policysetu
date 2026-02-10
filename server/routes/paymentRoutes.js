import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { protect } from '../middleware/authMiddleware.js';

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
        return { payments: [] };
    }
};

// @desc    Get user payments
// @route   GET /api/payments
// @access  Private
router.get('/', protect, (req, res) => {
    const db = readDb();

    // If admin, return all
    if (req.user.role === 'admin') {
        const userIdFilter = req.query.userId;
        if (userIdFilter) {
            return res.json(db.payments.filter(p => p.userId === userIdFilter));
        }
        return res.json(db.payments);
    }

    // If user, return only own payments
    const userPayments = db.payments.filter(p => p.userId === req.user.id);
    res.json(userPayments);
});

export default router;
