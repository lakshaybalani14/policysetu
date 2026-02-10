-- =====================================================
-- POLICY TRACKER - SUPABASE DATABASE SCHEMA
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- POLICIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    detailed_description TEXT,
    sector TEXT NOT NULL,
    department TEXT NOT NULL,
    benefit_amount NUMERIC NOT NULL,
    benefit_type TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    featured BOOLEAN DEFAULT false,
    application_deadline DATE,
    processing_time TEXT,
    documents JSONB DEFAULT '[]'::jsonb,
    eligibility JSONB NOT NULL,
    amendments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- APPLICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    policy_name TEXT NOT NULL,
    
    -- Personal Information
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender TEXT NOT NULL,
    
    -- Address Information
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    
    -- Financial Information
    occupation TEXT NOT NULL,
    annual_income NUMERIC NOT NULL,
    category TEXT NOT NULL,
    bank_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    ifsc_code TEXT NOT NULL,
    
    -- Additional
    additional_info TEXT,
    documents JSONB DEFAULT '[]'::jsonb,
    
    -- Status
    status TEXT DEFAULT 'submitted',
    remarks TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PAYMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending',
    payment_date DATE,
    transaction_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policies Table RLS
CREATE POLICY "Anyone can view policies"
    ON policies FOR SELECT
    USING (true);

-- Applications Table RLS
CREATE POLICY "Users can view own applications"
    ON applications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create applications"
    ON applications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications"
    ON applications FOR UPDATE
    USING (auth.uid() = user_id);

-- Payments Table RLS
CREATE POLICY "Users can view own payments"
    ON payments FOR SELECT
    USING (auth.uid() = user_id);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_policies_sector ON policies(sector);
CREATE INDEX IF NOT EXISTS idx_policies_status ON policies(status);
CREATE INDEX IF NOT EXISTS idx_policies_featured ON policies(featured);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_policy_id ON applications(policy_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_application_id ON payments(application_id);

-- =====================================================
-- REAL INDIAN GOVERNMENT POLICIES DATA
-- =====================================================

-- 1. PM-KISAN (Agriculture)
INSERT INTO policies (name, description, detailed_description, sector, department, benefit_amount, benefit_type, status, featured, application_deadline, processing_time, documents, eligibility, amendments)
VALUES (
    'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    'Financial support to farmers for procuring various inputs to ensure proper crop health and appropriate yields.',
    'Under this scheme, financial assistance of Rs. 6000 per year is provided to all farmer families across the country in three equal installments of Rs. 2000 each every four months. The scheme aims to supplement the financial needs of farmers in procuring various inputs to ensure proper crop health and appropriate yields.',
    'Agriculture',
    'Ministry of Agriculture & Farmers Welfare',
    6000,
    'Annual (3 installments)',
    'active',
    true,
    '2025-12-31',
    '30-45 days',
    '["Aadhaar Card", "Bank Account Details", "Land Ownership Documents", "Passport Size Photo"]'::jsonb,
    '{
        "ageMin": 18,
        "ageMax": 100,
        "gender": ["Male", "Female", "Other"],
        "incomeMax": null,
        "occupation": ["Farmer"],
        "beneficiaryCategory": ["Small and Marginal Farmers", "All Farmers"]
    }'::jsonb,
    '[]'::jsonb
);

-- 2. Ayushman Bharat (Health)
INSERT INTO policies (name, description, detailed_description, sector, department, benefit_amount, benefit_type, status, featured, application_deadline, processing_time, documents, eligibility, amendments)
VALUES (
    'Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana (PM-JAY)',
    'World''s largest health insurance scheme providing coverage of Rs. 5 lakhs per family per year for secondary and tertiary care hospitalization.',
    'Ayushman Bharat PM-JAY provides health cover of Rs. 5 lakhs per family per year for secondary and tertiary care hospitalization. It covers over 10.74 crore poor and vulnerable families (approximately 50 crore beneficiaries) providing coverage for almost all secondary and many tertiary hospitalizations.',
    'Health',
    'Ministry of Health & Family Welfare',
    500000,
    'Annual Coverage',
    'active',
    true,
    '2025-12-31',
    '15-30 days',
    '["Aadhaar Card", "Ration Card", "Income Certificate", "Family Photo", "Mobile Number"]'::jsonb,
    '{
        "ageMin": 0,
        "ageMax": 100,
        "gender": ["Male", "Female", "Other"],
        "incomeMax": 300000,
        "occupation": ["Any"],
        "beneficiaryCategory": ["BPL Families", "Economically Weaker Section", "SC", "ST"]
    }'::jsonb,
    '[]'::jsonb
);

