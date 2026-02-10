# Fix for Policies Section

## Problem
The Policies page is still using the old `policyService` instead of `policyHelpers` from Supabase.

## File: `policy-tracker-react/src/pages/Policies.jsx`

### Line 67 - URGENT FIX NEEDED

**FIND this line (line 67):**
```javascript
const data = await policyService.getAll();
```

**REPLACE with:**
```javascript
const { data, error } = await policyHelpers.getAll();
```

### Lines 68-69 - Update the logic

**FIND these lines (68-69):**
```javascript
console.log('Fetched policies:', data);
setPolicies(data);
```

**REPLACE with:**
```javascript
if (error) {
    console.error('Error fetching policies:', error);
    setPolicies([]);
} else {
    console.log('Fetched policies from Supabase:', data);
    setPolicies(data || []);
}
```

### Complete Fixed Section (Lines 63-78)

Here's what the complete section should look like:

```javascript
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
                setPolicies(data || []);
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
```

## After fixing, save and refresh your browser!
