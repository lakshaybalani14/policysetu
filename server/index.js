import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000; // Aligned with Vite proxy
const DB_FILE = path.join(__dirname, 'data', 'db.json');

// Middleware
app.use(cors());
app.use(express.json());

// Request Logger (to debug "wrong log" issues)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Routes
import authRoutes from './routes/authRoutes.js';
import policyRoutes from './routes/policyRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/chat', chatRoutes);

// Dashboard Stats (Simple enough to keep here or move to a dashboardRoutes.js)
// Let's keep it here for now as "Misc" or moved to applicationRoutes if it's app related.
// Actually, it uses both policies and applications.
// Let's keep it here but we need to ensure readDb is available or imported.
// Since readDb was defined inside index.js, I need to keep it OR import it.
// The previous inline routes used readDb defined in index.js.
// Since I removed them, I should check if readDb is still needed for /api/stats.
// Yes.

const readDb = () => {
    try {
        if (!fs.existsSync(DB_FILE)) {
            const defaultData = { policies: [], applications: [], payments: [], users: [] };
            fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2));
            return defaultData;
        }
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading DB:', err);
        return { policies: [], applications: [], payments: [], users: [] };
    }
};

app.get('/api/stats', (req, res) => {
    const db = readDb();
    const stats = {
        totalApplications: db.applications.length,
        pending: db.applications.filter(a => ['submitted', 'under-review'].includes(a.status)).length,
        approved: db.applications.filter(a => a.status === 'approved').length,
        rejected: db.applications.filter(a => a.status === 'rejected').length,
        totalDisbursed: db.payments.reduce((sum, p) => sum + (p.amount || 0), 0)
    };
    res.json(stats);
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
