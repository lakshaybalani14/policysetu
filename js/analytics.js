// Analytics and dashboard calculations

const Analytics = {
    // Get overview statistics
    getOverview() {
        const policies = Policies.getAll();
        const applications = Applications.getAll();
        const payments = Payments.getAll();
        const users = Database.get('users') || [];

        return {
            totalPolicies: policies.length,
            activePolicies: policies.filter(p => p.status === 'active').length,
            totalApplications: applications.length,
            totalUsers: users.filter(u => u.role === 'citizen').length,
            totalPayments: payments.filter(p => p.status === 'paid').length,
            totalAmountDisbursed: payments
                .filter(p => p.status === 'paid')
                .reduce((sum, p) => sum + p.amount, 0)
        };
    },

    // Get policy adoption metrics
    getPolicyAdoption() {
        const policies = Policies.getAll();
        const applications = Applications.getAll();

        return policies.map(policy => {
            const policyApps = applications.filter(a => a.policyId === policy.id);
            const approved = policyApps.filter(a => a.status === 'approved').length;
            const pending = policyApps.filter(a => a.status === 'pending').length;
            const rejected = policyApps.filter(a => a.status === 'rejected').length;

            return {
                policyId: policy.id,
                policyName: policy.name,
                sector: policy.sector,
                totalApplications: policyApps.length,
                approved,
                pending,
                rejected,
                approvalRate: policyApps.length > 0
                    ? ((approved / policyApps.length) * 100).toFixed(1)
                    : 0
            };
        }).sort((a, b) => b.totalApplications - a.totalApplications);
    },

    // Get demographic breakdown
    getDemographics() {
        const users = Database.get('users') || [];
        const citizens = users.filter(u => u.role === 'citizen' && u.profile);

        const demographics = {
            byGender: {},
            byAge: {
                '0-18': 0,
                '19-30': 0,
                '31-45': 0,
                '46-60': 0,
                '60+': 0
            },
            byCategory: {},
            byOccupation: {},
            byIncome: {
                '0-1L': 0,
                '1L-3L': 0,
                '3L-5L': 0,
                '5L+': 0
            }
        };

        citizens.forEach(user => {
            const profile = user.profile;

            // Gender
            if (profile.gender) {
                demographics.byGender[profile.gender] =
                    (demographics.byGender[profile.gender] || 0) + 1;
            }

            // Age
            if (profile.dob) {
                const age = Utils.calculateAge(profile.dob);
                if (age <= 18) demographics.byAge['0-18']++;
                else if (age <= 30) demographics.byAge['19-30']++;
                else if (age <= 45) demographics.byAge['31-45']++;
                else if (age <= 60) demographics.byAge['46-60']++;
                else demographics.byAge['60+']++;
            }

            // Category
            if (profile.category) {
                demographics.byCategory[profile.category] =
                    (demographics.byCategory[profile.category] || 0) + 1;
            }

            // Occupation
            if (profile.occupation) {
                demographics.byOccupation[profile.occupation] =
                    (demographics.byOccupation[profile.occupation] || 0) + 1;
            }

            // Income
            if (profile.annualIncome !== undefined) {
                const income = profile.annualIncome;
                if (income < 100000) demographics.byIncome['0-1L']++;
                else if (income < 300000) demographics.byIncome['1L-3L']++;
                else if (income < 500000) demographics.byIncome['3L-5L']++;
                else demographics.byIncome['5L+']++;
            }
        });

        return demographics;
    },

    // Get sector-wise statistics
    getSectorStats() {
        const policies = Policies.getAll();
        const applications = Applications.getAll();
        const payments = Payments.getAll();

        const sectors = {};

        policies.forEach(policy => {
            if (!sectors[policy.sector]) {
                sectors[policy.sector] = {
                    sector: policy.sector,
                    label: Policies.getSectorLabel(policy.sector),
                    policies: 0,
                    applications: 0,
                    approved: 0,
                    amountDisbursed: 0
                };
            }

            sectors[policy.sector].policies++;

            const policyApps = applications.filter(a => a.policyId === policy.id);
            sectors[policy.sector].applications += policyApps.length;
            sectors[policy.sector].approved += policyApps.filter(a => a.status === 'approved').length;

            const policyPayments = payments.filter(p =>
                p.policyId === policy.id && p.status === 'paid'
            );
            sectors[policy.sector].amountDisbursed += policyPayments.reduce((sum, p) => sum + p.amount, 0);
        });

        return Object.values(sectors).sort((a, b) => b.applications - a.applications);
    },

    // Get time-series data for applications
    getApplicationTrend(days = 30) {
        const applications = Applications.getAll();
        const now = new Date();
        const trend = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);

            const count = applications.filter(a => {
                const appDate = new Date(a.submittedAt);
                return appDate >= date && appDate < nextDate;
            }).length;

            trend.push({
                date: date.toISOString().split('T')[0],
                count
            });
        }

        return trend;
    },

    // Get payment statistics
    getPaymentStats() {
        const payments = Payments.getAll();

        const stats = {
            total: payments.length,
            processing: payments.filter(p => p.status === 'processing').length,
            completed: payments.filter(p => p.status === 'paid').length,
            failed: payments.filter(p => p.status === 'failed').length,
            totalAmount: payments
                .filter(p => p.status === 'paid')
                .reduce((sum, p) => sum + p.amount, 0),
            byMethod: {}
        };

        payments.forEach(p => {
            if (p.status === 'paid') {
                stats.byMethod[p.method] = (stats.byMethod[p.method] || 0) + 1;
            }
        });

        return stats;
    },

    // Get top beneficiaries
    getTopBeneficiaries(limit = 10) {
        const payments = Payments.getAll().filter(p => p.status === 'paid');
        const beneficiaries = {};

        payments.forEach(payment => {
            if (!beneficiaries[payment.userId]) {
                const user = Database.findById('users', payment.userId);
                beneficiaries[payment.userId] = {
                    userId: payment.userId,
                    userName: user?.name || 'Unknown',
                    totalAmount: 0,
                    paymentCount: 0
                };
            }

            beneficiaries[payment.userId].totalAmount += payment.amount;
            beneficiaries[payment.userId].paymentCount++;
        });

        return Object.values(beneficiaries)
            .sort((a, b) => b.totalAmount - a.totalAmount)
            .slice(0, limit);
    }
};
