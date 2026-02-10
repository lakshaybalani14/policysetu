# ✅ Testing Your Supabase Integration

## Your Dev Server is Running!
**URL:** http://localhost:5173/

## Quick Test Checklist

### 1. Open the Policies Page
1. Open your browser
2. Go to: `http://localhost:5173/policies`
3. Open browser console (F12 → Console tab)

### 2. What to Look For

**✅ SUCCESS Indicators:**
- You should see: `"Fetched policies from Supabase:"` in console
- 10 real policies displayed (PM-KISAN, Ayushman Bharat, etc.)
- No errors in console

**❌ ERROR Indicators:**
- `"Error fetching policies:"` in console
- Empty policies list
- Red errors about Supabase

### 3. Test the Complete Flow

**A. Register/Login:**
1. Go to `/register`
2. Create account with:
   - Name: Test User
   - Email: test@example.com
   - Password: test123
3. Should auto-login and redirect to dashboard

**B. Browse Policies:**
1. Go to `/policies`
2. You should see 10 real schemes
3. Try filtering by sector
4. Try searching

**C. Apply for Policy:**
1. Click any policy
2. Click "Apply Now"
3. Fill the form
4. Submit

**D. Check Dashboard:**
1. Go to `/dashboard`
2. Should show your stats
3. Should show recent application

**E. View Applications:**
1. Go to `/my-applications`
2. Should show your submitted application

---

## Common Issues & Fixes

### Issue: "policyService is not defined"
**Fix:** Make sure line 67 in Policies.jsx uses `policyHelpers.getAll()` not `policyService.getAll()`

### Issue: Empty policies array
**Fix:** 
1. Check Supabase dashboard → Table Editor → policies
2. Make sure 10 policies exist
3. Check RLS policies are enabled

### Issue: "Failed to fetch"
**Fix:**
1. Check Supabase URL and key in `supabase.js`
2. Make sure you ran the SQL schema script

---

## What Should You See?

### Policies Page Should Show:
1. **PM-KISAN** - ₹6,000 (Agriculture)
2. **Ayushman Bharat** - ₹5,00,000 (Health)
3. **PMAY** - ₹2,50,000 (Housing)
4. **MUDRA Loan** - ₹10,00,000 (MSME)
5. **Beti Bachao Beti Padhao** - ₹1,50,000 (Women & Child)
6. **National Pension Scheme** - ₹2,00,000 (Social Security)
7. **PMKVY** - ₹8,000 (Skill Development)
8. **MGNREGA** - ₹30,000 (Rural Development)
9. **Ujjwala Yojana** - ₹1,600 (Energy)
10. **PM Jeevan Jyoti Bima** - ₹2,00,000 (Insurance)

---

## Console Logs to Expect

```
Fetched policies from Supabase: Array(10)
  0: {id: "...", name: "PM-KISAN", ...}
  1: {id: "...", name: "Ayushman Bharat", ...}
  ...
```

---

## Status Check

Open your browser now and test! Let me know:
1. ✅ or ❌ Policies loaded?
2. ✅ or ❌ Can you see 10 real schemes?
3. ✅ or ❌ Any console errors?
