// Database layer using localStorage for data persistence

const Database = {
    // Initialize database with default data
    init() {
        if (!localStorage.getItem('initialized')) {
            this.seedData();
            localStorage.setItem('initialized', 'true');
        }
    },

    // Seed initial data
    seedData() {
        // Create admin user
        const adminUser = {
            id: 'admin-001',
            email: 'admin@gov.in',
            password: 'admin123', // In production, this would be hashed
            role: 'admin',
            name: 'System Administrator',
            phone: '9876543210',
            createdAt: new Date().toISOString()
        };

        // Create government officer
        const govOfficer = {
            id: 'gov-001',
            email: 'officer@gov.in',
            password: 'officer123',
            role: 'government',
            name: 'Government Officer',
            department: 'Social Welfare',
            phone: '9876543211',
            createdAt: new Date().toISOString()
        };

        // Create sample citizen
        const citizen = {
            id: 'citizen-001',
            email: 'citizen@example.com',
            password: 'citizen123',
            role: 'citizen',
            name: 'Sample Citizen',
            phone: '9876543212',
            profile: {
                dob: '1990-01-15',
                gender: 'male',
                aadhaar: '123456789012',
                pan: 'ABCDE1234F',
                address: '123 Main Street, New Delhi',
                occupation: 'farmer',
                annualIncome: 150000,
                category: 'general',
                beneficiaryTypes: ['farmer']
            },
            createdAt: new Date().toISOString()
        };

        this.set('users', [adminUser, govOfficer, citizen]);

        // Seed sample policies
        const policies = [
            {
                id: 'pol-001',
                name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
                description: 'Income support scheme for farmers providing ₹6000 per year in three equal installments directly to bank accounts.',
                sector: 'agriculture',
                department: 'Ministry of Agriculture',
                benefitAmount: 6000,
                benefitType: 'Direct Benefit Transfer',
                eligibility: {
                    minAge: 18,
                    maxAge: null,
                    gender: 'all',
                    minIncome: 0,
                    maxIncome: 200000,
                    occupations: ['farmer'],
                    categories: ['general', 'obc', 'sc', 'st'],
                    beneficiaryTypes: ['farmer']
                },
                documents: ['Aadhaar Card', 'Bank Account Details', 'Land Records'],
                status: 'active',
                startDate: '2019-02-01',
                createdAt: new Date('2019-01-15').toISOString(),
                updatedAt: new Date('2019-01-15').toISOString(),
                amendments: []
            },
            {
                id: 'pol-002',
                name: 'Beti Bachao Beti Padhao',
                description: 'Scheme aimed at generating awareness and improving efficiency of welfare services for girls.',
                sector: 'women_child',
                department: 'Ministry of Women and Child Development',
                benefitAmount: 50000,
                benefitType: 'Scholarship & Support',
                eligibility: {
                    minAge: 0,
                    maxAge: 21,
                    gender: 'female',
                    minIncome: 0,
                    maxIncome: 300000,
                    occupations: ['all'],
                    categories: ['all'],
                    beneficiaryTypes: ['women', 'student']
                },
                documents: ['Birth Certificate', 'Aadhaar Card', 'Income Certificate'],
                status: 'active',
                startDate: '2015-01-22',
                createdAt: new Date('2015-01-10').toISOString(),
                updatedAt: new Date('2015-01-10').toISOString(),
                amendments: []
            },
            {
                id: 'pol-003',
                name: 'MUDRA Loan Scheme',
                description: 'Micro Units Development and Refinance Agency provides loans up to ₹10 lakh for small businesses and MSMEs.',
                sector: 'msme',
                department: 'Ministry of MSME',
                benefitAmount: 1000000,
                benefitType: 'Loan',
                eligibility: {
                    minAge: 18,
                    maxAge: 65,
                    gender: 'all',
                    minIncome: 0,
                    maxIncome: 500000,
                    occupations: ['business', 'self_employed'],
                    categories: ['all'],
                    beneficiaryTypes: ['msme', 'entrepreneur']
                },
                documents: ['Aadhaar Card', 'PAN Card', 'Business Plan', 'Bank Statements'],
                status: 'active',
                startDate: '2015-04-08',
                createdAt: new Date('2015-03-20').toISOString(),
                updatedAt: new Date('2015-03-20').toISOString(),
                amendments: []
            },
            {
                id: 'pol-004',
                name: 'National Scholarship Portal',
                description: 'Centralized scholarship scheme for students from various backgrounds including SC/ST/OBC and minorities.',
                sector: 'education',
                department: 'Ministry of Education',
                benefitAmount: 25000,
                benefitType: 'Scholarship',
                eligibility: {
                    minAge: 16,
                    maxAge: 30,
                    gender: 'all',
                    minIncome: 0,
                    maxIncome: 250000,
                    occupations: ['student'],
                    categories: ['sc', 'st', 'obc', 'minority'],
                    beneficiaryTypes: ['student']
                },
                documents: ['Aadhaar Card', 'Caste Certificate', 'Income Certificate', 'Marksheet'],
                status: 'active',
                startDate: '2011-05-01',
                createdAt: new Date('2011-04-15').toISOString(),
                updatedAt: new Date('2011-04-15').toISOString(),
                amendments: []
            },
            {
                id: 'pol-005',
                name: 'Ayushman Bharat - PM-JAY',
                description: 'Health insurance scheme providing coverage of ₹5 lakh per family per year for secondary and tertiary care hospitalization.',
                sector: 'health',
                department: 'Ministry of Health',
                benefitAmount: 500000,
                benefitType: 'Health Insurance',
                eligibility: {
                    minAge: 0,
                    maxAge: null,
                    gender: 'all',
                    minIncome: 0,
                    maxIncome: 100000,
                    occupations: ['all'],
                    categories: ['all'],
                    beneficiaryTypes: ['bpl', 'economically_weaker']
                },
                documents: ['Aadhaar Card', 'Ration Card', 'Income Certificate'],
                status: 'active',
                startDate: '2018-09-23',
                createdAt: new Date('2018-09-01').toISOString(),
                updatedAt: new Date('2018-09-01').toISOString(),
                amendments: []
            },
            {
                id: 'pol-006',
                name: 'PM Awas Yojana (Urban)',
                description: 'Housing for All scheme providing financial assistance for construction or purchase of houses.',
                sector: 'housing',
                department: 'Ministry of Housing and Urban Affairs',
                benefitAmount: 250000,
                benefitType: 'Subsidy',
                eligibility: {
                    minAge: 21,
                    maxAge: 70,
                    gender: 'all',
                    minIncome: 0,
                    maxIncome: 600000,
                    occupations: ['all'],
                    categories: ['all'],
                    beneficiaryTypes: ['economically_weaker', 'low_income']
                },
                documents: ['Aadhaar Card', 'Income Certificate', 'Property Documents'],
                status: 'active',
                startDate: '2015-06-25',
                createdAt: new Date('2015-06-10').toISOString(),
                updatedAt: new Date('2015-06-10').toISOString(),
                amendments: []
            }
        ];

        this.set('policies', policies);
        this.set('applications', []);
        this.set('payments', []);
        this.set('notifications', []);
    },

    // Get data from localStorage
    get(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    },

    // Set data to localStorage
    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },

    // Add item to collection
    add(collection, item) {
        const items = this.get(collection) || [];
        items.push(item);
        this.set(collection, items);
        return item;
    },

    // Update item in collection
    update(collection, id, updates) {
        const items = this.get(collection) || [];
        const index = items.findIndex(item => item.id === id);
        if (index !== -1) {
            items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
            this.set(collection, items);
            return items[index];
        }
        return null;
    },

    // Delete item from collection
    delete(collection, id) {
        const items = this.get(collection) || [];
        const filtered = items.filter(item => item.id !== id);
        this.set(collection, filtered);
        return true;
    },

    // Find item by ID
    findById(collection, id) {
        const items = this.get(collection) || [];
        return items.find(item => item.id === id);
    },

    // Find items by criteria
    find(collection, criteria = {}) {
        const items = this.get(collection) || [];
        return items.filter(item => {
            return Object.keys(criteria).every(key => {
                if (typeof criteria[key] === 'function') {
                    return criteria[key](item[key]);
                }
                return item[key] === criteria[key];
            });
        });
    },

    // Clear all data
    clear() {
        localStorage.clear();
    }
};

// Initialize database on load
Database.init();
