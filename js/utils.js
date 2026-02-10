// Utility functions for the application

const Utils = {
    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Format date
    formatDate(date) {
        if (!date) return '-';
        const d = new Date(date);
        return d.toLocaleDateString('en-IN', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    },

    // Format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Show toast notification
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `alert alert-${type}`;
        toast.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            z-index: 10000;
            min-width: 300px;
            animation: slideDown 0.3s ease;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // Validate email
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // Validate phone
    isValidPhone(phone) {
        const re = /^[6-9]\d{9}$/;
        return re.test(phone);
    },

    // Validate Aadhaar
    isValidAadhaar(aadhaar) {
        const re = /^\d{12}$/;
        return re.test(aadhaar);
    },

    // Validate PAN
    isValidPAN(pan) {
        const re = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        return re.test(pan);
    },

    // Calculate age from date of birth
    calculateAge(dob) {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    },

    // Truncate text
    truncate(text, length = 100) {
        if (!text) return '';
        return text.length > length ? text.substring(0, length) + '...' : text;
    },

    // Sanitize HTML
    sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    },

    // Get status badge class
    getStatusBadge(status) {
        const badges = {
            'pending': 'badge-warning',
            'under_review': 'badge-info',
            'approved': 'badge-success',
            'rejected': 'badge-danger',
            'completed': 'badge-success',
            'active': 'badge-success',
            'inactive': 'badge-danger',
            'processing': 'badge-info',
            'paid': 'badge-success',
            'failed': 'badge-danger'
        };
        return badges[status] || 'badge-primary';
    },

    // Get status label
    getStatusLabel(status) {
        const labels = {
            'pending': 'Pending',
            'under_review': 'Under Review',
            'approved': 'Approved',
            'rejected': 'Rejected',
            'completed': 'Completed',
            'active': 'Active',
            'inactive': 'Inactive',
            'processing': 'Processing',
            'paid': 'Paid',
            'failed': 'Failed'
        };
        return labels[status] || status;
    },

    // Download file
    downloadFile(content, filename, type = 'text/plain') {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    // Copy to clipboard
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('Copied to clipboard', 'success');
        } catch (err) {
            this.showToast('Failed to copy', 'danger');
        }
    }
};
