# ApplicationForm.jsx - Translation Function Removal

## The Problem
The ApplicationForm.jsx file has many `t()` function calls for translations, but the translation system was removed. This causes the form to crash when opened.

## Lines with `t()` calls to fix:
- Line 148: `t('apply_title')`
- Line 149: `t('apply_subtitle')`
- Line 165: `t('sect_personal')`
- Line 169: `t('input_fullname')`
- Line 184: `t('input_email')`
- Line 199: `t('input_phone')`
- Line 215: `t('lbl_dob')`
- Line 229: `t('lbl_gender')`
- Line 247: `t('lbl_occupation')`
- And many more...

## Solution
Replace all `t('...')` calls with plain English text.

### Example Replacements:
```javascript
// Line 148-149
{t('apply_title').replace('{policy}', policy.name)}
// Replace with:
Apply for {policy.name}

{t('apply_subtitle')}
// Replace with:
Fill out the form below to submit your application

// Line 165
{t('sect_personal')}
// Replace with:
Personal Information

// Line 169
{t('input_fullname')}
// Replace with:
Full Name
```

## Quick Fix
I'll create a fixed version of the file with all translations removed.
