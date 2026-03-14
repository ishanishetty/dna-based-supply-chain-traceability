# DNA Trace Backend Server

MySQL backend server for the DNA Trace application.

## Setup

1. Install MySQL on your laptop if not already installed
2. Create the database:
   ```sql
   CREATE DATABASE dna_trace;
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

5. Update `.env` with your MySQL credentials:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=dna_trace
   PORT=3001
   ```

6. Run the schema to create tables:
   
   **Option A: Use the PowerShell setup script (Windows):**
   ```powershell
   .\setup-database.ps1
   ```
   This script will prompt for your MySQL password and set everything up automatically.
   
   **Option B: Manual setup:**
   ```bash
   mysql -u root -p dna_trace < schema.sql
   ```
   Or manually run the SQL in `schema.sql` using MySQL Workbench or command line.

7. Start the server:
   ```bash
   npm run dev
   ```

The server will run on `http://localhost:3001`

## API Endpoints

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create new product
- `GET /api/events/product/:productId` - Get events for a product
- `POST /api/events` - Add event to product
- `GET /api/dna-history/product/:productId` - Get DNA history for a product