-- 3. Pradhan Mantri Awas Yojana (Housing)
INSERT INTO policies (name, description, detailed_description, sector, department, benefit_amount, benefit_type, status, featured, application_deadline, processing_time, documents, eligibility, amendments)
VALUES (
    'Pradhan Mantri Awas Yojana - Urban (PMAY-U)',
    'Housing for All scheme providing financial assistance for construction of pucca houses to eligible urban poor.',
    'PMAY-U aims to provide housing for all in urban areas by 2022. The scheme provides central assistance to implementing agencies through States/UTs for providing houses to all eligible families/beneficiaries against the validated demand for houses for about 1.12 crore.',
    'Housing',
    'Ministry of Housing & Urban Affairs',
    250000,
    'One-time Subsidy',
    'active',
    true,
    '2025-12-31',
    '60-90 days',
    '["Aadhaar Card", "Income Certificate", "Property Documents", "Bank Account Details", "Passport Size Photo", "Caste Certificate (if applicable)"]'::jsonb,
    '{
        "ageMin": 21,
        "ageMax": 70,
        "gender": ["Male", "Female", "Other"],
        "incomeMax": 1800000,
        "occupation": ["Any"],
        "beneficiaryCategory": ["EWS", "LIG", "MIG", "First Time Home Buyers"]
    }'::jsonb,
    '[]'::jsonb
);

-- 4. MUDRA Loan (MSME)
INSERT INTO policies (name, description, detailed_description, sector, department, benefit_amount, benefit_type, status, featured, application_deadline, processing_time, documents, eligibility, amendments)
VALUES (
    'Pradhan Mantri MUDRA Yojana (PMMY)',
    'Loans up to Rs. 10 lakhs to non-corporate, non-farm small/micro enterprises for income generating activities.',
    'MUDRA (Micro Units Development & Refinance Agency Ltd.) provides funding to non-corporate, non-farm small/micro enterprises. The scheme offers three types of loans: Shishu (up to Rs. 50,000), Kishore (Rs. 50,001 to Rs. 5 lakhs), and Tarun (Rs. 5,00,001 to Rs. 10 lakhs).',
    'MSME',
    'Ministry of Finance',
    1000000,
    'Loan (Repayable)',
    'active',
    true,
    '2025-12-31',
    '15-30 days',
    '["Aadhaar Card", "PAN Card", "Business Plan", "Bank Statements", "Address Proof", "Identity Proof"]'::jsonb,
    '{
        "ageMin": 18,
        "ageMax": 65,
        "gender": ["Male", "Female", "Other"],
        "incomeMax": null,
        "occupation": ["Self-Employed", "Small Business Owner", "Entrepreneur"],
        "beneficiaryCategory": ["Micro Enterprises", "Small Businesses", "Women Entrepreneurs"]
    }'::jsonb,
    '[]'::jsonb
);

-- 5. Beti Bachao Beti Padhao (Women & Child)
INSERT INTO policies (name, description, detailed_description, sector, department, benefit_amount, benefit_type, status, featured, application_deadline, processing_time, documents, eligibility, amendments)
VALUES (
    'Beti Bachao Beti Padhao (BBBP)',
    'Scheme to address declining Child Sex Ratio and related issues of empowerment of women over a life-cycle continuum.',
    'BBBP is a tri-ministerial effort of Ministries of Women and Child Development, Health & Family Welfare and Human Resource Development. The scheme aims to address the declining Child Sex Ratio (CSR) and related issues of empowerment of women through a mass campaign mode.',
    'Women & Child',
    'Ministry of Women & Child Development',
    150000,
    'Savings Scheme Benefit',
    'active',
    true,
    '2025-12-31',
    '30-45 days',
    '["Birth Certificate of Girl Child", "Aadhaar Card of Parents", "Bank Account Details", "Passport Size Photos", "Address Proof"]'::jsonb,
    '{
        "ageMin": 0,
        "ageMax": 10,
        "gender": ["Female"],
        "incomeMax": 1000000,
        "occupation": ["Any"],
        "beneficiaryCategory": ["Girl Child", "Parents of Girl Child"]
    }'::jsonb,
    '[]'::jsonb
);

-- 6. National Pension Scheme (Social Security)
INSERT INTO policies (name, description, detailed_description, sector, department, benefit_amount, benefit_type, status, featured, application_deadline, processing_time, documents, eligibility, amendments)
VALUES (
    'National Pension Scheme (NPS)',
    'Voluntary retirement savings scheme designed to enable systematic savings for retirement.',
    'NPS is a government-sponsored pension scheme that allows subscribers to contribute regularly during their working life. The scheme offers market-linked returns and tax benefits. Upon retirement, subscribers can withdraw a part of the corpus in lump sum and use the remaining corpus to buy an annuity to secure a regular income.',
    'Social Security',
    'Ministry of Finance',
    200000,
    'Pension Corpus',
    'active',
    true,
    '2025-12-31',
    '7-15 days',
    '["Aadhaar Card", "PAN Card", "Bank Account Details", "Passport Size Photo", "Address Proof", "Date of Birth Proof"]'::jsonb,
    '{
        "ageMin": 18,
        "ageMax": 70,
        "gender": ["Male", "Female", "Other"],
        "incomeMax": null,
        "occupation": ["Any"],
        "beneficiaryCategory": ["All Indian Citizens", "NRIs"]
    }'::jsonb,
    '[]'::jsonb
);

