// Application workflow management

const Applications = {
    // Create new application
    create(applicationData) {
        const application = {
            id: Utils.generateId(),
            userId: applicationData.userId,
            policyId: applicationData.policyId,
            status: 'pending',
            submittedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            documents: applicationData.documents || [],
            formData: applicationData.formData || {},
            reviewNotes: [],
            statusHistory: [{
                status: 'pending',
                timestamp: new Date().toISOString(),
                note: 'Application submitted'
            }]
        };

        Database.add('applications', application);

        // Create notification for user
        const policy = Policies.getById(applicationData.policyId);
        Notifications.create(applicationData.userId, {
            title: 'Application Submitted',
            message: `Your application for "${policy.name}" has been submitted successfully.`,
            type: 'success',
            link: `/applications/${application.id}`
        });

        return application;
    },

    // Get application by ID
    getById(id) {
        return Database.findById('applications', id);
    },

    // Get applications by user
    getByUser(userId) {
        return Database.find('applications', { userId });
    },

    // Get all applications (for admin/government)
    getAll() {
        return Database.get('applications') || [];
    },

    // Update application status
    updateStatus(id, status, note = '', updatedBy = null) {
        const application = this.getById(id);
        if (!application) {
            throw new Error('Application not found');
        }

        const statusHistory = [
            ...application.statusHistory,
            {
                status,
                timestamp: new Date().toISOString(),
                note,
                updatedBy: updatedBy || Auth.getCurrentUser()?.name || 'System'
            }
        ];

        const updated = Database.update('applications', id, {
            status,
            statusHistory
        });

        // Create notification for user
        const policy = Policies.getById(application.policyId);
        let notificationMessage = '';
        let notificationType = 'info';

        switch (status) {
            case 'under_review':
                notificationMessage = `Your application for "${policy.name}" is now under review.`;
                notificationType = 'info';
                break;
            case 'approved':
                notificationMessage = `Congratulations! Your application for "${policy.name}" has been approved.`;
                notificationType = 'success';
                break;
            case 'rejected':
                notificationMessage = `Your application for "${policy.name}" has been rejected. ${note}`;
                notificationType = 'danger';
                break;
        }

        if (notificationMessage) {
            Notifications.create(application.userId, {
                title: 'Application Status Update',
                message: notificationMessage,
                type: notificationType,
                link: `/applications/${id}`
            });
        }

        // If approved, initiate payment
        if (status === 'approved') {
            Payments.initiate(application.id);
        }

        return updated;
    },

    // Add review note
    addReviewNote(id, note) {
        const application = this.getById(id);
        if (!application) {
            throw new Error('Application not found');
        }

        const reviewNotes = [
            ...application.reviewNotes,
            {
                note,
                timestamp: new Date().toISOString(),
                reviewer: Auth.getCurrentUser()?.name || 'System'
            }
        ];

        return Database.update('applications', id, { reviewNotes });
    },

    // Get application statistics
    getStats() {
        const applications = this.getAll();

        return {
            total: applications.length,
            pending: applications.filter(a => a.status === 'pending').length,
            underReview: applications.filter(a => a.status === 'under_review').length,
            approved: applications.filter(a => a.status === 'approved').length,
            rejected: applications.filter(a => a.status === 'rejected').length
        };
    },

    // Get applications with policy details
    getWithPolicyDetails(applications) {
        return applications.map(app => ({
            ...app,
            policy: Policies.getById(app.policyId),
            user: Database.findById('users', app.userId)
        }));
    },

    // Filter applications
    filter(filters = {}) {
        let applications = this.getAll();

        if (filters.status && filters.status !== 'all') {
            applications = applications.filter(a => a.status === filters.status);
        }

        if (filters.policyId) {
            applications = applications.filter(a => a.policyId === filters.policyId);
        }

        if (filters.userId) {
            applications = applications.filter(a => a.userId === filters.userId);
        }

        if (filters.search) {
            const query = filters.search.toLowerCase();
            applications = applications.filter(a => {
                const policy = Policies.getById(a.policyId);
                const user = Database.findById('users', a.userId);
                return (
                    a.id.toLowerCase().includes(query) ||
                    policy?.name.toLowerCase().includes(query) ||
                    user?.name.toLowerCase().includes(query)
                );
            });
        }

        return applications;
    }
};
