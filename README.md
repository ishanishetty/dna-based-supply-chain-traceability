# DNA Trace - Supply Chain Tracking System

A supply chain tracking system that uses DNA sequences to track products through their lifecycle.

## Project Setup

This project uses a MySQL backend running locally on your laptop.

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- MySQL installed on your laptop
- MySQL server running

### Backend Setup (MySQL)

1. **Install MySQL** (if not already installed):
   - Windows: Download from [MySQL Downloads](https://dev.mysql.com/downloads/mysql/)
   - Or use MySQL via XAMPP/WAMP

2. **Create the database**:
   ```sql
   CREATE DATABASE dna_trace;
   ```

3. **Navigate to server directory and install dependencies**:
   ```sh
   cd server
   npm install
   ```

4. **Configure database connection**:
   - Copy `.env.example` to `.env` in the `server` directory
   - Update `.env` with your MySQL credentials:
     ```
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=your_password_here
     DB_NAME=dna_trace
     PORT=3001
     ```

5. **Create database tables**:
   ```sh
   mysql -u root -p dna_trace < schema.sql
   ```
   Or manually run the SQL in `server/schema.sql` using MySQL Workbench.

6. **Start the backend server**:
```sh
   npm run dev
   ```
   The server will run on `http://localhost:3001`

### Frontend Setup

1. **Install dependencies**:
   ```sh
   npm install
   ```

2. **Configure API URL** (optional):
   - Copy `.env.example` to `.env` in the root directory
   - Update if your backend runs on a different port:
     ```
     VITE_API_URL=http://localhost:3001/api
     ```

3. **Start the development server**:
   ```sh
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
