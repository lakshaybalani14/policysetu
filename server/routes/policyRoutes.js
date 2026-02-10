import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
        return { policies: [] };
    }
};

// @desc    Fetch all policies
// @route   GET /api/policies
// @access  Public
router.get('/', (req, res) => {
    const db = readDb();
    res.json(db.policies);
});

// @desc    Fetch single policy
// @route   GET /api/policies/:id
// @access  Public
router.get('/:id', (req, res) => {
    const db = readDb();
    const policy = db.policies.find(p => p.id === parseInt(req.params.id));
    if (!policy) return res.status(404).json({ message: 'Policy not found' });
    res.json(policy);
});

export default router;
