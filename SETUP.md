# Quick Setup Guide

## Current Status
✅ Backend server running on http://localhost:3001  
✅ Frontend server running on http://localhost:8080  
⚠️ MySQL database needs to be set up

## Database Setup

You have two options:

### Option 1: Automated Setup (Recommended)

1. Open PowerShell in the `server` directory
2. Run the setup script:
   ```powershell
   .\setup-database.ps1
   ```
3. Enter your MySQL root password when prompted
4. The script will:
   - Create the `dna_trace` database
   - Create all necessary tables
   - Update the `.env` file with your password

### Option 2: Manual Setup

1. Open MySQL command line or MySQL Workbench
2. Create the database:
   ```sql
   CREATE DATABASE dna_trace;
   ```
3. Run the schema:
   ```sql
   USE dna_trace;
   ```
   Then copy and paste the contents of `server/schema.sql` and execute it.

4. Update `server/.env` with your MySQL password:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_actual_password_here
   DB_NAME=dna_trace
   PORT=3001
   ```

5. Restart the backend server (stop with Ctrl+C and run `npm run dev` again)

## Access the Application

Once the database is set up:
- Open your browser and go to: **http://localhost:8080**
- The application should now work with MySQL!

## Troubleshooting

- **"Access denied" error**: Check your MySQL password in `server/.env`
- **"Database doesn't exist"**: Run the setup script or create the database manually
- **Port already in use**: Stop other services using ports 3001 or 8080




