import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zlbybzbgxsafvrmuunbu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsYnliemJneHNhZnZybXV1bmJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NjM2NTcsImV4cCI6MjA4NjEzOTY1N30.I5zmvGi2DzyI2XyWR_a5cw7MdmLyGQsB6C_Dxh14hbs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Transformation utilities - Convert snake_case to camelCase
const toCamelCase = (str) => {
    return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
};

const transformKeys = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(transformKeys);

    return Object.keys(obj).reduce((acc, key) => {
        const camelKey = toCamelCase(key);
        acc[camelKey] = transformKeys(obj[key]);
        return acc;
    }, {});
};

// Specific transformers for each entity type
const transformApplicationData = (app) => {
    if (!app) return null;
    return transformKeys(app);
};

const transformPolicyData = (policy) => {
    if (!policy) return null;
    return transformKeys(policy);
};

const transformPaymentData = (payment) => {
    if (!payment) return null;
    return transformKeys(payment);
};

// Auth helpers
export const authHelpers = {
    signUp: async (email, password, userData) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: userData
            }
        });
        return { data, error };
    },

    signIn: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        return { data, error };
    },

    signOut: async () => {
        const { error } = await supabase.auth.signOut();
        return { error };
    },

    getCurrentUser: async () => {
        const { data: { user }, error } = await supabase.auth.getUser();
        return { user, error };
    },

    getSession: async () => {
        const { data: { session }, error } = await supabase.auth.getSession();
        return { session, error };
    }
};

// Policy helpers
export const policyHelpers = {
    getAll: async () => {
        const { data, error } = await supabase
            .from('policies')
            .select('*')
            .order('created_at', { ascending: false });
        return { data: data?.map(transformPolicyData) || [], error };
    },

    getById: async (id) => {
        const { data, error } = await supabase
            .from('policies')
            .select('*')
            .eq('id', id)
            .single();
        return { data: transformPolicyData(data), error };
    },

    search: async (searchTerm) => {
        const { data, error } = await supabase
            .from('policies')
            .select('*')
            .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
            .order('created_at', { ascending: false });
        return { data, error };
    }
};

