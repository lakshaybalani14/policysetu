import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ArrowRight, IndianRupee, X, List, Presentation, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PolicyFilters from '../components/PolicyFilters';
import { policyHelpers } from '../services/supabase';

const Policies = () => {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        searchTerm: '',
        sector: 'all',
        age: null,
        gender: [],
        income: null,
        occupation: [],
        beneficiaryCategory: [],
        location: {
            country: '',
            state: '',
            district: ''
        }
    });

    const [viewMode, setViewMode] = useState('list');
    const [currentSlide, setCurrentSlide] = useState(0);
    const [sortBy, setSortBy] = useState('featured');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Sector color mapping
    const getSectorColor = (sector) => {
        const colors = {
            'Agriculture': 'bg-green-100 text-green-700 border-green-200',
            'Education': 'bg-blue-100 text-blue-700 border-blue-200',
            'Health': 'bg-red-100 text-red-700 border-red-200',
            'Housing': 'bg-orange-100 text-orange-700 border-orange-200',
            'MSME': 'bg-purple-100 text-purple-700 border-purple-200',
            'Women & Child': 'bg-pink-100 text-pink-700 border-pink-200',
            'Social Security': 'bg-indigo-100 text-indigo-700 border-indigo-200',
            'Skill Development': 'bg-cyan-100 text-cyan-700 border-cyan-200',
            'Rural Development': 'bg-lime-100 text-lime-700 border-lime-200',
            'Energy': 'bg-yellow-100 text-yellow-700 border-yellow-200',
            'Insurance': 'bg-teal-100 text-teal-700 border-teal-200'
        };
        return colors[sector] || 'bg-slate-100 text-slate-700 border-slate-200';
    };

    // Sector background gradient for carousel
    const getSectorBackground = (sector) => {
        const backgrounds = {
            'Agriculture': 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/40 dark:to-green-800/40',
            'Education': 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/40',
            'Health': 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/40 dark:to-red-800/40',
            'Housing': 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/40 dark:to-orange-800/40',
            'MSME': 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/40 dark:to-purple-800/40',
            'Women & Child': 'bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/40 dark:to-pink-800/40',
            'Social Security': 'bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/40 dark:to-indigo-800/40',
            'Skill Development': 'bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/40 dark:to-cyan-800/40',
            'Rural Development': 'bg-gradient-to-br from-lime-50 to-lime-100 dark:from-lime-900/40 dark:to-lime-800/40',
            'Energy': 'bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/40 dark:to-yellow-800/40',
            'Insurance': 'bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/40 dark:to-teal-800/40'
        };
        return backgrounds[sector] || 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900';
    };

    // Fetch Policies
    useEffect(() => {
        const fetchPolicies = async () => {
            try {
                const { data, error } = await policyHelpers.getAll();

                if (error) {
                    console.error('Error fetching policies:', error);
                    setPolicies([]);
                } else {
                    console.log('Fetched policies from Supabase:', data);
                    // Augment with mock location data if not present
                    const augmentedData = data.map(p => {
                        let mockLocation = {
                            country: 'India',
                            state: 'All States',
                            district: 'All Districts'
                        };

                        // Mock some state-specific policies for demonstration
                        if (p.id === 1) mockLocation.state = 'Karnataka';
                        if (p.id === 2) mockLocation.state = 'Maharashtra';
                        if (p.id === 3) mockLocation.state = 'Delhi';

                        return {
                            ...p,
                            location: p.location || mockLocation
                        };
                    });
                    setPolicies(augmentedData || []);
                }
            } catch (error) {
                console.error('Failed to fetch policies:', error);
                setPolicies([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPolicies();
    }, []);

    // Update filters when search term changes
    useEffect(() => {
        setFilters(prev => ({ ...prev, searchTerm }));
    }, [searchTerm]);

    // Apply filters
    const filteredPolicies = policies.filter(policy => {
        // Search term filter
        if (filters.searchTerm && !policy.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
            !policy.description.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
            return false;
        }

        // Sector filter
        if (filters.sector && filters.sector !== 'all' && policy.sector !== filters.sector) {
            return false;
        }

        // Age filter
        if (filters.age !== null) {
            const elig = policy.eligibility || {};
            if (filters.age < (elig.ageMin || 0) || filters.age > (elig.ageMax || 100)) {
                return false;
            }
        }

        // Gender filter
        if (filters.gender && filters.gender.length > 0) {
            const elig = policy.eligibility || {};
            const policyGenders = elig.gender || [];
            if (!filters.gender.some(g => policyGenders.includes(g))) {
                return false;
            }
        }

        // Income filter
        if (filters.income !== null) {
            const elig = policy.eligibility || {};
            if (elig.incomeMax && filters.income > elig.incomeMax) {
                return false;
            }
        }

        // Occupation filter
        if (filters.occupation && filters.occupation.length > 0) {
            const elig = policy.eligibility || {};
            const policyOccupations = elig.occupation || [];
            if (!filters.occupation.some(o => policyOccupations.includes(o) || policyOccupations.includes('Any'))) {
                return false;
            }
        }

        // Beneficiary category filter
        if (filters.beneficiaryCategory && filters.beneficiaryCategory.length > 0) {
            const elig = policy.eligibility || {};
            const policyCategories = elig.beneficiaryCategory || [];
            if (!filters.beneficiaryCategory.some(c => policyCategories.includes(c))) {
                return false;
            }
        }

        // Location filter
        if (filters.location) {
            // Country
            if (filters.location.country && filters.location.country !== 'India') {
                // Currently only India is supported, so if selected country is not India, show nothing (or handle appropriately)
                // For now assuming all policies are Indian
            }

            // State
            if (filters.location.state) {
                const policyState = policy.location?.state || 'All States';
                if (policyState !== 'All States' && policyState !== filters.location.state) {
                    return false;
                }
            }

            // District
            if (filters.location.district) {
                const policyDistrict = policy.location?.district || 'All Districts';
                if (policyDistrict !== 'All Districts' && policyDistrict !== filters.location.district) {
                    return false;
                }
            }
        }

        return true;
    });

    // Sort policies
    const sortedPolicies = [...filteredPolicies].sort((a, b) => {
        if (sortBy === 'featured') {
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            return 0;
        } else if (sortBy === 'benefit') {
            return b.benefitAmount - a.benefitAmount;
        } else if (sortBy === 'newest') {
            return b.id - a.id;
        }
        return 0;
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-2xl text-primary-600">Loading policies...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-24 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                        Government Policies & Schemes
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-300">
                        Discover and apply for government schemes tailored to your needs
                    </p>
                </motion.div>

                {/* Search Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8"
                >
                    <div className="relative max-w-2xl mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search policies by name, sector, or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 focus:border-primary-500 focus:outline-none transition-colors dark:bg-slate-800 dark:text-white"
                        />
                    </div>
                </motion.div>

                {/* Filter Button (Mobile) */}
                <div className="flex justify-center mb-6 lg:hidden">
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        <SlidersHorizontal size={20} />
                        <span>Filters</span>
                    </button>
                </div>

                {/* Main Content with Sidebar */}
                <div className="flex gap-6">
                    {/* Filter Sidebar - Desktop */}
                    <div className="hidden lg:block">
                        <PolicyFilters
                            filters={filters}
                            setFilters={setFilters}
                            isOpen={true}
                            onClose={() => { }}
                            instantUpdate={true}
                        />
                    </div>

                    {/* Filter Sidebar - Mobile */}
                    <PolicyFilters
                        filters={filters}
                        setFilters={setFilters}
                        isOpen={isFilterOpen}
                        onClose={() => setIsFilterOpen(false)}
                        instantUpdate={false}
                    />

                    {/* Policies Content */}
                    <div className="flex-1">
                        {/* Results Count */}
                        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                            <p className="text-slate-600 dark:text-slate-400">
                                Showing <span className="font-semibold text-primary-600">{sortedPolicies.length}</span> policies
                            </p>

                            <div className="flex items-center gap-4">
                                {/* View Mode Toggle */}
                                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded transition-colors ${viewMode === 'list'
                                            ? 'bg-white dark:bg-slate-700 text-primary-600 shadow-sm'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                            }`}
                                        title="List View"
                                    >
                                        <List size={20} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('carousel')}
                                        className={`p-2 rounded transition-colors ${viewMode === 'carousel'
                                            ? 'bg-white dark:bg-slate-700 text-primary-600 shadow-sm'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                            }`}
                                        title="Carousel View"
                                    >
                                        <Presentation size={20} />
                                    </button>
                                </div>

                                {/* Sort Options */}
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-4 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white focus:border-primary-500 focus:outline-none"
                                >
                                    <option value="featured">Featured First</option>
                                    <option value="benefit">Highest Benefit</option>
                                    <option value="newest">Newest First</option>
                                </select>
                            </div>
                        </div>

                        {/* Policies Display */}
                        {sortedPolicies.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-xl text-slate-600 dark:text-slate-400">No policies found</p>
                                <p className="text-slate-500 dark:text-slate-500 mt-2">Try adjusting your search or filters</p>
                            </div>
                        ) : viewMode === 'list' ? (
                            /* List View - Horizontal Cards */
                            <div className="space-y-4">
                                {sortedPolicies.map((policy, index) => (
                                    <motion.div
                                        key={policy.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-xl transition-all p-6 border-l-4 border-primary-500"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-start gap-3 mb-3">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                                                                {policy.name}
                                                            </h3>
                                                            {policy.featured && (
                                                                <span className="bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded-full">
                                                                    Featured
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2">
                                                            {policy.description}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-3">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSectorColor(policy.sector)}`}>
                                                        {policy.sector}
                                                    </span>
                                                    <div className="flex items-center text-primary-600 font-bold">
                                                        <IndianRupee size={18} />
                                                        <span className="text-lg">{policy.benefitAmount?.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <Link
                                                to={`/policy/${policy.id}`}
                                                className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium whitespace-nowrap"
                                            >
                                                View Details
                                                <ArrowRight size={18} />
                                            </Link>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            /* Carousel View */
                            <div className="relative">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentSlide}
                                        initial={{ opacity: 0, x: 100 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        transition={{ duration: 0.3 }}
                                        className={`rounded-2xl shadow-2xl p-8 md:p-12 max-w-4xl mx-auto ${getSectorBackground(sortedPolicies[currentSlide].sector)}`}
                                    >
                                        {sortedPolicies[currentSlide] && (
                                            <>
                                                <div className="flex items-start justify-between mb-6">
                                                    <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 flex-1">
                                                        {sortedPolicies[currentSlide].name}
                                                    </h2>
                                                    {sortedPolicies[currentSlide].featured && (
                                                        <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm">
                                                            Featured
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-3 mb-6">
                                                    <span className={`px-4 py-2 rounded-full font-medium border-2 ${getSectorColor(sortedPolicies[currentSlide].sector)}`}>
                                                        {sortedPolicies[currentSlide].sector}
                                                    </span>
                                                    <div className="flex items-center text-primary-600 font-bold text-2xl">
                                                        <IndianRupee size={24} />
                                                        <span>{sortedPolicies[currentSlide].benefitAmount?.toLocaleString()}</span>
                                                    </div>
                                                </div>

                                                <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                                                    {sortedPolicies[currentSlide].detailedDescription || sortedPolicies[currentSlide].description}
                                                </p>

                                                <div className="flex items-center justify-between">
                                                    <Link
                                                        to={`/policy/${sortedPolicies[currentSlide].id}`}
                                                        className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                                                    >
                                                        View Full Details
                                                        <ArrowRight size={20} />
                                                    </Link>

                                                    <div className="text-slate-500">
                                                        {currentSlide + 1} / {sortedPolicies.length}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </motion.div>
                                </AnimatePresence>

                                {/* Carousel Navigation */}
                                <button
                                    onClick={() => setCurrentSlide((prev) => (prev === 0 ? sortedPolicies.length - 1 : prev - 1))}
                                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white dark:bg-slate-700 rounded-full p-3 shadow-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                                    disabled={sortedPolicies.length <= 1}
                                >
                                    <ChevronLeft size={24} className="text-slate-700 dark:text-slate-200" />
                                </button>

                                <button
                                    onClick={() => setCurrentSlide((prev) => (prev === sortedPolicies.length - 1 ? 0 : prev + 1))}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white dark:bg-slate-700 rounded-full p-3 shadow-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                                    disabled={sortedPolicies.length <= 1}
                                >
                                    <ChevronRight size={24} className="text-slate-700 dark:text-slate-200" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Policies;
