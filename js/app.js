// Main application initialization and event handlers

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize database with seed data
    Database.init();

    // Initialize auth and check session
    Auth.init();

    // Set up router and handle initial route
    Router.init();

    // Handle browser back/forward buttons
    window.addEventListener('popstate', () => {
        Router.navigate(window.location.pathname, false);
    });
});

// Global event handlers for forms

// Handle login form submission
window.handleLogin = function (event) {
    event.preventDefault();
    const form = event.target;
    const email = form.email.value;
    const password = form.password.value;

    const user = Auth.login(email, password);
    if (user) {
        // Redirect based on role
        if (user.role === 'admin') {
            Router.navigate('/admin/dashboard');
        } else if (user.role === 'government') {
            Router.navigate('/government/dashboard');
        } else {
            Router.navigate('/dashboard');
        }
    } else {
        alert('Invalid email or password');
    }
};

// Handle registration form submission
window.handleRegister = function (event) {
    event.preventDefault();
    const form = event.target;

    const userData = {
        name: form.name.value,
        email: form.email.value,
        phone: form.phone.value,
        password: form.password.value,
        role: 'citizen'
    };

    // Validate password confirmation
    if (userData.password !== form.confirmPassword.value) {
        alert('Passwords do not match');
        return;
    }

    const user = Auth.register(userData);
    if (user) {
        alert('Registration successful! Please login.');
        Router.navigate('/login');
    } else {
        alert('Registration failed. Email may already be in use.');
    }
};

// Handle profile update form submission
window.handleProfileUpdate = function (event) {
    event.preventDefault();
    const form = event.target;
    const user = Auth.getCurrentUser();

    const updates = {
        name: form.name.value,
        phone: form.phone.value
    };

    // If citizen, update profile information
    if (user.role === 'citizen') {
        updates.profile = {
            dob: form.dob?.value || user.profile?.dob,
            gender: form.gender?.value || user.profile?.gender,
            aadhaar: form.aadhaar?.value || user.profile?.aadhaar,
            pan: form.pan?.value?.toUpperCase() || user.profile?.pan,
            address: form.address?.value || user.profile?.address,
            occupation: form.occupation?.value || user.profile?.occupation,
            annualIncome: form.annualIncome?.value ? parseFloat(form.annualIncome.value) : user.profile?.annualIncome,
            category: form.category?.value || user.profile?.category
        };
    }

    const success = Auth.updateProfile(updates);
    if (success) {
        alert('Profile updated successfully!');
        Router.navigate('/profile');
    } else {
        alert('Failed to update profile');
    }
};

// Handle application submission
window.handleApplicationSubmit = function (event, policyId) {
    event.preventDefault();
    const form = event.target;
    const user = Auth.getCurrentUser();

    const applicationData = {
        userId: user.id,
        policyId: policyId,
        formData: {
            purpose: form.purpose.value,
            bankAccount: form.bankAccount.value,
            ifsc: form.ifsc.value
        }
    };

    const application = Applications.create(applicationData);
    if (application) {
        alert('Application submitted successfully!');
        Router.navigate('/applications');
    } else {
        alert('Failed to submit application');
    }
};

// Handle application action (for government officers)
window.handleApplicationAction = function (appId, newStatus) {
    const user = Auth.getCurrentUser();

    let note = '';
    if (newStatus === 'approved') {
        note = 'Application approved after review';
    } else if (newStatus === 'rejected') {
        note = prompt('Please provide a reason for rejection:');
        if (!note) return; // Cancel if no reason provided
    } else if (newStatus === 'under_review') {
        note = 'Application is under review';
    }

    const success = Applications.updateStatus(appId, newStatus, note, user.name);
    if (success) {
        alert(`Application ${newStatus} successfully!`);
        Router.navigate('/government/application/' + appId);
    } else {
        alert('Failed to update application status');
    }
};

// Handle policy search
window.handlePolicySearch = function (event) {
    event.preventDefault();
    const form = event.target;
    const searchTerm = form.search.value;
    const sector = form.sector.value;

    // Store search params in session storage
    sessionStorage.setItem('policySearch', JSON.stringify({ searchTerm, sector }));

    // Re-render the policies page
    Router.navigate('/policies');
};

// Handle policy filter
window.handlePolicyFilter = function (sector) {
    sessionStorage.setItem('policySearch', JSON.stringify({ searchTerm: '', sector }));
    Router.navigate('/policies');
};

// Clear policy filters
window.clearPolicyFilters = function () {
    sessionStorage.removeItem('policySearch');
    Router.navigate('/policies');
};

// Handle logout
window.handleLogout = function () {
    Auth.logout();
    Router.navigate('/');
};

// Utility function to show alerts (can be enhanced with better UI)
window.showAlert = function (message, type = 'info') {
    alert(message);
};

// Utility function to confirm actions
window.confirmAction = function (message) {
    return confirm(message);
};