// Application helpers
export const applicationHelpers = {
    create: async (applicationData) => {
        const { data: { user } } = await supabase.auth.getUser();

        const { data, error } = await supabase
            .from('applications')
            .insert([{
                ...applicationData,
                user_id: user.id,
                status: 'submitted',
                submitted_at: new Date().toISOString(),
                last_updated: new Date().toISOString()
            }])
            .select()
            .single();
        return { data: transformApplicationData(data), error };
    },

    getUserApplications: async () => {
        const { data: { user } } = await supabase.auth.getUser();

        const { data, error } = await supabase
            .from('applications')
            .select('*, policies(*)')
            .eq('user_id', user.id)
            .order('submitted_at', { ascending: false });
        return { data: data?.map(transformApplicationData) || [], error };
    },

    updateStatus: async (id, status, remarks) => {
        const { data, error } = await supabase
            .from('applications')
            .update({
                status,
                remarks,
                last_updated: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();
        return { data, error };
    },

    getAll: async () => {
        const { data, error } = await supabase
            .from('applications')
            .select('*')
            .order('submitted_at', { ascending: false });
        return { data: data?.map(transformApplicationData) || [], error };
    }
};

// Payment helpers
export const paymentHelpers = {
    getAll: async () => {
        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .order('created_at', { ascending: false });
        return { data: data?.map(transformPaymentData) || [], error };
    },

    getUserPayments: async () => {
        const { data: { user } } = await supabase.auth.getUser();

        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        return { data: data?.map(transformPaymentData) || [], error };
    }
};

// Stats helpers
export const statsHelpers = {
    getDashboardStats: async () => {
        const { data: { user } } = await supabase.auth.getUser();

        // Get user applications
        const { data: applications } = await supabase
            .from('applications')
            .select('*')
            .eq('user_id', user.id);

        // Get user payments
        const { data: payments } = await supabase
            .from('payments')
            .select('*')
            .eq('user_id', user.id);

        const stats = {
            totalApplications: applications?.length || 0,
            pending: applications?.filter(a => ['submitted', 'under-review'].includes(a.status)).length || 0,
            approved: applications?.filter(a => a.status === 'approved').length || 0,
            rejected: applications?.filter(a => a.status === 'rejected').length || 0,
            totalDisbursed: payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
        };

        return { data: stats, error: null };
    }
};

// Admin helpers
export const adminHelpers = {
    // Check if user is admin
    isAdmin: async (userId) => {
        const { data, error } = await supabase
            .from('admins')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .single();
        return { isAdmin: !!data, data, error };
    },

    // Check admin by email
    isAdminByEmail: async (email) => {
        const { data, error } = await supabase
            .from('admins')
            .select('*')
            .eq('email', email)
            .eq('is_active', true)
            .single();
        return { isAdmin: !!data, data, error };
    },

    // Get all admins (admin only)
    getAll: async () => {
        return await supabase
            .from('admins')
            .select('*')
            .order('created_at', { ascending: false });
    },

    // Create new admin (admin only)
    create: async (userId, email, fullName) => {
        return await supabase
            .from('admins')
            .insert([{ user_id: userId, email, full_name: fullName }]);
    },

    // Deactivate admin (admin only)
    deactivate: async (adminId) => {
        return await supabase
            .from('admins')
            .update({ is_active: false })
            .eq('id', adminId);
    },

    updateLastLogin: async (userId) => {
        return await supabase
            .from('admins')
            .update({ last_login: new Date().toISOString() })
            .eq('user_id', userId);
    },

    // Get all applications with details (admin only)
    getAllApplications: async () => {
        // 1. Fetch applications (removed profiles join to avoid 400 error)
        const { data, error } = await supabase
            .from('applications')
            .select(`
                *,
                policies (name)
            `)
            .order('submitted_at', { ascending: false });

        if (error) return { data: [], error };

        // 2. Fetch profiles manually
        const userIds = [...new Set(data.map(app => app.user_id))];
        let profilesMap = {};

        if (userIds.length > 0) {
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, full_name')
                .in('id', userIds);

            if (profiles) {
                profilesMap = profiles.reduce((acc, profile) => {
                    acc[profile.id] = profile;
                    return acc;
                }, {});
            }
        }

        // 3. Merge data
        const formattedData = data.map(app => ({
            ...transformApplicationData(app),
            policyName: app.policies?.name,
            applicantName: profilesMap[app.user_id]?.full_name || 'Unknown',
            // Keep original raw objects just in case
            policies: app.policies,
            profiles: profilesMap[app.user_id]
        }));

        return { data: formattedData || [], error };
    },

    // Update application status
    updateApplicationStatus: async (id, status) => {
        const { data, error } = await supabase
            .from('applications')
            .update({
                status,
                last_updated: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();
        return { data, error };
    },

    // Get application logs
    getApplicationLogs: async (applicationId) => {
        const { data, error } = await supabase
            .from('application_logs')
            .select('*')
            .eq('application_id', applicationId)
            .order('created_at', { ascending: false });
        return { data, error };
    }
};

// Profile helpers
export const profileHelpers = {
    getProfile: async (userId) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        return { data, error };
    },

    updateProfile: async (userId, updates) => {
        const { data, error } = await supabase
            .from('profiles')
            .update({
                ...updates,
                updated_at: new Date().toISOString(),
            })
            .eq('id', userId)
            .select()
            .single();
        return { data, error };
    }
};

// Storage helpers
export const storageHelpers = {
    uploadFile: async (bucket, path, file) => {
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(path, file, {
                cacheControl: '3600',
                upsert: true
            });
        return { data, error };
    },

    getPublicUrl: (bucket, path) => {
        const { data } = supabase.storage
            .from(bucket)
            .getPublicUrl(path);
        return data.publicUrl;
    },

    // For private buckets
    createSignedUrl: async (bucket, path, expiresIn = 600) => {
        const { data, error } = await supabase.storage
            .from(bucket)
            .createSignedUrl(path, expiresIn);
        return { data, error };
    }
};

// Document helpers
export const documentHelpers = {
    uploadAndSave: async (file, userId, docType, applicationId = null) => {
        // 1. Upload to Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}_${docType}.${fileExt}`;
        const bucket = 'application-documents';

        const { data: uploadData, error: uploadError } = await storageHelpers.uploadFile(bucket, fileName, file);

        if (uploadError) return { error: uploadError };

        // 2. Save Metadata to DB
        const { data: docData, error: docError } = await supabase
            .from('documents')
            .insert([{
                user_id: userId,
                application_id: applicationId,
                document_type: docType,
                file_path: fileName,
                storage_bucket: bucket,
                file_name: file.name,
                file_size: file.size,
                content_type: file.type
            }])
            .select()
            .single();

        return { data: docData, error: docError };
    },

    getUserDocuments: async (userId) => {
        const { data, error } = await supabase
            .from('documents')
            .select('*')
            .eq('user_id', userId)
            .order('uploaded_at', { ascending: false });
        return { data, error };
    }
};

export const notificationHelpers = {
    getUserNotifications: async (userId) => {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(20);
        return { data, error };
    },
    markAsRead: async (notificationId) => {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId);
        return { error };
    },
    markAllAsRead: async (userId) => {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', userId)
            .eq('is_read', false);
        return { error };
    }
};

// Support Ticket helpers
export const ticketHelpers = {
    createTicket: async (ticketData) => {
        const { data: { user } } = await supabase.auth.getUser();

        const { data, error } = await supabase
            .from('tickets')
            .insert([{
                ...ticketData,
                user_id: user.id
            }])
            .select()
            .single();
        return { data, error };
    },

    getUserTickets: async () => {
        const { data: { user } } = await supabase.auth.getUser();

        const { data, error } = await supabase
            .from('tickets')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        // Transform snake_case to camelCase potentially, but let's stick to consistent handling
        // For now, returning raw is safer until we update all transformations
        return { data, error };
    },

    getTicketDetails: async (ticketId) => {
        const { data: ticket, error: ticketError } = await supabase
            .from('tickets')
            .select('*, ticket_replies(*)')
            .eq('id', ticketId)
            .single();

        if (ticketError) return { error: ticketError };

        // Sort replies
        if (ticket.ticket_replies) {
            ticket.ticket_replies.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        }

        return { data: ticket, error: null };
    },

    replyToTicket: async (ticketId, message) => {
        const { data: { user } } = await supabase.auth.getUser();

        // Check if admin (optional, for the is_admin_reply flag)
        // For simplicity, we'll just check metadata or assume client-side knows, 
        // but RLS protects the actual insert.
        // We'll trust appropriate policies.
        const isAdmin = user.user_metadata?.role === 'admin';

        const { data, error } = await supabase
            .from('ticket_replies')
            .insert([{
                ticket_id: ticketId,
                user_id: user.id,
                message,
                is_admin_reply: isAdmin
            }])
            .select()
            .single();

        // Optionally update ticket "updated_at"
        if (!error) {
            await supabase.from('tickets').update({ updated_at: new Date() }).eq('id', ticketId);
        }

        return { data, error };
    },

    // Admin: Get all tickets
    getAllTickets: async () => {
        const { data, error } = await supabase
            .from('tickets')
            .select('*, profiles(full_name, email)') // Join to see who sent it
            .order('created_at', { ascending: false });
        return { data, error };
    },

    // Admin: Update status
    updateTicketStatus: async (ticketId, status) => {
        const { data, error } = await supabase
            .from('tickets')
            .update({ status })
            .eq('id', ticketId)
            .select()
            .single();
        return { data, error };
    }
};

export default supabase;
