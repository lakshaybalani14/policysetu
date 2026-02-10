# Dashboard.jsx - Exact Changes Needed

## File: `policy-tracker-react/src/pages/Dashboard.jsx`

### Change 1: Lines 18-25 (Replace the Promise.all section)

**FIND these lines (18-25):**
```javascript
const [appsData, paymentsData, policiesData] = await Promise.all([
    applicationService.getAll(user.id), // Filter by user ID
    paymentService.getAll(user.id),
    policyService.getAll()
]);

setApplications(appsData);
setPayments(paymentsData);
```

**REPLACE with:**
```javascript
const [appsResult, paymentsResult, policiesResult] = await Promise.all([
    applicationHelpers.getUserApplications(),
    paymentHelpers.getUserPayments(),
    policyHelpers.getAll()
]);

setApplications(appsResult.data || []);
setPayments(paymentsResult.data || []);
```

### Change 2: Lines 28-29 (Update the recommendations logic)

**FIND these lines (28-29):**
```javascript
const appliedIds = appsData.map(a => a.policyId);
const notApplied = policiesData.filter(p => !appliedIds.includes(p.id) && p.status === 'active');
```

**REPLACE with:**
```javascript
const appliedIds = (appsResult.data || []).map(a => a.policy_id);
const notApplied = (policiesResult.data || []).filter(p => !appliedIds.includes(p.id) && p.status === 'active');
```

---

## That's it!

Just these 2 changes in Dashboard.jsx and you're done! The import at the top was already updated.
