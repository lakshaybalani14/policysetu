# Supabase Migration - Quick Update Guide

## What's Been Done ✅

1. ✅ Installed Supabase client
2. ✅ Created database with 10 real government schemes
3. ✅ Updated Login & Register pages
4. ✅ Updated Policies page imports

## What You Need to Do (5 Minutes)

### Step 1: Update Policies.jsx Fetch Logic

**File:** `policy-tracker-react/src/pages/Policies.jsx`

**Find (around line 67):**
```javascript
const data = await policyService.getAll();
console.log('Fetched policies:', data);
setPolicies(data);
```

**Replace with:**
```javascript
const { data, error } = await policyHelpers.getAll();

if (error) {
    console.error('Error fetching policies:', error);
    setPolicies([]);
} else {
    console.log('Fetched policies from Supabase:', data);
    setPolicies(data || []);
}
```

### Step 2: Update PolicyDetail.jsx

**File:** `policy-tracker-react/src/pages/PolicyDetail.jsx`

**Find (line 5-6):**
```javascript
import { policyService } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
```

**Replace with:**
```javascript
import { policyHelpers } from '../services/supabase';
```

**Find (around line 44):**
```javascript
const data = await policyService.getById(id);
setPolicy(data);
```

**Replace with:**
```javascript
const { data, error } = await policyHelpers.getById(id);
if (!error && data) {
    setPolicy(data);
}
```

### Step 3: Update MyApplications.jsx

**File:** `policy-tracker-react/src/pages/MyApplications.jsx`

**Find imports:**
```javascript
import { applicationService } from '../services/api';
```

**Replace with:**
```javascript
import { applicationHelpers } from '../services/supabase';
```

**Find fetch logic:**
```javascript
const data = await applicationService.getAll(user.id);
setApplications(data);
```

**Replace with:**
```javascript
const { data, error } = await applicationHelpers.getUserApplications();
if (!error && data) {
    setApplications(data);
}
```

### Step 4: Update Dashboard.jsx

**File:** `policy-tracker-react/src/pages/Dashboard.jsx`

**Find:**
```javascript
import api from '../services/api';
```

**Replace with:**
```javascript
import { statsHelpers } from '../services/supabase';
```

**Find:**
```javascript
const response = await api.get('/stats');
setStats(response.data);
```

**Replace with:**
```javascript
const { data, error } = await statsHelpers.getDashboardStats();
if (!error && data) {
    setStats(data);
}
```

### Step 5: Update ApplicationForm.jsx

**File:** `policy-tracker-react/src/components/ApplicationForm.jsx`

**Find (line 4-5):**
```javascript
import { useLanguage } from '../context/LanguageContext';
import { applicationService } from '../services/api';
```

**Replace with:**
```javascript
import { applicationHelpers } from '../services/supabase';
```

**Find (around line 116):**
```javascript
const response = await applicationService.create(applicationData);
```

**Replace with:**
```javascript
const { data: response, error } = await applicationHelpers.create(applicationData);
if (error) throw error;
```

### Step 6: Remove useLanguage Hook

In `ApplicationForm.jsx`, remove:
```javascript
const { t } = useLanguage();
```

And replace all `{t('...')}` with plain English text.

## Step 7: Create Test Accounts

Follow instructions in `CREATE_TEST_ACCOUNTS.md`

## Done!

After these updates, your app will be fully connected to Supabase with real data!

**Test it:**
```bash
cd policy-tracker-react
npm run dev
```

Visit `http://localhost:5173` and try:
1. Register a new account
2. Browse 10 real policies
3. Submit an application
4. View your dashboard
