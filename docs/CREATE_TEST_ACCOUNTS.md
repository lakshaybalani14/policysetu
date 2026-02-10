# Creating Test Accounts in Supabase

Since you've set up the database, now you need to create test accounts to log in.

## Option 1: Create Accounts via Supabase Dashboard (Easiest)

1. Go to your Supabase project: https://supabase.com/dashboard/project/zlbybzbgxsafvrmuunbu
2. Click **"Authentication"** in the left sidebar
3. Click **"Users"** tab
4. Click **"Add user"** button
5. Create two accounts:

**User Account:**
- Email: `user@test.com`
- Password: `user123`
- After creating, click on the user
- Go to "User Metadata" section
- Add metadata:
  ```json
  {
    "name": "Test User",
    "role": "user"
  }
  ```

**Admin Account:**
- Email: `admin@test.com`
- Password: `admin123`
- After creating, click on the user
- Go to "User Metadata" section
- Add metadata:
  ```json
  {
    "name": "Admin User",
    "role": "admin"
  }
  ```

## Option 2: Create Account via Registration Page

1. Start your app: `npm run dev`
2. Go to `/register`
3. Fill out the form and create an account
4. You'll be automatically logged in

## Done!

Now you can log in with these accounts and test the application.
