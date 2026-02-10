// UI Components and Views

const Components = {
    // Render navigation bar
    renderNavbar() {
        const user = Auth.getCurrentUser();
        const unreadCount = user ? Notifications.getUnreadCount(user.id) : 0;

        return `
            <nav class="navbar">
                <div class="container navbar-container">
                    <a href="/" onclick="Router.navigate('/'); return false;" class="navbar-brand">
                        🏛️ Digital Governance
                    </a>
                    <ul class="navbar-nav">
                        ${!user ? `
                            <li><a href="/policies" onclick="Router.navigate('/policies'); return false;" class="nav-link">Policies</a></li>
                            <li><a href="/login" onclick="Router.navigate('/login'); return false;" class="nav-link">Login</a></li>
                            <li><a href="/register" onclick="Router.navigate('/register'); return false;" class="btn btn-primary btn-sm">Register</a></li>
                        ` : `
                            ${user.role === 'citizen' ? `
                                <li><a href="/dashboard" onclick="Router.navigate('/dashboard'); return false;" class="nav-link">Dashboard</a></li>
                                <li><a href="/policies" onclick="Router.navigate('/policies'); return false;" class="nav-link">Policies</a></li>
                                <li><a href="/applications" onclick="Router.navigate('/applications'); return false;" class="nav-link">Applications</a></li>
                                <li><a href="/payments" onclick="Router.navigate('/payments'); return false;" class="nav-link">Payments</a></li>
                            ` : user.role === 'admin' ? `
                                <li><a href="/admin" onclick="Router.navigate('/admin'); return false;" class="nav-link">Dashboard</a></li>
                                <li><a href="/admin/policies" onclick="Router.navigate('/admin/policies'); return false;" class="nav-link">Policies</a></li>
                            ` : `
                                <li><a href="/government" onclick="Router.navigate('/government'); return false;" class="nav-link">Dashboard</a></li>
                                <li><a href="/government/applications" onclick="Router.navigate('/government/applications'); return false;" class="nav-link">Applications</a></li>
                            `}
                            <li>
                                <a href="/profile" onclick="Router.navigate('/profile'); return false;" class="nav-link">
                                    ${user.name} ${unreadCount > 0 ? `<span class="badge badge-danger">${unreadCount}</span>` : ''}
                                </a>
                            </li>
                            <li><button onclick="handleLogout()" class="btn btn-secondary btn-sm">Logout</button></li>
                        `}
                    </ul>
                </div>
            </nav>
        `;
    },

    // Render home page
    renderHome() {
        const stats = Analytics.getOverview();

        return `
            ${this.renderNavbar()}
            <div class="hero" style="background: linear-gradient(135deg, var(--primary-900), var(--bg-primary)); padding: 4rem 0; text-align: center;">
                <div class="container">
                    <h1 style="font-size: 3.5rem; margin-bottom: 1.5rem;">
                        <span class="gradient-text">Digital Governance Platform</span>
                    </h1>
                    <p style="font-size: 1.25rem; color: var(--text-secondary); max-width: 700px; margin: 0 auto 2rem;">
                        Discover government schemes, check eligibility, apply online, and track your benefits all in one place.
                    </p>
                    <div class="flex justify-center gap-md" style="margin-top: 2rem;">
                        <a href="/register" onclick="Router.navigate('/register'); return false;" class="btn btn-primary btn-lg">Get Started</a>
                        <a href="/policies" onclick="Router.navigate('/policies'); return false;" class="btn btn-secondary btn-lg">Browse Policies</a>
                    </div>
                </div>
            </div>

            <div class="container" style="margin: 4rem auto;">
                <div class="grid grid-cols-4">
                    <div class="stat-card">
                        <div class="stat-value">${stats.activePolicies}</div>
                        <div class="stat-label">Active Policies</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.totalApplications}</div>
                        <div class="stat-label">Applications</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.totalUsers}</div>
                        <div class="stat-label">Citizens Registered</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${Utils.formatCurrency(stats.totalAmountDisbursed)}</div>
                        <div class="stat-label">Benefits Disbursed</div>
                    </div>
                </div>

                <div style="margin-top: 4rem;">
                    <h2 class="text-center mb-xl">Popular Schemes</h2>
                    <div class="grid grid-cols-3">
                        ${Policies.getAll().filter(p => p.status === 'active').slice(0, 3).map(policy => `
                            <div class="card">
                                <div class="card-header">
                                    <div class="card-title">${policy.name}</div>
                                    <span class="badge badge-primary">${Policies.getSectorLabel(policy.sector)}</span>
                                </div>
                                <div class="card-body">
                                    <p>${Utils.truncate(policy.description, 120)}</p>
                                    <div style="margin-top: 1rem;">
                                        <strong>Benefit:</strong> ${Utils.formatCurrency(policy.benefitAmount)}
                                    </div>
                                </div>
                                <div class="card-footer">
                                    <a href="/policy/${policy.id}" onclick="Router.navigate('/policy/${policy.id}'); return false;" class="btn btn-primary btn-sm">View Details</a>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    // Render login page
    renderLogin() {
        return `
            ${this.renderNavbar()}
            <div class="container" style="max-width: 500px; margin: 4rem auto;">
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">Login</h2>
                        <p style="color: var(--text-tertiary); margin: 0;">Access your account</p>
                    </div>
                    <div class="card-body">
                        <form onsubmit="handleLogin(event)">
                            <div class="form-group">
                                <label class="form-label">Email</label>
                                <input type="email" name="email" class="form-input" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Password</label>
                                <input type="password" name="password" class="form-input" required>
                            </div>
                            <button type="submit" class="btn btn-primary" style="width: 100%;">Login</button>
                        </form>
                        
                        <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--divider-color);">
                            <p style="text-align: center; color: var(--text-tertiary); margin-bottom: 1rem;">Demo Accounts:</p>
                            <div style="font-size: 0.875rem; color: var(--text-secondary);">
                                <p><strong>Citizen:</strong> citizen@example.com / citizen123</p>
                                <p><strong>Admin:</strong> admin@gov.in / admin123</p>
                                <p><strong>Officer:</strong> officer@gov.in / officer123</p>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer">
                        <p style="text-align: center; margin: 0;">
                            Don't have an account? 
                            <a href="/register" onclick="Router.navigate('/register'); return false;">Register here</a>
                        </p>
                    </div>
                </div>
            </div>
        `;
    },

    // Render register page
    renderRegister() {
        return `
            ${this.renderNavbar()}
            <div class="container" style="max-width: 700px; margin: 4rem auto;">
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">Register</h2>
                        <p style="color: var(--text-tertiary); margin: 0;">Create your citizen account</p>
                    </div>
                    <div class="card-body">
                        <form onsubmit="handleRegister(event)">
                            <div class="grid grid-cols-2">
                                <div class="form-group">
                                    <label class="form-label">Full Name *</label>
                                    <input type="text" name="name" class="form-input" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Phone Number *</label>
                                    <input type="tel" name="phone" class="form-input" pattern="[6-9][0-9]{9}" required>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Email *</label>
                                <input type="email" name="email" class="form-input" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Password *</label>
                                <input type="password" name="password" class="form-input" minlength="6" required>
                            </div>
                            
                            <h4 style="margin-top: 2rem; margin-bottom: 1rem;">Profile Information</h4>
                            <div class="grid grid-cols-2">
                                <div class="form-group">
                                    <label class="form-label">Date of Birth</label>
                                    <input type="date" name="dob" class="form-input">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Gender</label>
                                    <select name="gender" class="form-select">
                                        <option value="">Select</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div class="grid grid-cols-2">
                                <div class="form-group">
                                    <label class="form-label">Aadhaar Number</label>
                                    <input type="text" name="aadhaar" class="form-input" pattern="[0-9]{12}">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">PAN Number</label>
                                    <input type="text" name="pan" class="form-input" pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}" style="text-transform: uppercase;">
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Address</label>
                                <textarea name="address" class="form-textarea"></textarea>
                            </div>
                            <div class="grid grid-cols-2">
                                <div class="form-group">
                                    <label class="form-label">Occupation</label>
                                    <select name="occupation" class="form-select">
                                        <option value="">Select</option>
                                        <option value="farmer">Farmer</option>
                                        <option value="student">Student</option>
                                        <option value="business">Business</option>
                                        <option value="self_employed">Self Employed</option>
                                        <option value="employed">Employed</option>
                                        <option value="unemployed">Unemployed</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Annual Income (₹)</label>
                                    <input type="number" name="annualIncome" class="form-input" min="0">
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Category</label>
                                <select name="category" class="form-select">
                                    <option value="general">General</option>
                                    <option value="obc">OBC</option>
                                    <option value="sc">SC</option>
                                    <option value="st">ST</option>
                                    <option value="minority">Minority</option>
                                </select>
                            </div>
                            
                            <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">Register</button>
                        </form>
                    </div>
                    <div class="card-footer">
                        <p style="text-align: center; margin: 0;">
                            Already have an account? 
                            <a href="/login" onclick="Router.navigate('/login'); return false;">Login here</a>
                        </p>
                    </div>
                </div>
            </div>
        `;
    },

    // Render policies page
    renderPolicies() {
        const user = Auth.getCurrentUser();
        const eligiblePolicies = user ? Policies.getEligiblePolicies(user) : [];

        return `
            ${this.renderNavbar()}
            <div class="container" style="margin: 2rem auto;">
                <div style="margin-bottom: 2rem;">
                    <h1>Government Policies & Schemes</h1>
                    <p style="color: var(--text-secondary);">
                        ${user ? `Showing ${eligiblePolicies.length} policies you're eligible for` : 'Browse all available government schemes'}
                    </p>
                </div>

                <div class="grid" style="grid-template-columns: 300px 1fr; gap: 2rem;">
                    <div class="filter-panel">
                        <h3 style="margin-bottom: 1.5rem;">Filters</h3>
                        <div class="filter-section">
                            <div class="filter-title">Sector</div>
                            <div class="checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" name="sector" value="all" checked onchange="handlePolicyFilter()"> All
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" name="sector" value="agriculture" onchange="handlePolicyFilter()"> Agriculture
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" name="sector" value="education" onchange="handlePolicyFilter()"> Education
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" name="sector" value="health" onchange="handlePolicyFilter()"> Health
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" name="sector" value="housing" onchange="handlePolicyFilter()"> Housing
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" name="sector" value="msme" onchange="handlePolicyFilter()"> MSME
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" name="sector" value="women_child" onchange="handlePolicyFilter()"> Women & Child
                                </label>
                            </div>
                        </div>
                        ${user ? `
                            <div class="filter-section">
                                <div class="filter-title">Eligibility</div>
                                <div class="checkbox-group">
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="eligibleOnly" onchange="handlePolicyFilter()"> Show Eligible Only
                                    </label>
                                </div>
                            </div>
                        ` : ''}
                    </div>

                    <div>
                        <div class="form-group">
                            <input type="text" id="policySearch" class="form-input" placeholder="Search policies..." oninput="handlePolicyFilter()">
                        </div>
                        <div id="policyList" class="grid grid-cols-2">
                            ${this.renderPolicyList(Policies.getAll().filter(p => p.status === 'active'), eligiblePolicies)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // Render policy list
    renderPolicyList(policies, eligiblePolicies = []) {
        const eligibleIds = eligiblePolicies.map(p => p.id);

        if (policies.length === 0) {
            return '<p style="grid-column: 1/-1; text-align: center; color: var(--text-tertiary); padding: 3rem;">No policies found</p>';
        }

        return policies.map((policy, index) => {
            const isEligible = eligibleIds.includes(policy.id);
            const isFeatured = index === 0; // Make first policy featured for demo
            return `
                <div class="card policy-card ${isFeatured ? 'policy-featured' : ''}">
                    <div class="card-header">
                        <div class="card-title">${policy.name}</div>
                        <div class="flex gap-sm" style="margin-top: 0.5rem;">
                            <span class="badge badge-primary policy-card-badge">${Policies.getSectorLabel(policy.sector)}</span>
                            ${isEligible ? '<span class="badge badge-success policy-card-badge">Eligible</span>' : ''}
                        </div>
                    </div>
                    <div class="card-body">
                        <p>${Utils.truncate(policy.description, 150)}</p>
                        <div class="policy-card-amount" style="margin-top: 1rem;">
                            ${Utils.formatCurrency(policy.benefitAmount)}
                        </div>
                        <div style="margin-top: 0.5rem; color: var(--text-tertiary); font-size: var(--font-size-sm);">
                            <strong>Type:</strong> ${policy.benefitType}
                        </div>
                    </div>
                    <div class="card-footer">
                        <a href="/policy/${policy.id}" onclick="Router.navigate('/policy/${policy.id}'); return false;" class="btn btn-primary btn-sm">View Details</a>
                    </div>
                </div>
            `;
        }).join('');
    },

    // Render policy detail page
    renderPolicyDetail(policyId) {
        const policy = Policies.getById(policyId);
        if (!policy) {
            return this.render404();
        }

        const user = Auth.getCurrentUser();
        const isEligible = user ? Policies.getEligiblePolicies(user).some(p => p.id === policyId) : false;

        return `
            ${this.renderNavbar()}
            <div class="container" style="margin: 2rem auto; max-width: 900px;">
                <div class="card">
                    <div class="card-header">
                        <div style="display: flex; justify-content: space-between; align-items: start;">
                            <div>
                                <h1 class="card-title" style="font-size: 2rem;">${policy.name}</h1>
                                <div class="flex gap-sm" style="margin-top: 1rem;">
                                    <span class="badge badge-primary">${Policies.getSectorLabel(policy.sector)}</span>
                                    <span class="badge ${policy.status === 'active' ? 'badge-success' : 'badge-danger'}">${policy.status}</span>
                                    ${isEligible ? '<span class="badge badge-success">You are Eligible</span>' : ''}
                                </div>
                            </div>
                            ${user && user.role === 'citizen' && isEligible ? `
                                <a href="/apply/${policy.id}" onclick="Router.navigate('/apply/${policy.id}'); return false;" class="btn btn-success">Apply Now</a>
                            ` : ''}
                        </div>
                    </div>
                    <div class="card-body">
                        <h3>Description</h3>
                        <p>${policy.description}</p>

                        <h3 style="margin-top: 2rem;">Benefit Details</h3>
                        <div class="grid grid-cols-2">
                            <div>
                                <strong>Benefit Amount:</strong> ${Utils.formatCurrency(policy.benefitAmount)}
                            </div>
                            <div>
                                <strong>Benefit Type:</strong> ${policy.benefitType}
                            </div>
                            <div>
                                <strong>Department:</strong> ${policy.department}
                            </div>
                            <div>
                                <strong>Start Date:</strong> ${Utils.formatDate(policy.startDate)}
                            </div>
                        </div>

                        <h3 style="margin-top: 2rem;">Eligibility Criteria</h3>
                        <ul style="color: var(--text-secondary);">
                            ${policy.eligibility.minAge ? `<li>Minimum Age: ${policy.eligibility.minAge} years</li>` : ''}
                            ${policy.eligibility.maxAge ? `<li>Maximum Age: ${policy.eligibility.maxAge} years</li>` : ''}
                            ${policy.eligibility.gender !== 'all' ? `<li>Gender: ${policy.eligibility.gender}</li>` : ''}
                            ${policy.eligibility.maxIncome ? `<li>Maximum Annual Income: ${Utils.formatCurrency(policy.eligibility.maxIncome)}</li>` : ''}
                            ${policy.eligibility.occupations && !policy.eligibility.occupations.includes('all') ? `<li>Occupations: ${policy.eligibility.occupations.join(', ')}</li>` : ''}
                            ${policy.eligibility.beneficiaryTypes ? `<li>Beneficiary Types: ${policy.eligibility.beneficiaryTypes.join(', ')}</li>` : ''}
                        </ul>

                        <h3 style="margin-top: 2rem;">Required Documents</h3>
                        <ul style="color: var(--text-secondary);">
                            ${policy.documents.map(doc => `<li>${doc}</li>`).join('')}
                        </ul>

                        ${policy.amendments && policy.amendments.length > 0 ? `
                            <h3 style="margin-top: 2rem;">Amendment History</h3>
                            <div class="table-container">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Changes</th>
                                            <th>Updated By</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${policy.amendments.map(amendment => `
                                            <tr>
                                                <td>${Utils.formatDate(amendment.date)}</td>
                                                <td>${amendment.changes}</td>
                                                <td>${amendment.updatedBy}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    },

    // Render 404 page
    render404() {
        return `
            ${this.renderNavbar()}
            <div class="container" style="text-align: center; padding: 4rem 0;">
                <h1 style="font-size: 4rem; margin-bottom: 1rem;">404</h1>
                <p style="font-size: 1.5rem; color: var(--text-secondary); margin-bottom: 2rem;">Page not found</p>
                <a href="/" onclick="Router.navigate('/'); return false;" class="btn btn-primary">Go Home</a>
            </div>
        `;
    },

    // Render citizen dashboard
    renderCitizenDashboard() {
        const user = Auth.getCurrentUser();
        const applications = Applications.getByUser(user.id);
        const payments = Payments.getByUser(user.id);
        const eligiblePolicies = Policies.getEligiblePolicies(user);
        const notifications = Notifications.getByUser(user.id).slice(0, 5);

        return `
            ${this.renderNavbar()}
            <div class="container" style="margin: 2rem auto;">
                <h1>Dashboard</h1>
                <p style="color: var(--text-secondary);">Welcome back, ${user.name}!</p>

                <div class="grid grid-cols-4" style="margin-top: 2rem;">
                    <div class="stat-card">
                        <div class="stat-value">${eligiblePolicies.length}</div>
                        <div class="stat-label">Eligible Policies</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${applications.length}</div>
                        <div class="stat-label">Applications</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${applications.filter(a => a.status === 'approved').length}</div>
                        <div class="stat-label">Approved</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${payments.filter(p => p.status === 'paid').length}</div>
                        <div class="stat-label">Payments Received</div>
                    </div>
                </div>

                <div class="grid grid-cols-2" style="margin-top: 2rem; gap: 2rem;">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Recent Applications</h3>
                        </div>
                        <div class="card-body">
                            ${applications.length > 0 ? `
                                <div class="table-container">
                                    <table class="table">
                                        <thead>
                                            <tr>
                                                <th>Policy</th>
                                                <th>Status</th>
                                                <th>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${applications.slice(0, 5).map(app => {
            const policy = Policies.getById(app.policyId);
            return `
                                                    <tr onclick="Router.navigate('/application/${app.id}')" style="cursor: pointer;">
                                                        <td>${policy?.name || 'Unknown'}</td>
                                                        <td><span class="badge ${Utils.getStatusBadge(app.status)}">${Utils.getStatusLabel(app.status)}</span></td>
                                                        <td>${Utils.formatDate(app.submittedAt)}</td>
                                                    </tr>
                                                `;
        }).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            ` : '<p style="color: var(--text-tertiary); text-align: center;">No applications yet</p>'}
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Notifications</h3>
                        </div>
                        <div class="card-body">
                            ${notifications.length > 0 ? notifications.map(notif => `
                                <div style="padding: 1rem; border-bottom: 1px solid var(--divider-color); ${!notif.read ? 'background: var(--bg-tertiary);' : ''}">
                                    <div style="font-weight: 600; margin-bottom: 0.25rem;">${notif.title}</div>
                                    <div style="font-size: 0.875rem; color: var(--text-secondary);">${notif.message}</div>
                                    <div style="font-size: 0.75rem; color: var(--text-tertiary); margin-top: 0.25rem;">${Utils.formatDate(notif.createdAt)}</div>
                                </div>
                            `).join('') : '<p style="color: var(--text-tertiary); text-align: center;">No notifications</p>'}
                        </div>
                    </div>
                </div>

                <div class="card" style="margin-top: 2rem;">
                    <div class="card-header">
                        <h3 class="card-title">Policies You're Eligible For</h3>
                    </div>
                    <div class="card-body">
                        <div class="grid grid-cols-3">
                            ${eligiblePolicies.slice(0, 6).map((policy, index) => `
                                <div class="card policy-card">
                                    <div class="card-header">
                                        <div class="card-title" style="font-size: 1rem;">${policy.name}</div>
                                        <span class="badge badge-primary policy-card-badge">${Policies.getSectorLabel(policy.sector)}</span>
                                    </div>
                                    <div class="card-body">
                                        <p style="font-size: 0.875rem;">${Utils.truncate(policy.description, 100)}</p>
                                        <div class="policy-card-amount" style="margin-top: 0.5rem;">${Utils.formatCurrency(policy.benefitAmount)}</div>
                                    </div>
                                    <div class="card-footer">
                                        <a href="/apply/${policy.id}" onclick="Router.navigate('/apply/${policy.id}'); return false;" class="btn btn-success btn-sm">Apply Now</a>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // Render profile page
    renderProfile() {
        const user = Auth.getCurrentUser();
        return `
            ${this.renderNavbar()}
            <div class="container" style="margin: 2rem auto; max-width: 800px;">
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">Profile</h2>
                    </div>
                    <div class="card-body">
                        <form onsubmit="handleProfileUpdate(event)">
                            <div class="grid grid-cols-2">
                                <div class="form-group">
                                    <label class="form-label">Name</label>
                                    <input type="text" name="name" class="form-input" value="${user.name}" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Phone</label>
                                    <input type="tel" name="phone" class="form-input" value="${user.phone}" required>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Email</label>
                                <input type="email" class="form-input" value="${user.email}" disabled>
                            </div>
                            ${user.role === 'citizen' ? `
                                <h4 style="margin-top: 2rem; margin-bottom: 1rem;">Profile Information</h4>
                                <div class="grid grid-cols-2">
                                    <div class="form-group">
                                        <label class="form-label">Date of Birth</label>
                                        <input type="date" name="dob" class="form-input" value="${user.profile?.dob || ''}">
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">Gender</label>
                                        <select name="gender" class="form-select">
                                            <option value="">Select</option>
                                            <option value="male" ${user.profile?.gender === 'male' ? 'selected' : ''}>Male</option>
                                            <option value="female" ${user.profile?.gender === 'female' ? 'selected' : ''}>Female</option>
                                            <option value="other" ${user.profile?.gender === 'other' ? 'selected' : ''}>Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="grid grid-cols-2">
                                    <div class="form-group">
                                        <label class="form-label">Aadhaar</label>
                                        <input type="text" name="aadhaar" class="form-input" value="${user.profile?.aadhaar || ''}">
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">PAN</label>
                                        <input type="text" name="pan" class="form-input" value="${user.profile?.pan || ''}" style="text-transform: uppercase;">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Address</label>
                                    <textarea name="address" class="form-textarea">${user.profile?.address || ''}</textarea>
                                </div>
                                <div class="grid grid-cols-2">
                                    <div class="form-group">
                                        <label class="form-label">Occupation</label>
                                        <select name="occupation" class="form-select">
                                            <option value="">Select</option>
                                            <option value="farmer" ${user.profile?.occupation === 'farmer' ? 'selected' : ''}>Farmer</option>
                                            <option value="student" ${user.profile?.occupation === 'student' ? 'selected' : ''}>Student</option>
                                            <option value="business" ${user.profile?.occupation === 'business' ? 'selected' : ''}>Business</option>
                                            <option value="self_employed" ${user.profile?.occupation === 'self_employed' ? 'selected' : ''}>Self Employed</option>
                                            <option value="employed" ${user.profile?.occupation === 'employed' ? 'selected' : ''}>Employed</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">Annual Income (₹)</label>
                                        <input type="number" name="annualIncome" class="form-input" value="${user.profile?.annualIncome || ''}">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Category</label>
                                    <select name="category" class="form-select">
                                        <option value="general" ${user.profile?.category === 'general' ? 'selected' : ''}>General</option>
                                        <option value="obc" ${user.profile?.category === 'obc' ? 'selected' : ''}>OBC</option>
                                        <option value="sc" ${user.profile?.category === 'sc' ? 'selected' : ''}>SC</option>
                                        <option value="st" ${user.profile?.category === 'st' ? 'selected' : ''}>ST</option>
                                        <option value="minority" ${user.profile?.category === 'minority' ? 'selected' : ''}>Minority</option>
                                    </select>
                                </div>
                            ` : ''}
                            <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">Update Profile</button>
                        </form>
                    </div>
                </div>
            </div>
        `;
    },

    // Render applications list
    renderApplications() {
        const user = Auth.getCurrentUser();
        const applications = Applications.getByUser(user.id);
        const appsWithDetails = Applications.getWithPolicyDetails(applications);

        return `
            ${this.renderNavbar()}
            <div class="container" style="margin: 2rem auto;">
                <h1>My Applications</h1>
                <p style="color: var(--text-secondary);">Track all your policy applications</p>

                ${appsWithDetails.length > 0 ? `
                    <div class="table-container" style="margin-top: 2rem;">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Application ID</th>
                                    <th>Policy</th>
                                    <th>Submitted</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${appsWithDetails.map(app => `
                                    <tr>
                                        <td>${app.id}</td>
                                        <td>${app.policy?.name || 'Unknown'}</td>
                                        <td>${Utils.formatDate(app.submittedAt)}</td>
                                        <td><span class="badge ${Utils.getStatusBadge(app.status)}">${Utils.getStatusLabel(app.status)}</span></td>
                                        <td>
                                            <a href="/application/${app.id}" onclick="Router.navigate('/application/${app.id}'); return false;" class="btn btn-primary btn-sm">View Details</a>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : `
                    <div class="card" style="margin-top: 2rem; text-align: center; padding: 3rem;">
                        <p style="color: var(--text-tertiary); margin-bottom: 1.5rem;">You haven't submitted any applications yet</p>
                        <a href="/policies" onclick="Router.navigate('/policies'); return false;" class="btn btn-primary">Browse Policies</a>
                    </div>
                `}
            </div>
        `;
    },

    // Render application detail
    renderApplicationDetail(appId) {
        const application = Applications.getById(appId);
        if (!application) {
            return this.render404();
        }

        const policy = Policies.getById(application.policyId);
        const payment = Payments.getByApplication(appId)[0];

        return `
            ${this.renderNavbar()}
            <div class="container" style="margin: 2rem auto; max-width: 900px;">
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">Application Details</h2>
                        <span class="badge ${Utils.getStatusBadge(application.status)}">${Utils.getStatusLabel(application.status)}</span>
                    </div>
                    <div class="card-body">
                        <div class="grid grid-cols-2">
                            <div>
                                <strong>Application ID:</strong> ${application.id}
                            </div>
                            <div>
                                <strong>Submitted:</strong> ${Utils.formatDate(application.submittedAt)}
                            </div>
                            <div style="grid-column: 1/-1;">
                                <strong>Policy:</strong> ${policy?.name || 'Unknown'}
                            </div>
                        </div>

                        <h3 style="margin-top: 2rem;">Status History</h3>
                        <div class="table-container">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th>Note</th>
                                        <th>Updated By</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${application.statusHistory.map(history => `
                                        <tr>
                                            <td><span class="badge ${Utils.getStatusBadge(history.status)}">${Utils.getStatusLabel(history.status)}</span></td>
                                            <td>${Utils.formatDate(history.timestamp)}</td>
                                            <td>${history.note || '-'}</td>
                                            <td>${history.updatedBy || '-'}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>

                        ${payment ? `
                            <h3 style="margin-top: 2rem;">Payment Information</h3>
                            <div class="grid grid-cols-2">
                                <div>
                                    <strong>Amount:</strong> ${Utils.formatCurrency(payment.amount)}
                                </div>
                                <div>
                                    <strong>Method:</strong> ${payment.method}
                                </div>
                                <div>
                                    <strong>Status:</strong> <span class="badge ${Utils.getStatusBadge(payment.status)}">${Utils.getStatusLabel(payment.status)}</span>
                                </div>
                                <div>
                                    <strong>Initiated:</strong> ${Utils.formatDate(payment.initiatedAt)}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    },

    // Render apply form
    renderApplyForm(policyId) {
        const policy = Policies.getById(policyId);
        if (!policy) {
            return this.render404();
        }

        return `
            ${this.renderNavbar()}
            <div class="container" style="margin: 2rem auto; max-width: 800px;">
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">Apply for ${policy.name}</h2>
                    </div>
                    <div class="card-body">
                        <div class="alert alert-info">
                            <strong>Benefit Amount:</strong> ${Utils.formatCurrency(policy.benefitAmount)}<br>
                            <strong>Required Documents:</strong> ${policy.documents.join(', ')}
                        </div>

                        <form onsubmit="handleApplicationSubmit(event, '${policyId}')">
                            <h4>Application Form</h4>
                            <div class="form-group">
                                <label class="form-label">Purpose of Application</label>
                                <textarea name="purpose" class="form-textarea" required></textarea>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Bank Account Number</label>
                                <input type="text" name="bankAccount" class="form-input" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">IFSC Code</label>
                                <input type="text" name="ifsc" class="form-input" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Upload Documents (Simulated)</label>
                                <input type="file" class="form-file" multiple>
                                <p style="font-size: 0.875rem; color: var(--text-tertiary); margin-top: 0.5rem;">
                                    Note: Document upload is simulated for this demo
                                </p>
                            </div>
                            <button type="submit" class="btn btn-success" style="width: 100%; margin-top: 1rem;">Submit Application</button>
                        </form>
                    </div>
                </div>
            </div>
        `;
    },

    // Render payments list
    renderPayments() {
        const user = Auth.getCurrentUser();
        const payments = Payments.getByUser(user.id);
        const paymentsWithDetails = Payments.getWithDetails(payments);

        return `
            ${this.renderNavbar()}
            <div class="container" style="margin: 2rem auto;">
                <h1>My Payments</h1>
                <p style="color: var(--text-secondary);">Track all benefit payments</p>

                ${paymentsWithDetails.length > 0 ? `
                    <div class="table-container" style="margin-top: 2rem;">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Payment ID</th>
                                    <th>Policy</th>
                                    <th>Amount</th>
                                    <th>Method</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${paymentsWithDetails.map(payment => `
                                    <tr>
                                        <td>${payment.id}</td>
                                        <td>${payment.policy?.name || 'Unknown'}</td>
                                        <td>${Utils.formatCurrency(payment.amount)}</td>
                                        <td>${payment.method}</td>
                                        <td><span class="badge ${Utils.getStatusBadge(payment.status)}">${Utils.getStatusLabel(payment.status)}</span></td>
                                        <td>${Utils.formatDate(payment.initiatedAt)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : `
                    <div class="card" style="margin-top: 2rem; text-align: center; padding: 3rem;">
                        <p style="color: var(--text-tertiary);">No payments yet</p>
                    </div>
                `}
            </div>
        `;
    },

    // Render admin dashboard
    renderAdminDashboard() {
        const stats = Analytics.getOverview();
        const policyAdoption = Analytics.getPolicyAdoption().slice(0, 5);
        const sectorStats = Analytics.getSectorStats();

        return `
            ${this.renderNavbar()}
            <div class="container" style="margin: 2rem auto;">
                <h1>Admin Dashboard</h1>
                <p style="color: var(--text-secondary);">Platform overview and analytics</p>

                <div class="grid grid-cols-4" style="margin-top: 2rem;">
                    <div class="stat-card">
                        <div class="stat-value">${stats.totalPolicies}</div>
                        <div class="stat-label">Total Policies</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.totalApplications}</div>
                        <div class="stat-label">Total Applications</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.totalUsers}</div>
                        <div class="stat-label">Total Citizens</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${Utils.formatCurrency(stats.totalAmountDisbursed)}</div>
                        <div class="stat-label">Amount Disbursed</div>
                    </div>
                </div>

                <div class="grid grid-cols-2" style="margin-top: 2rem; gap: 2rem;">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Top Policies by Applications</h3>
                        </div>
                        <div class="card-body">
                            <div class="table-container">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>Policy</th>
                                            <th>Applications</th>
                                            <th>Approval Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${policyAdoption.map(p => `
                                            <tr>
                                                <td>${p.policyName}</td>
                                                <td>${p.totalApplications}</td>
                                                <td>${p.approvalRate}%</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Sector-wise Statistics</h3>
                        </div>
                        <div class="card-body">
                            <div class="table-container">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>Sector</th>
                                            <th>Policies</th>
                                            <th>Applications</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${sectorStats.map(s => `
                                            <tr>
                                                <td>${s.label}</td>
                                                <td>${s.policies}</td>
                                                <td>${s.applications}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex gap-md" style="margin-top: 2rem;">
                    <a href="/admin/policies" onclick="Router.navigate('/admin/policies'); return false;" class="btn btn-primary">Manage Policies</a>
                    <a href="/admin/policy/new" onclick="Router.navigate('/admin/policy/new'); return false;" class="btn btn-success">Create New Policy</a>
                </div>
            </div>
        `;
    },

    // Render admin policies (simplified - full CRUD would be larger)
    renderAdminPolicies() {
        const policies = Policies.getAll();

        return `
            ${this.renderNavbar()}
            <div class="container" style="margin: 2rem auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <div>
                        <h1>Manage Policies</h1>
                        <p style="color: var(--text-secondary);">Create, edit, and manage government policies</p>
                    </div>
                    <a href="/admin/policy/new" onclick="Router.navigate('/admin/policy/new'); return false;" class="btn btn-success">Create New Policy</a>
                </div>

                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Sector</th>
                                <th>Benefit Amount</th>
                                <th>Status</th>
                                <th>Applications</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${policies.map(policy => {
            const appCount = Applications.getAll().filter(a => a.policyId === policy.id).length;
            return `
                                    <tr>
                                        <td>${policy.name}</td>
                                        <td>${Policies.getSectorLabel(policy.sector)}</td>
                                        <td>${Utils.formatCurrency(policy.benefitAmount)}</td>
                                        <td><span class="badge ${policy.status === 'active' ? 'badge-success' : 'badge-danger'}">${policy.status}</span></td>
                                        <td>${appCount}</td>
                                        <td>
                                            <a href="/policy/${policy.id}" onclick="Router.navigate('/policy/${policy.id}'); return false;" class="btn btn-primary btn-sm">View</a>
                                        </td>
                                    </tr>
                                `;
        }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    // Render policy form (simplified)
    renderPolicyForm(policyId = null) {
        return `
            ${this.renderNavbar()}
            <div class="container" style="margin: 2rem auto; max-width: 800px;">
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">${policyId ? 'Edit' : 'Create'} Policy</h2>
                    </div>
                    <div class="card-body">
                        <p style="color: var(--text-secondary);">Policy creation form would go here (simplified for demo)</p>
                        <a href="/admin/policies" onclick="Router.navigate('/admin/policies'); return false;" class="btn btn-secondary">Back to Policies</a>
                    </div>
                </div>
            </div>
        `;
    },

    // Render government dashboard
    renderGovernmentDashboard() {
        const applications = Applications.getAll();
        const stats = Applications.getStats();

        return `
            ${this.renderNavbar()}
            <div class="container" style="margin: 2rem auto;">
                <h1>Government Officer Dashboard</h1>
                <p style="color: var(--text-secondary);">Review and process applications</p>

                <div class="grid grid-cols-4" style="margin-top: 2rem;">
                    <div class="stat-card">
                        <div class="stat-value">${stats.pending}</div>
                        <div class="stat-label">Pending Review</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.underReview}</div>
                        <div class="stat-label">Under Review</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.approved}</div>
                        <div class="stat-label">Approved</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.rejected}</div>
                        <div class="stat-label">Rejected</div>
                    </div>
                </div>

                <div class="card" style="margin-top: 2rem;">
                    <div class="card-header">
                        <h3 class="card-title">Recent Applications</h3>
                    </div>
                    <div class="card-body">
                        <div class="table-container">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Application ID</th>
                                        <th>Citizen</th>
                                        <th>Policy</th>
                                        <th>Submitted</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${Applications.getWithPolicyDetails(applications.slice(0, 10)).map(app => `
                                        <tr>
                                            <td>${app.id}</td>
                                            <td>${app.user?.name || 'Unknown'}</td>
                                            <td>${app.policy?.name || 'Unknown'}</td>
                                            <td>${Utils.formatDate(app.submittedAt)}</td>
                                            <td><span class="badge ${Utils.getStatusBadge(app.status)}">${Utils.getStatusLabel(app.status)}</span></td>
                                            <td>
                                                <a href="/government/application/${app.id}" onclick="Router.navigate('/government/application/${app.id}'); return false;" class="btn btn-primary btn-sm">Review</a>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div style="margin-top: 2rem;">
                    <a href="/government/applications" onclick="Router.navigate('/government/applications'); return false;" class="btn btn-primary">View All Applications</a>
                </div>
            </div>
        `;
    },

    // Render government applications
    renderGovernmentApplications() {
        const applications = Applications.getAll();
        const appsWithDetails = Applications.getWithPolicyDetails(applications);

        return `
            ${this.renderNavbar()}
            <div class="container" style="margin: 2rem auto;">
                <h1>All Applications</h1>
                <p style="color: var(--text-secondary);">Review and process citizen applications</p>

                <div class="table-container" style="margin-top: 2rem;">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Application ID</th>
                                <th>Citizen</th>
                                <th>Policy</th>
                                <th>Submitted</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${appsWithDetails.map(app => `
                                <tr>
                                    <td>${app.id}</td>
                                    <td>${app.user?.name || 'Unknown'}</td>
                                    <td>${app.policy?.name || 'Unknown'}</td>
                                    <td>${Utils.formatDate(app.submittedAt)}</td>
                                    <td><span class="badge ${Utils.getStatusBadge(app.status)}">${Utils.getStatusLabel(app.status)}</span></td>
                                    <td>
                                        <a href="/government/application/${app.id}" onclick="Router.navigate('/government/application/${app.id}'); return false;" class="btn btn-primary btn-sm">Review</a>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    // Render government application detail
    renderGovernmentApplicationDetail(appId) {
        const application = Applications.getById(appId);
        if (!application) {
            return this.render404();
        }

        const policy = Policies.getById(application.policyId);
        const user = Database.findById('users', application.userId);

        return `
            ${this.renderNavbar()}
            <div class="container" style="margin: 2rem auto; max-width: 900px;">
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">Review Application</h2>
                        <span class="badge ${Utils.getStatusBadge(application.status)}">${Utils.getStatusLabel(application.status)}</span>
                    </div>
                    <div class="card-body">
                        <h3>Application Information</h3>
                        <div class="grid grid-cols-2">
                            <div><strong>Application ID:</strong> ${application.id}</div>
                            <div><strong>Submitted:</strong> ${Utils.formatDate(application.submittedAt)}</div>
                            <div><strong>Citizen:</strong> ${user?.name || 'Unknown'}</div>
                            <div><strong>Email:</strong> ${user?.email || 'Unknown'}</div>
                            <div style="grid-column: 1/-1;"><strong>Policy:</strong> ${policy?.name || 'Unknown'}</div>
                        </div>

                        <h3 style="margin-top: 2rem;">Citizen Profile</h3>
                        <div class="grid grid-cols-2">
                            <div><strong>Age:</strong> ${user?.profile?.dob ? Utils.calculateAge(user.profile.dob) : 'N/A'}</div>
                            <div><strong>Gender:</strong> ${user?.profile?.gender || 'N/A'}</div>
                            <div><strong>Occupation:</strong> ${user?.profile?.occupation || 'N/A'}</div>
                            <div><strong>Income:</strong> ${user?.profile?.annualIncome ? Utils.formatCurrency(user.profile.annualIncome) : 'N/A'}</div>
                            <div><strong>Category:</strong> ${user?.profile?.category || 'N/A'}</div>
                        </div>

                        ${application.status === 'pending' || application.status === 'under_review' ? `
                            <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid var(--divider-color);">
                                <h3>Review Actions</h3>
                                <div class="flex gap-md" style="margin-top: 1rem;">
                                    ${application.status === 'pending' ? `
                                        <button onclick="handleApplicationAction('${appId}', 'under_review')" class="btn btn-primary">Start Review</button>
                                    ` : ''}
                                    <button onclick="handleApplicationAction('${appId}', 'approved')" class="btn btn-success">Approve</button>
                                    <button onclick="handleApplicationAction('${appId}', 'rejected')" class="btn btn-danger">Reject</button>
                                </div>
                            </div>
                        ` : ''}

                        <h3 style="margin-top: 2rem;">Status History</h3>
                        <div class="table-container">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th>Note</th>
                                        <th>Updated By</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${application.statusHistory.map(history => `
                                        <tr>
                                            <td><span class="badge ${Utils.getStatusBadge(history.status)}">${Utils.getStatusLabel(history.status)}</span></td>
                                            <td>${Utils.formatDate(history.timestamp)}</td>
                                            <td>${history.note || '-'}</td>
                                            <td>${history.updatedBy || '-'}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};
