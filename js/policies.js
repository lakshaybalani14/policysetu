// Policy management and filtering

const Policies = {
    // Get all policies
    getAll() {
        return Database.get('policies') || [];
    },

    // Get policy by ID
    getById(id) {
        return Database.findById('policies', id);
    },

    // Create new policy (admin only)
    create(policyData) {
        const policy = {
            id: Utils.generateId(),
            ...policyData,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            amendments: []
        };

        Database.add('policies', policy);
        return policy;
    },

    // Update policy (admin only)
    update(id, updates) {
        const policy = Database.findById('policies', id);
        if (!policy) {
            throw new Error('Policy not found');
        }

        // Track amendment if significant changes
        const amendment = {
            date: new Date().toISOString(),
            changes: this.getChangeSummary(policy, updates),
            updatedBy: Auth.getCurrentUser()?.name || 'System'
        };

        const amendments = [...(policy.amendments || []), amendment];

        return Database.update('policies', id, {
            ...updates,
            amendments
        });
    },

    // Get change summary for amendments
    getChangeSummary(oldPolicy, updates) {
        const changes = [];
        const fields = {
            name: 'Policy Name',
            description: 'Description',
            benefitAmount: 'Benefit Amount',
            eligibility: 'Eligibility Criteria',
            documents: 'Required Documents',
            status: 'Status'
        };

        Object.keys(updates).forEach(key => {
            if (fields[key] && JSON.stringify(oldPolicy[key]) !== JSON.stringify(updates[key])) {
                changes.push(`${fields[key]} updated`);
            }
        });

        return changes.join(', ');
    },

    // Delete policy (admin only)
    delete(id) {
        return Database.delete('policies', id);
    },

    // Filter policies based on criteria
    filter(filters = {}) {
        let policies = this.getAll();

        // Filter by sector
        if (filters.sector && filters.sector !== 'all') {
            policies = policies.filter(p => p.sector === filters.sector);
        }

        // Filter by status
        if (filters.status && filters.status !== 'all') {
            policies = policies.filter(p => p.status === filters.status);
        }

        // Filter by search query
        if (filters.search) {
            const query = filters.search.toLowerCase();
            policies = policies.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.description.toLowerCase().includes(query) ||
                p.department.toLowerCase().includes(query)
            );
        }

        return policies;
    },

    // Get eligible policies for a user
    getEligiblePolicies(user) {
        if (!user || !user.profile) {
            return [];
        }

        const policies = this.getAll().filter(p => p.status === 'active');
        const profile = user.profile;
        const age = profile.dob ? Utils.calculateAge(profile.dob) : null;

        return policies.filter(policy => {
            const elig = policy.eligibility;

            // Check age
            if (age !== null) {
                if (elig.minAge && age < elig.minAge) return false;
                if (elig.maxAge && age > elig.maxAge) return false;
            }

            // Check gender
            if (elig.gender && elig.gender !== 'all' && profile.gender !== elig.gender) {
                return false;
            }

            // Check income
            if (profile.annualIncome !== undefined) {
                if (elig.minIncome && profile.annualIncome < elig.minIncome) return false;
                if (elig.maxIncome && profile.annualIncome > elig.maxIncome) return false;
            }

            // Check occupation
            if (elig.occupations && !elig.occupations.includes('all')) {
                if (!profile.occupation || !elig.occupations.includes(profile.occupation)) {
                    return false;
                }
            }

            // Check category
            if (elig.categories && !elig.categories.includes('all')) {
                if (!profile.category || !elig.categories.includes(profile.category)) {
                    return false;
                }
            }

            // Check beneficiary types
            if (elig.beneficiaryTypes && profile.beneficiaryTypes) {
                const hasMatch = elig.beneficiaryTypes.some(type =>
                    profile.beneficiaryTypes.includes(type)
                );
                if (!hasMatch) return false;
            }

            return true;
        });
    },

    // Get policy statistics
    getStats() {
        const policies = this.getAll();
        const applications = Database.get('applications') || [];

        return {
            total: policies.length,
            active: policies.filter(p => p.status === 'active').length,
            inactive: policies.filter(p => p.status === 'inactive').length,
            totalApplications: applications.length,
            bySector: this.getStatsBySector(policies),
            topPolicies: this.getTopPolicies(policies, applications)
        };
    },

    // Get stats by sector
    getStatsBySector(policies) {
        const sectors = {};
        policies.forEach(p => {
            sectors[p.sector] = (sectors[p.sector] || 0) + 1;
        });
        return sectors;
    },

    // Get top policies by application count
    getTopPolicies(policies, applications) {
        const counts = {};
        applications.forEach(app => {
            counts[app.policyId] = (counts[app.policyId] || 0) + 1;
        });

        return policies
            .map(p => ({
                ...p,
                applicationCount: counts[p.id] || 0
            }))
            .sort((a, b) => b.applicationCount - a.applicationCount)
            .slice(0, 5);
    },

    // Get sector label
    getSectorLabel(sector) {
        const labels = {
            agriculture: 'Agriculture',
            education: 'Education',
            health: 'Health',
            housing: 'Housing',
            msme: 'MSME & Business',
            women_child: 'Women & Child',
            employment: 'Employment',
            social_welfare: 'Social Welfare',
            infrastructure: 'Infrastructure',
            other: 'Other'
        };
        return labels[sector] || sector;
    }
};
