# Demo Credentials

This document explains how to access the Clinic CRM demo environment with working credentials.

## Quick Start

The system now uses automatically generated staff members from the comprehensive seed data. Each time the application starts, it generates 30+ staff members with realistic Turkish data.

### Viewing Current Credentials

To see the current demo credentials for this session:

```bash
npx tsx scripts/show-demo-credentials.ts
```

Or simply look at the login page - the credentials are displayed there.

## Default Credentials Format

All demo accounts use the same password format: `{role}123`

- **Admin:** `admin123`
- **Doctor:** `doctor123`
- **Nurse:** `nurse123`
- **Receptionist:** `receptionist123`
- **Pharmacist:** `pharmacist123`

## How It Works

1. The system generates comprehensive seed data on startup (`src/lib/data/seedData.ts`)
2. This includes 30+ staff members:
   - 1 Admin
   - 15 Doctors (various specializations)
   - 10 Nurses
   - 3 Receptionists
   - 2 Pharmacists

3. The first user of each role becomes the "demo account" and their email is displayed on the login page

4. All staff emails follow realistic Turkish naming conventions (e.g., `ayse.demir.123456@example.com`)

5. Passwords are automatically generated for all users using the pattern: `{role}123`

## Why This Change?

Previously, the system had hardcoded demo credentials that didn't match the actual generated user data:

❌ **Old (incorrect):**
- Admin: `admin@clinic.com` / `admin123`
- Doctor: `dr.ayse.yilmaz@clinic.com` / `doctor123`
- Nurse: `nurse.mehmet@clinic.com` / `nurse123`

✅ **New (dynamic):**
- Credentials are generated from the actual seed data
- Displayed on login page automatically
- Consistent across the entire application

## Generated Data

The seed data system generates:

- **50-60 patients** with complete profiles
- **200+ appointments** spanning 6 months
- **100+ medical records** with vitals, diagnoses, prescriptions
- **30+ staff members** with working hours and specializations

All data is interconnected and realistic, providing a comprehensive demo environment.

## Technical Details

### File Structure

- `src/lib/data/seedData.ts` - Generates all seed data
- `src/lib/data/users.ts` - Exports staff and credentials
- `src/lib/stores/auth.ts` - Authentication logic
- `scripts/show-demo-credentials.ts` - Helper script to display credentials

### Accessing in Code

```typescript
import { DEMO_CREDENTIALS } from '$lib/data/users';

// Access credentials
console.log(DEMO_CREDENTIALS.admin.email);
console.log(DEMO_CREDENTIALS.doctor.password);
```

### Session Persistence

The mock service layer uses sessionStorage to persist changes during a demo session. To reset all data:

1. Clear your browser's sessionStorage
2. Refresh the page

## Troubleshooting

### "Kullanıcı bulunamadı" (User not found)

This error occurs when using old hardcoded credentials that don't exist in the new seed data. Solution:

1. Look at the login page for current credentials
2. Or run: `npx tsx scripts/show-demo-credentials.ts`
3. Use the displayed email addresses

### Different Emails Each Time

The seed data is generated fresh on each application start, so email addresses will be different. This is intentional - it provides variety for testing. The login page always shows the current session's credentials.

### Need Specific Credentials?

If you need stable credentials for automated testing, you can modify `src/lib/data/users.ts` to add hardcoded users at the beginning of the `mockUsers` array. These will take priority as demo credentials.
