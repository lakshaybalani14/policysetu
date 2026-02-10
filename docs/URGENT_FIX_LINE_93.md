# URGENT FIX - Line 93 Error in Policies.jsx

## The Bug
**Line 93** has this code:
```javascript
const filteredPolicies = filteredPolicies(policies, filters);
```

This is calling itself, causing a ReferenceError!

## The Fix

**Replace lines 92-93** with this complete filtering logic:

```javascript
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

    return true;
});
```

## Quick Steps:
1. Open `Policies.jsx`
2. Go to line 92-93
3. Delete those 2 lines
4. Paste the code above
5. Save the file

The error will disappear immediately!
