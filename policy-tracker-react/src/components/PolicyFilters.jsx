import { motion, AnimatePresence } from 'framer-motion';
import { X, SlidersHorizontal, Check, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { locationData } from '../data/locationData';

const PolicyFilters = ({ filters, setFilters, onClearAll, isOpen, onClose, instantUpdate = false }) => {
    const [localFilters, setLocalFilters] = useState(filters);

    // Sync local filters with prop filters when they change externally
    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    const sectors = [
        'all', 'Agriculture', 'Education', 'Health', 'Housing', 'MSME',
        'Women & Child', 'Social Security', 'Skill Development', 'Rural Development',
        'Energy', 'Insurance'
    ];

    const occupations = [
        'Farmer', 'Student', 'Business Owner', 'Self Employed', 'Entrepreneur',
        'Agricultural Worker', 'Street Vendor', 'Unemployed', 'Job Seeker', 'Any'
    ];

    const beneficiaryCategories = [
        'Farmers', 'Small & Marginal Farmers', 'Students', 'SC/ST', 'OBC',
        'Economically Weaker Section', 'BPL', 'Women', 'Girl Child', 'MSMEs',
        'Small Business Owners', 'Women Entrepreneurs', 'Youth', 'Unemployed',
        'Rural Population', 'Urban Poor', 'Street Vendors', 'All Citizens',
        'Pregnant Women', 'Lactating Mothers', 'Startups', 'Innovators'
    ];

    const genderOptions = [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'other', label: 'Other' },
    ];

    const handleApplyFilters = () => {
        setFilters(localFilters);
        onClose();
    };

    const handleClearAll = () => {
        const clearedFilters = {
            searchTerm: '',
            sector: 'all',
            age: null,
            gender: [],
            income: null,
            occupation: [],
            beneficiaryCategory: [],
        };
        setLocalFilters(clearedFilters);
        setFilters(clearedFilters);
    };

    const toggleArrayFilter = (filterKey, value) => {
        setLocalFilters(prev => {
            const currentArray = prev[filterKey] || [];
            const newArray = currentArray.includes(value)
                ? currentArray.filter(item => item !== value)
                : [...currentArray, value];
            const newFilters = { ...prev, [filterKey]: newArray };

            // Immediate update for desktop
            if (instantUpdate) {
                setFilters(newFilters);
            }

            return newFilters;
        });
    };

    const updateFilter = (key, value) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        if (instantUpdate) {
            setFilters(newFilters);
        }
    };

    const getActiveFilterCount = () => {
        let count = 0;
        if (localFilters.sector && localFilters.sector !== 'all') count++;
        if (localFilters.age !== null) count++;
        if (localFilters.gender && localFilters.gender.length > 0) count++;
        if (localFilters.income !== null) count++;
        if (localFilters.occupation && localFilters.occupation.length > 0) count++;
        if (localFilters.beneficiaryCategory && localFilters.beneficiaryCategory.length > 0) count++;
        return count;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
                    />

                    {/* Filter Sidebar */}
                    <motion.div
                        initial={{ x: -320 }}
                        animate={{ x: 0 }}
                        exit={{ x: -320 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed lg:sticky top-0 lg:top-24 left-0 h-screen lg:max-h-[calc(100vh-6rem)] w-80 bg-white/95 backdrop-blur-lg border-r border-slate-200 dark:border-slate-700 dark:bg-slate-900/95 shadow-2xl lg:shadow-none z-50 overflow-y-auto"
                    >
                        <div className="p-6 space-y-6">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <SlidersHorizontal className="text-primary-600" size={24} />
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Filters</h2>
                                    {getActiveFilterCount() > 0 && (
                                        <span className="bg-primary-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                                            {getActiveFilterCount()}
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={onClose}
                                    className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <X size={20} className="dark:text-slate-400" />
                                </button>
                            </div>

                            {/* Clear All Button */}
                            {getActiveFilterCount() > 0 && (
                                <button
                                    onClick={handleClearAll}
                                    className="w-full text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold py-2 border border-primary-200 dark:border-primary-800 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                                >
                                    Clear All Filters
                                </button>
                            )}
                            {/* Location Filter */}
                            <div className="space-y-3">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Location
                                </label>
                                <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                    {/* Country */}
                                    <div>
                                        <label className="text-xs text-slate-500 mb-1 block">Country</label>
                                        <select
                                            value={localFilters.location?.country || 'India'}
                                            onChange={(e) => updateFilter('location', { ...localFilters.location, country: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm focus:border-primary-500 focus:outline-none dark:bg-slate-800 dark:text-white"
                                        >
                                            <option value="India">India</option>
                                        </select>
                                    </div>

                                    {/* State */}
                                    <div>
                                        <label className="text-xs text-slate-500 mb-1 block">State / UT</label>
                                        <select
                                            value={localFilters.location?.state || ''}
                                            onChange={(e) => updateFilter('location', { ...localFilters.location, state: e.target.value, district: '' })}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm focus:border-primary-500 focus:outline-none dark:bg-slate-800 dark:text-white"
                                        >
                                            <option value="">All States</option>
                                            {Object.keys(locationData).sort().map(state => (
                                                <option key={state} value={state}>{state}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* District */}
                                    <AnimatePresence>
                                        {localFilters.location?.state && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">District</label>
                                                <select
                                                    value={localFilters.location?.district || ''}
                                                    onChange={(e) => updateFilter('location', { ...localFilters.location, district: e.target.value })}
                                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm focus:border-primary-500 focus:outline-none dark:bg-slate-800 dark:text-white"
                                                >
                                                    <option value="">All Districts</option>
                                                    {locationData[localFilters.location.state]?.sort().map(district => (
                                                        <option key={district} value={district}>{district}</option>
                                                    ))}
                                                </select>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Sector Filter */}
                            <div className="space-y-3">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Sector
                                </label>
                                <select
                                    value={localFilters.sector || 'all'}
                                    onChange={(e) => updateFilter('sector', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all bg-white dark:bg-slate-800 dark:text-white"
                                >
                                    {sectors.map((sector) => (
                                        <option key={sector} value={sector}>
                                            {sector === 'all' ? 'All Sectors' : sector}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Age Filter */}
                            <div className="space-y-3">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Age: {localFilters.age !== null ? `${localFilters.age} years` : 'Any'}
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={localFilters.age || 0}
                                    onChange={(e) => updateFilter('age', parseInt(e.target.value))}
                                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                                />
                                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                                    <span>0</span>
                                    <span>100</span>
                                </div>
                                {localFilters.age !== null && (
                                    <button
                                        onClick={() => updateFilter('age', null)}
                                        className="text-xs text-primary-600 hover:text-primary-700"
                                    >
                                        Clear age filter
                                    </button>
                                )}
                            </div>

                            {/* Gender Filter */}
                            <div className="space-y-3">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Gender
                                </label>
                                <div className="space-y-2">
                                    {genderOptions.map((option) => (
                                        <label
                                            key={option.value}
                                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                                        >
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={localFilters.gender?.includes(option.value) || false}
                                                    onChange={() => toggleArrayFilter('gender', option.value)}
                                                    className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-2 focus:ring-primary-200 cursor-pointer"
                                                />
                                            </div>

                                            <span className="text-sm text-slate-700 dark:text-slate-300">{option.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Income Filter */}
                            <div className="space-y-3">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Annual Income: {localFilters.income !== null ? `₹${(localFilters.income / 100000).toFixed(1)}L` : 'Any'}
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="2000000"
                                    step="50000"
                                    value={localFilters.income || 0}
                                    onChange={(e) => updateFilter('income', parseInt(e.target.value))}
                                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                                />
                                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                                    <span>₹0</span>
                                    <span>₹20L+</span>
                                </div>
                                {localFilters.income !== null && (
                                    <button
                                        onClick={() => updateFilter('income', null)}
                                        className="text-xs text-primary-600 hover:text-primary-700"
                                    >
                                        Clear income filter
                                    </button>
                                )}
                            </div>

                            {/* Occupation Filter */}
                            <div className="space-y-3">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Occupation
                                    {localFilters.occupation?.length > 0 && (
                                        <span className="ml-2 text-xs text-primary-600">
                                            ({localFilters.occupation.length} selected)
                                        </span>
                                    )}
                                </label>
                                <div className="max-h-48 overflow-y-auto space-y-1 border border-slate-200 dark:border-slate-700 rounded-lg p-2 dark:bg-slate-800/50">
                                    {occupations.map((occupation) => (
                                        <label
                                            key={occupation}
                                            className="flex items-center space-x-2 p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={localFilters.occupation?.includes(occupation) || false}
                                                onChange={() => toggleArrayFilter('occupation', occupation)}
                                                className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-2 focus:ring-primary-200 cursor-pointer dark:bg-slate-700"
                                            />
                                            <span className="text-sm text-slate-700 dark:text-slate-300">
                                                {occupation}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Beneficiary Category Filter */}
                            <div className="space-y-3">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Beneficiary Category
                                    {localFilters.beneficiaryCategory?.length > 0 && (
                                        <span className="ml-2 text-xs text-primary-600">
                                            ({localFilters.beneficiaryCategory.length} selected)
                                        </span>
                                    )}
                                </label>
                                <div className="max-h-64 overflow-y-auto space-y-1 border border-slate-200 dark:border-slate-700 rounded-lg p-2 dark:bg-slate-800/50">
                                    {beneficiaryCategories.map((category) => (
                                        <label
                                            key={category}
                                            className="flex items-center space-x-2 p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={localFilters.beneficiaryCategory?.includes(category) || false}
                                                onChange={() => toggleArrayFilter('beneficiaryCategory', category)}
                                                className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-2 focus:ring-primary-200 cursor-pointer dark:bg-slate-700"
                                            />
                                            <span className="text-sm text-slate-700 dark:text-slate-300">
                                                {category}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Apply Button (Mobile) */}
                            <button
                                onClick={handleApplyFilters}
                                className="lg:hidden w-full btn-primary flex items-center justify-center space-x-2"
                            >
                                <Check size={18} />
                                <span>Apply Filters</span>
                            </button>
                        </div>
                    </motion.div>
                </>
            )
            }
        </AnimatePresence >
    );
};

export default PolicyFilters;
