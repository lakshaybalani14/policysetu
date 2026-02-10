# FIELD NAME FIX - Database uses snake_case!

## The Problem
The Supabase database uses **snake_case** field names:
- `benefit_amount` ✅
- `benefit_type` ✅
- `application_deadline` ✅
- `processing_time` ✅
- `detailed_description` ✅

But the code uses **camelCase**:
- `benefitAmount` ❌
- `benefitType` ❌
- `applicationDeadline` ❌
- `processingTime` ❌
- `detailedDescription` ❌

## Quick Fix

**Find and Replace in Policies.jsx:**

1. `policy.benefitAmount` → `policy.benefit_amount`
2. `policy.benefitType` → `policy.benefit_type`
3. `policy.applicationDeadline` → `policy.application_deadline`
4. `policy.processingTime` → `policy.processing_time`
5. `policy.detailedDescription` → `policy.detailed_description`

## Specific Line Fixes

### Line 331 (THE ERROR!)
**Change:**
```javascript
<span className="text-lg">{policy.benefitAmount.toLocaleString()}</span>
```

**To:**
```javascript
<span className="text-lg">{policy.benefit_amount?.toLocaleString()}</span>
```

Note: Added `?.` (optional chaining) to prevent errors if field is missing.

## Search All Files

You may also need to fix these in:
- `PolicyDetail.jsx`
- `Dashboard.jsx`
- `ApplicationForm.jsx`

Use Find & Replace (Ctrl+H) in VS Code:
1. Find: `benefitAmount`
2. Replace: `benefit_amount`
3. Click "Replace All"

Repeat for all camelCase fields!
