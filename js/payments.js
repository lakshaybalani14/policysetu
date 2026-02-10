// Payment simulation and tracking

const Payments = {
    // Initiate payment for approved application
    initiate(applicationId) {
        const application = Applications.getById(applicationId);
        if (!application) {
            throw new Error('Application not found');
        }

        const policy = Policies.getById(application.policyId);
        const user = Database.findById('users', application.userId);

        const payment = {
            id: Utils.generateId(),
            applicationId,
            userId: application.userId,
            policyId: application.policyId,
            amount: policy.benefitAmount,
            status: 'processing',
            method: this.determinePaymentMethod(user),
            initiatedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            transactionHistory: [{
                status: 'processing',
                timestamp: new Date().toISOString(),
                note: 'Payment initiated'
            }]
        };

        Database.add('payments', payment);

        // Simulate payment processing (in real system, this would be async)
        setTimeout(() => {
            this.processPayment(payment.id);
        }, 2000);

        return payment;
    },

    // Determine payment method based on user profile
    determinePaymentMethod(user) {
        // Simulate different payment methods
        const methods = ['DBT', 'Bank Transfer', 'Post Office'];
        return methods[Math.floor(Math.random() * methods.length)];
    },

    // Process payment (simulation)
    processPayment(paymentId) {
        const payment = this.getById(paymentId);
        if (!payment) return;

        // Simulate 95% success rate
        const success = Math.random() > 0.05;
        const status = success ? 'paid' : 'failed';
        const note = success
            ? `Payment completed via ${payment.method}`
            : 'Payment failed - Bank details verification required';

        this.updateStatus(paymentId, status, note);
    },

    // Get payment by ID
    getById(id) {
        return Database.findById('payments', id);
    },

    // Get payments by user
    getByUser(userId) {
        return Database.find('payments', { userId });
    },

    // Get payments by application
    getByApplication(applicationId) {
        return Database.find('payments', { applicationId });
    },

    // Get all payments
    getAll() {
        return Database.get('payments') || [];
    },

    // Update payment status
    updateStatus(id, status, note = '') {
        const payment = this.getById(id);
        if (!payment) {
            throw new Error('Payment not found');
        }

        const transactionHistory = [
            ...payment.transactionHistory,
            {
                status,
                timestamp: new Date().toISOString(),
                note
            }
        ];

        const completedAt = status === 'paid' ? new Date().toISOString() : payment.completedAt;

        const updated = Database.update('payments', id, {
            status,
            transactionHistory,
            completedAt
        });

        // Create notification for user
        const policy = Policies.getById(payment.policyId);
        let notificationMessage = '';
        let notificationType = 'info';

        if (status === 'paid') {
            notificationMessage = `Payment of ${Utils.formatCurrency(payment.amount)} for "${policy.name}" has been credited successfully.`;
            notificationType = 'success';
        } else if (status === 'failed') {
            notificationMessage = `Payment for "${policy.name}" failed. ${note}`;
            notificationType = 'danger';
        }

        if (notificationMessage) {
            Notifications.create(payment.userId, {
                title: 'Payment Update',
                message: notificationMessage,
                type: notificationType,
                link: `/payments/${id}`
            });
        }

        return updated;
    },

    // Retry failed payment
    retry(id) {
        const payment = this.getById(id);
        if (!payment || payment.status !== 'failed') {
            throw new Error('Cannot retry payment');
        }

        this.updateStatus(id, 'processing', 'Payment retry initiated');

        setTimeout(() => {
            this.processPayment(id);
        }, 2000);
    },

    // Get payment statistics
    getStats() {
        const payments = this.getAll();

        const totalAmount = payments
            .filter(p => p.status === 'paid')
            .reduce((sum, p) => sum + p.amount, 0);

        return {
            total: payments.length,
            processing: payments.filter(p => p.status === 'processing').length,
            paid: payments.filter(p => p.status === 'paid').length,
            failed: payments.filter(p => p.status === 'failed').length,
            totalAmount,
            byMethod: this.getStatsByMethod(payments)
        };
    },

    // Get stats by payment method
    getStatsByMethod(payments) {
        const methods = {};
        payments.forEach(p => {
            if (p.status === 'paid') {
                methods[p.method] = (methods[p.method] || 0) + 1;
            }
        });
        return methods;
    },

    // Get payments with details
    getWithDetails(payments) {
        return payments.map(payment => ({
            ...payment,
            policy: Policies.getById(payment.policyId),
            application: Applications.getById(payment.applicationId),
            user: Database.findById('users', payment.userId)
        }));
    }
};
