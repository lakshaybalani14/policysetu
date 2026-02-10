// Authentication and session management

const Auth = {
    // Current user session
    currentUser: null,

    // Initialize auth
    init() {
        const session = sessionStorage.getItem('currentUser');
        if (session) {
            this.currentUser = JSON.parse(session);
        }
    },

    // Register new user
    register(userData) {
        const users = Database.get('users') || [];

        // Check if email already exists
        if (users.find(u => u.email === userData.email)) {
            throw new Error('Email already registered');
        }

        // Create new user
        const newUser = {
            id: Utils.generateId(),
            email: userData.email,
            password: userData.password, // In production, hash this
            role: 'citizen',
            name: userData.name,
            phone: userData.phone,
            profile: userData.profile || {},
            createdAt: new Date().toISOString()
        };

        Database.add('users', newUser);

        // Create welcome notification
        Notifications.create(newUser.id, {
            title: 'Welcome to Digital Governance Platform',
            message: 'Your account has been created successfully. Complete your profile to discover eligible schemes.',
            type: 'info'
        });

        return newUser;
    },

    // Login user
    login(email, password) {
        const users = Database.get('users') || [];
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            throw new Error('Invalid email or password');
        }

        this.currentUser = user;
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        return user;
    },

    // Logout user
    logout() {
        this.currentUser = null;
        sessionStorage.removeItem('currentUser');
    },

    // Update user profile
    updateProfile(userId, profileData) {
        const user = Database.findById('users', userId);
        if (!user) {
            throw new Error('User not found');
        }

        const updatedUser = Database.update('users', userId, {
            ...profileData,
            profile: { ...user.profile, ...profileData.profile }
        });

        // Update session if current user
        if (this.currentUser && this.currentUser.id === userId) {
            this.currentUser = updatedUser;
            sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
        }

        return updatedUser;
    },

    // Check if user is authenticated
    isAuthenticated() {
        return this.currentUser !== null;
    },

    // Check if user has role
    hasRole(role) {
        return this.currentUser && this.currentUser.role === role;
    },

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    },

    // Refresh current user data
    refreshUser() {
        if (this.currentUser) {
            const user = Database.findById('users', this.currentUser.id);
            if (user) {
                this.currentUser = user;
                sessionStorage.setItem('currentUser', JSON.stringify(user));
            }
        }
    }
};

// Initialize auth on load
Auth.init();
