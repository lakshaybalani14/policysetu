# Debugging Blank Page

## Step 1: Check Browser Console
1. Press F12
2. Click "Console" tab
3. Look for RED errors
4. Tell me what it says

## Step 2: Common Errors & Fixes

### Error: "Cannot read property 'map' of undefined"
**Cause:** `filteredPolicies` or `sortedPolicies` is undefined
**Fix:** Check if policies array is initialized

### Error: "policy.eligibility is undefined"
**Cause:** Database field name mismatch
**Fix:** Change `policy.eligibility` to `policy.eligibility || {}`

### Error: "Unexpected token"
**Cause:** Syntax error in the filter code
**Fix:** Check for missing brackets or parentheses

## Step 3: Quick Test

Open browser console and run:
```javascript
localStorage.clear();
location.reload();
```

This clears any cached data.

## Step 4: Minimal Test

If still blank, temporarily replace the filter logic (lines 92-149) with:
```javascript
// Apply filters - SIMPLE VERSION
const filteredPolicies = policies;
```

This will show ALL policies without filtering, just to test if data is loading.

## What to tell me:
1. What error is in the console?
2. Does the simple version above work?
