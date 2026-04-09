# Admin Registration System Implementation

## Changes Made

### 1. **Frontend Changes (Register.js)**
- **Removed "Admin" option from the role dropdown** - Only "Student" and "Worker" roles are available for regular registration
- **Added Admin Registration Toggle** - A checkbox labeled "Register as Administrator" to enable admin registration mode
- **Added Admin Password Field** - When admin registration is enabled, a password field appears for the admin master password
- Admin registration requires:
  - Full name
  - Email address
  - Password
  - Admin master password

### 2. **Backend Changes (index.js)**
- **Enhanced Registration Endpoint** (`POST /register`):
  - Added admin password validation
  - Checks if role is "admin"
  - Validates admin password against `ADMIN_PASSWORD` environment variable
  - Prevents multiple admins - only one admin can be registered
  - Returns clear error messages for invalid credentials or if admin already exists

### 3. **Environment Configuration (.env)**
- Created `.env` file to store the admin master password
- Default password: `admin123` (change this in production!)
- To change password, edit the `.env` file and update `ADMIN_PASSWORD`

### 4. **Dependencies (package.json)**
- Added `dotenv` package to load environment variables securely

## How to Use

### **For Students/Workers Registration:**
1. Click on register
2. Fill in name, email, and password
3. Select role (Student or Worker)
4. Click "Create account"

### **For Admin Registration:**
1. Click on register
2. Fill in name and email
3. Check the "Register as Administrator" checkbox
4. Enter the admin master password (default: `admin123`)
5. Click "Create account"
6. **Only the first admin to complete this process can register** - after that, admin registration will be blocked

## Admin Features (Already Implemented)

Once logged in, the admin can:
1. **View Pending Complaints** - See all complaints waiting to be assigned
2. **View Resolved Complaints** - See all completed complaints
3. **Assign Complaints** - Assign pending complaints to workers with department information

## Security Notes

⚠️ **Important:**
- The default admin password is `admin123` - change this immediately in production
- Set the `ADMIN_PASSWORD` in your `.env` file to a strong password
- Only one admin can be registered - this ensures centralized control
- The admin password should never be shared with students or workers

## Installation

After these changes, run:
```bash
npm install
```

This will install the `dotenv` package needed for environment variable management.

## Admin Password Management

To change the admin password:
1. Edit the `.env` file
2. Update the `ADMIN_PASSWORD` value
3. Restart the backend server

The new password will be required for any future admin registration attempts.
