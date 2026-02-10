import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, MapPin, Save, Loader, Camera } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { profileHelpers } from '../services/supabase';
import { useTheme } from '../context/ThemeContext';

const Profile = ({ user }) => {
    const { t } = useLanguage();
    const { isDarkMode } = useTheme();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState({
        full_name: '',
        phone_number: '',
        address: {
            street: '',
            city: '',
            state: '',
            zip: ''
        },
        avatar_url: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user?.id) return;
            try {
                const { data, error } = await profileHelpers.getProfile(user.id);
                if (error) {
                    console.error('Error fetching profile:', error);
                } else if (data) {
                    setProfile({
                        full_name: data.full_name || user.user_metadata?.name || '',
                        phone_number: data.phone_number || '',
                        address: data.address || { street: '', city: '', state: '', zip: '' },
                        avatar_url: data.avatar_url || ''
                    });
                }
            } catch (err) {
                console.error('Failed to load profile:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setProfile(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setProfile(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { error } = await profileHelpers.updateProfile(user.id, {
                full_name: profile.full_name,
                phone_number: profile.phone_number,
                address: profile.address
            });

            if (error) throw error;
            alert('Profile updated successfully!');
        } catch (err) {
            console.error('Error updating profile:', err);
            alert('Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-slate-900">
                <Loader className="animate-spin text-primary-600" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 bg-slate-50 dark:bg-slate-900">
            <div className="max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-8 text-white relative">
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full bg-white p-1 shadow-xl">
                                    {profile.avatar_url ? (
                                        <img src={profile.avatar_url} alt="Profile" className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                            <User size={48} />
                                        </div>
                                    )}
                                </div>
                                <button className="absolute bottom-0 right-0 p-2 bg-white dark:bg-slate-800 rounded-full shadow-lg text-slate-600 dark:text-slate-300 hover:text-primary-600 transition-colors">
                                    <Camera size={16} />
                                </button>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">{profile.full_name || 'User Profile'}</h1>
                                <p className="text-primary-100">{user.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Full Name */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <User size={16} /> Full Name
                                </label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={profile.full_name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            {/* Phone Number */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <Phone size={16} /> Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phone_number"
                                    value={profile.phone_number}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                        </div>

                        {/* Address Section */}
                        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                <MapPin size={20} /> Address Details
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="text-sm text-slate-600 dark:text-slate-400">Street Address</label>
                                    <input
                                        type="text"
                                        name="address.street"
                                        value={profile.address.street}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-slate-600 dark:text-slate-400">City</label>
                                    <input
                                        type="text"
                                        name="address.city"
                                        value={profile.address.city}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-slate-600 dark:text-slate-400">State</label>
                                    <input
                                        type="text"
                                        name="address.state"
                                        value={profile.address.state}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-slate-600 dark:text-slate-400">ZIP Code</label>
                                    <input
                                        type="text"
                                        name="address.zip"
                                        value={profile.address.zip}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end pt-6">
                            <button
                                type="submit"
                                disabled={saving}
                                className="btn-primary flex items-center space-x-2 disabled:opacity-70"
                            >
                                {saving ? (
                                    <Loader className="animate-spin" size={20} />
                                ) : (
                                    <Save size={20} />
                                )}
                                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default Profile;
