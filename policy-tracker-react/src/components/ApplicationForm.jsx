import { motion } from 'framer-motion';
import { useState } from 'react';
import { Upload, X, FileText, Check, AlertCircle, Loader } from 'lucide-react';
import { applicationHelpers, documentHelpers, authHelpers } from '../services/supabase';

const ApplicationForm = ({ policy, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        occupation: '',
        annualIncome: '',
        category: '',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        additionalInfo: '',
    });

    const [documents, setDocuments] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        const newDocuments = files.map(file => ({
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            type: file.type,
            file: file,
            uploadedAt: new Date().toISOString(),
        }));
        setDocuments(prev => [...prev, ...newDocuments]);
    };

    const removeDocument = (id) => {
        setDocuments(prev => prev.filter(doc => doc.id !== id));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Phone must be 10 digits';
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.state.trim()) newErrors.state = 'State is required';
        if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
        if (!formData.occupation.trim()) newErrors.occupation = 'Occupation is required';
        if (!formData.annualIncome.trim()) newErrors.annualIncome = 'Annual income is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.bankName.trim()) newErrors.bankName = 'Bank name is required';
        if (!formData.accountNumber.trim()) newErrors.accountNumber = 'Account number is required';
        if (!formData.ifscCode.trim()) newErrors.ifscCode = 'IFSC code is required';

        if (documents.length === 0) {
            newErrors.documents = 'Please upload at least one document';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // 1. Get Current User (needed for file uploads)
            const { user, error: authError } = await authHelpers.getCurrentUser();
            if (authError || !user) throw new Error("User not authenticated");

            // 2. Prepare Application Data (excluding documents, we'll upload them separately)
            // Convert formData from camelCase to snake_case for database
            const dbFormData = {
                full_name: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                date_of_birth: formData.dateOfBirth,
                gender: formData.gender,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
                occupation: formData.occupation,
                annual_income: formData.annualIncome,
                category: formData.category,
                bank_name: formData.bankName,
                account_number: formData.accountNumber,
                ifsc_code: formData.ifscCode,
                additional_info: formData.additionalInfo
            };

            const applicationData = {
                policy_id: policy.id,
                policy_name: policy.name,
                ...dbFormData,
                status: 'submitted',
                submitted_at: new Date().toISOString(),
                last_updated: new Date().toISOString(),
            };

            // 3. Create Application Record
            const { data: appResponse, error: appError } = await applicationHelpers.create(applicationData);
            if (appError) throw appError;

            // 4. Upload Documents
            if (documents.length > 0) {
                const uploadPromises = documents.map(doc => {
                    // Upload each file and link to the new application ID
                    // Using 'other' as default type for now, or map doc.type if you add a selector
                    return documentHelpers.uploadAndSave(doc.file, user.id, 'other', appResponse.id);
                });

                await Promise.all(uploadPromises);
            }

            // Success
            onSubmit(appResponse);
            onClose();
        } catch (error) {
            console.error("Application submission failed:", error);
            setErrors(prev => ({ ...prev, api: "Submission failed. Please try again. " + error.message }));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
            >
                {/* Header - Fixed */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-500 text-white p-8 rounded-t-3xl flex-shrink-0">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">Apply for {policy.name}</h2>
                            <p className="text-white/90">Fill out the form below to submit your application</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Form - Scrollable */}
                <div className="overflow-y-auto flex-1">
                    <form onSubmit={handleSubmit} className="p-8">
                        {/* Personal Information */}
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Personal Information</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 rounded-lg border ${errors.fullName ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} dark:bg-slate-800 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all`}
                                        placeholder="Enter your full name"
                                    />
                                    {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} dark:bg-slate-800 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all`}
                                        placeholder="your.email@example.com"
                                    />
                                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Phone <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 rounded-lg border ${errors.phone ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} dark:bg-slate-800 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all`}
                                        placeholder="10-digit mobile number"
                                        maxLength="10"
                                    />
                                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Date of Birth <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 rounded-lg border ${errors.dateOfBirth ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} dark:bg-slate-800 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all`}
                                    />
                                    {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Gender <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 rounded-lg border ${errors.gender ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} dark:bg-slate-800 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all`}
                                    >
                                        <option value="">Select gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                    {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Occupation <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="occupation"
                                        value={formData.occupation}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 rounded-lg border ${errors.occupation ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} dark:bg-slate-800 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all`}
                                        placeholder="Your occupation"
                                    />
                                    {errors.occupation && <p className="text-red-500 text-sm mt-1">{errors.occupation}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Address Information */}
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Address Information</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Address <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className={`w-full px-4 py-3 rounded-lg border ${errors.address ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} dark:bg-slate-800 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all`}
                                        placeholder="Enter your complete address"
                                    />
                                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        City <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 rounded-lg border ${errors.city ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} dark:bg-slate-800 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all`}
                                        placeholder="City"
                                    />
                                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        State <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 rounded-lg border ${errors.state ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} dark:bg-slate-800 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all`}
                                        placeholder="State"
                                    />
                                    {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Pincode <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="pincode"
                                        value={formData.pincode}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 rounded-lg border ${errors.pincode ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} dark:bg-slate-800 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all`}
                                        placeholder="6-digit pincode"
                                        maxLength="6"
                                    />
                                    {errors.pincode && <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Financial Information */}
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Financial Information</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Annual Income <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="annualIncome"
                                        value={formData.annualIncome}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 rounded-lg border ${errors.annualIncome ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} dark:bg-slate-800 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all`}
                                        placeholder="Annual income in rupees"
                                    />
                                    {errors.annualIncome && <p className="text-red-500 text-sm mt-1">{errors.annualIncome}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Category <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 rounded-lg border ${errors.category ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} dark:bg-slate-800 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all`}
                                    >
                                        <option value="">Select category</option>
                                        <option value="General">General</option>
                                        <option value="OBC">OBC</option>
                                        <option value="SC">SC</option>
                                        <option value="ST">ST</option>
                                        <option value="EWS">EWS</option>
                                    </select>
                                    {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Bank Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="bankName"
                                        value={formData.bankName}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 rounded-lg border ${errors.bankName ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} dark:bg-slate-800 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all`}
                                        placeholder="Bank name"
                                    />
                                    {errors.bankName && <p className="text-red-500 text-sm mt-1">{errors.bankName}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Account Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="accountNumber"
                                        value={formData.accountNumber}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 rounded-lg border ${errors.accountNumber ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} dark:bg-slate-800 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all`}
                                        placeholder="Bank account number"
                                    />
                                    {errors.accountNumber && <p className="text-red-500 text-sm mt-1">{errors.accountNumber}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        IFSC Code <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="ifscCode"
                                        value={formData.ifscCode}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 rounded-lg border ${errors.ifscCode ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} dark:bg-slate-800 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all`}
                                        placeholder="IFSC code"
                                        maxLength="11"
                                    />
                                    {errors.ifscCode && <p className="text-red-500 text-sm mt-1">{errors.ifscCode}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Document Upload */}
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Upload Documents</h3>
                            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center">
                                <Upload className="mx-auto text-slate-400 dark:text-slate-500 mb-4" size={48} />
                                <p className="text-slate-600 dark:text-slate-400 mb-4">
                                    Drag and drop files here or click to browse
                                </p>
                                <label className="btn-primary cursor-pointer inline-block">
                                    <input
                                        type="file"
                                        multiple
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                    />
                                    Choose Files
                                </label>
                                <p className="text-sm text-slate-500 mt-2">
                                    Supported formats: PDF, JPG, PNG (Max 5MB each)
                                </p>
                            </div>
                            {errors.documents && <p className="text-red-500 text-sm mt-2">{errors.documents}</p>}

                            {/* Uploaded Documents */}
                            {documents.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    {documents.map((doc) => (
                                        <div
                                            key={doc.id}
                                            className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-4 rounded-lg"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <FileText className="text-primary-600 dark:text-primary-400" size={24} />
                                                <div>
                                                    <p className="font-medium text-slate-800 dark:text-slate-100">{doc.name}</p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                                        {(doc.size / 1024).toFixed(2)} KB
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeDocument(doc.id)}
                                                className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Additional Information */}
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Additional Information</h3>
                            <textarea
                                name="additionalInfo"
                                value={formData.additionalInfo}
                                onChange={handleInputChange}
                                rows="4"
                                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                                placeholder="Any additional information you'd like to provide..."
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="flex items-center justify-end space-x-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader className="w-5 h-5 animate-spin" />
                                        <span>Submitting...</span>
                                    </>
                                ) : (
                                    <>
                                        <Check size={20} />
                                        <span>Submit Application</span>
                                    </>
                                )}
                            </button>
                        </div>
                        {errors.api && <p className="text-red-500 text-sm mt-2 text-right">{errors.api}</p>}
                    </form>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ApplicationForm;