-- 7. Skill India - PMKVY (Skill Development)
INSERT INTO policies (name, description, detailed_description, sector, department, benefit_amount, benefit_type, status, featured, application_deadline, processing_time, documents, eligibility, amendments)
VALUES (
    'Pradhan Mantri Kaushal Vikas Yojana (PMKVY)',
    'Flagship scheme for skill training of youth with focus on industry relevant training and certification.',
    'PMKVY is the flagship scheme of the Ministry of Skill Development & Entrepreneurship (MSDE). The objective is to enable a large number of Indian youth to take up industry-relevant skill training that will help them in securing a better livelihood. Individuals with prior learning experience or skills will also be assessed and certified under Recognition of Prior Learning (RPL).',
    'Skill Development',
    'Ministry of Skill Development & Entrepreneurship',
    8000,
    'Training Stipend',
    'active',
    true,
    '2025-12-31',
    '30-60 days',
    '["Aadhaar Card", "Educational Certificates", "Bank Account Details", "Passport Size Photo", "Age Proof"]'::jsonb,
    '{
        "ageMin": 15,
        "ageMax": 45,
        "gender": ["Male", "Female", "Other"],
        "incomeMax": null,
        "occupation": ["Student", "Unemployed", "School Dropout"],
        "beneficiaryCategory": ["Youth", "School Dropouts", "Unemployed"]
    }'::jsonb,
    '[]'::jsonb
);

-- 8. MGNREGA (Rural Development)
INSERT INTO policies (name, description, detailed_description, sector, department, benefit_amount, benefit_type, status, featured, application_deadline, processing_time, documents, eligibility, amendments)
VALUES (
    'Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA)',
    'Provides at least 100 days of guaranteed wage employment in a financial year to rural households.',
    'MGNREGA is one of the largest work guarantee programmes in the world. The primary objective is to guarantee 100 days of employment in every financial year to adult members of any rural household willing to do public work-related unskilled manual work at the statutory minimum wage.',
    'Rural Development',
    'Ministry of Rural Development',
    30000,
    'Wage Employment',
    'active',
    true,
    '2025-12-31',
    '15-30 days',
    '["Job Card", "Aadhaar Card", "Bank Account Details", "Passport Size Photo", "Address Proof"]'::jsonb,
    '{
        "ageMin": 18,
        "ageMax": 100,
        "gender": ["Male", "Female", "Other"],
        "incomeMax": null,
        "occupation": ["Unskilled Worker", "Agricultural Worker"],
        "beneficiaryCategory": ["Rural Households", "BPL Families"]
    }'::jsonb,
    '[]'::jsonb
);

-- 9. Ujjwala Yojana (Energy)
INSERT INTO policies (name, description, detailed_description, sector, department, benefit_amount, benefit_type, status, featured, application_deadline, processing_time, documents, eligibility, amendments)
VALUES (
    'Pradhan Mantri Ujjwala Yojana (PMUY)',
    'Provides LPG connections to women from Below Poverty Line (BPL) households.',
    'PMUY was launched to safeguard the health of women and children by providing them with a clean cooking fuel - LPG, so that they don''t have to compromise their health in smoky kitchens or wander in unsafe areas collecting firewood. The scheme provides a financial support of Rs. 1600 per LPG connection to the BPL households.',
    'Energy',
    'Ministry of Petroleum & Natural Gas',
    1600,
    'One-time Subsidy',
    'active',
    true,
    '2025-12-31',
    '15-30 days',
    '["Aadhaar Card", "BPL Ration Card", "Bank Account Details", "Passport Size Photo", "Address Proof"]'::jsonb,
    '{
        "ageMin": 18,
        "ageMax": 100,
        "gender": ["Female"],
        "incomeMax": 200000,
        "occupation": ["Any"],
        "beneficiaryCategory": ["BPL Families", "SC/ST", "PMAY Beneficiaries", "AAY"]
    }'::jsonb,
    '[]'::jsonb
);

-- 10. PM Jeevan Jyoti Bima Yojana (Insurance)
INSERT INTO policies (name, description, detailed_description, sector, department, benefit_amount, benefit_type, status, featured, application_deadline, processing_time, documents, eligibility, amendments)
VALUES (
    'Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)',
    'Life insurance scheme offering coverage of Rs. 2 lakhs for death due to any reason.',
    'PMJJBY is a one-year life insurance scheme renewable from year to year offering coverage for death due to any reason. It is available to people in the age group of 18 to 50 years having a bank account who give their consent to join. The premium is Rs. 436 per annum and is to be auto-debited from the account holder''s savings bank account.',
    'Insurance',
    'Ministry of Finance',
    200000,
    'Life Insurance Cover',
    'active',
    true,
    '2025-12-31',
    '7-15 days',
    '["Aadhaar Card", "Bank Account Details", "Passport Size Photo", "Nominee Details", "Age Proof"]'::jsonb,
    '{
        "ageMin": 18,
        "ageMax": 50,
        "gender": ["Male", "Female", "Other"],
        "incomeMax": null,
        "occupation": ["Any"],
        "beneficiaryCategory": ["All Indian Citizens with Bank Account"]
    }'::jsonb,
    '[]'::jsonb
);

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================
-- Schema and real policy data inserted successfully!
