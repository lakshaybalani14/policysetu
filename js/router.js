// Client-side routing

const Router = {
    routes: {},
    currentRoute: null,

    // Initialize router
    init() {
        // Define routes
        this.routes = {
            '/': this.renderHome,
            '/login': this.renderLogin,
            '/register': this.renderRegister,
            '/policies': this.renderPolicies,
            '/policy/:id': this.renderPolicyDetail,
            '/dashboard': this.renderDashboard,
            '/profile': this.renderProfile,
            '/applications': this.renderApplications,
            '/application/:id': this.renderApplicationDetail,
            '/apply/:policyId': this.renderApplyForm,
            '/payments': this.renderPayments,
            '/admin': this.renderAdminDashboard,
            '/admin/policies': this.renderAdminPolicies,
            '/admin/policy/new': this.renderNewPolicy,
            '/admin/policy/:id/edit': this.renderEditPolicy,
            '/government': this.renderGovernmentDashboard,
            '/government/applications': this.renderGovernmentApplications,
            '/government/application/:id': this.renderGovernmentApplicationDetail
        };

        // Handle browser back/forward
        window.addEventListener('popstate', () => {
            this.navigate(window.location.pathname, false);
        });

        // Handle initial route
        const path = window.location.pathname === '/' ? '/' : window.location.pathname;
        this.navigate(path, false);
    },

    // Navigate to route
    navigate(path, pushState = true) {
        // Check authentication for protected routes
        if (!this.checkAuth(path)) {
            this.navigate('/login', true);
            return;
        }

        // Find matching route
        const route = this.matchRoute(path);
        if (!route) {
            this.render404();
            return;
        }

        // Update browser history
        if (pushState) {
            window.history.pushState({}, '', path);
        }

        // Render route
        this.currentRoute = path;
        route.handler(route.params);

        // Scroll to top
        window.scrollTo(0, 0);
    },

    // Match route pattern
    matchRoute(path) {
        for (const pattern in this.routes) {
            const params = this.extractParams(pattern, path);
            if (params !== null) {
                return {
                    pattern,
                    handler: this.routes[pattern].bind(this),
                    params
                };
            }
        }
        return null;
    },

    // Extract route parameters
    extractParams(pattern, path) {
        const patternParts = pattern.split('/');
        const pathParts = path.split('/');

        if (patternParts.length !== pathParts.length) {
            return null;
        }

        const params = {};
        for (let i = 0; i < patternParts.length; i++) {
            if (patternParts[i].startsWith(':')) {
                params[patternParts[i].slice(1)] = pathParts[i];
            } else if (patternParts[i] !== pathParts[i]) {
                return null;
            }
        }

        return params;
    },

    // Check authentication
    checkAuth(path) {
        const publicRoutes = ['/', '/login', '/register', '/policies'];
        const isPublicRoute = publicRoutes.includes(path) || path.startsWith('/policy/');

        if (!isPublicRoute && !Auth.isAuthenticated()) {
            return false;
        }

        // Check role-based access
        if (path.startsWith('/admin') && !Auth.hasRole('admin')) {
            return false;
        }

        if (path.startsWith('/government') && !Auth.hasRole('government')) {
            return false;
        }

        return true;
    },

    // Render 404
    render404() {
        const app = document.getElementById('app');
        app.innerHTML = Components.render404();
    },

    // Route handlers (will be implemented in components.js)
    renderHome() {
        const app = document.getElementById('app');
        app.innerHTML = Components.renderHome();
    },

    renderLogin() {
        const app = document.getElementById('app');
        app.innerHTML = Components.renderLogin();
    },

    renderRegister() {
        const app = document.getElementById('app');
        app.innerHTML = Components.renderRegister();
    },

    renderPolicies() {
        const app = document.getElementById('app');
        app.innerHTML = Components.renderPolicies();
    },

    renderPolicyDetail(params) {
        const app = document.getElementById('app');
        app.innerHTML = Components.renderPolicyDetail(params.id);
    },

    renderDashboard() {
        const app = document.getElementById('app');
        app.innerHTML = Components.renderCitizenDashboard();
    },

    renderProfile() {
        const app = document.getElementById('app');
        app.innerHTML = Components.renderProfile();
    },

    renderApplications() {
        const app = document.getElementById('app');
        app.innerHTML = Components.renderApplications();
    },

    renderApplicationDetail(params) {
        const app = document.getElementById('app');
        app.innerHTML = Components.renderApplicationDetail(params.id);
    },

    renderApplyForm(params) {
        const app = document.getElementById('app');
        app.innerHTML = Components.renderApplyForm(params.policyId);
    },

    renderPayments() {
        const app = document.getElementById('app');
        app.innerHTML = Components.renderPayments();
    },

    renderAdminDashboard() {
        const app = document.getElementById('app');
        app.innerHTML = Components.renderAdminDashboard();
    },

    renderAdminPolicies() {
        const app = document.getElementById('app');
        app.innerHTML = Components.renderAdminPolicies();
    },

    renderNewPolicy() {
        const app = document.getElementById('app');
        app.innerHTML = Components.renderPolicyForm();
    },

    renderEditPolicy(params) {
        const app = document.getElementById('app');
        app.innerHTML = Components.renderPolicyForm(params.id);
    },

    renderGovernmentDashboard() {
        const app = document.getElementById('app');
        app.innerHTML = Components.renderGovernmentDashboard();
    },

    renderGovernmentApplications() {
        const app = document.getElementById('app');
        app.innerHTML = Components.renderGovernmentApplications();
    },

    renderGovernmentApplicationDetail(params) {
        const app = document.getElementById('app');
        app.innerHTML = Components.renderGovernmentApplicationDetail(params.id);
    }
};
