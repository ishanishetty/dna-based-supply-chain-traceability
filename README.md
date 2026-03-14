# DNA Trace - Supply Chain Tracking System (dna-based-supply-chain-traceability)

DNA Trace is a bio-inspired supply chain tracking system designed to dynamically monitor product movement across the supply chain.

The system assigns products DNA-like encoded identifiers and stores tracking updates in a DBMS-backed architecture using MySQL. Users can register products and update their trace records as they move through different stages of the supply chain.

Each tracking event is stored in the database, enabling dynamic monitoring of product lifecycle data. Cryptographic hashing is used to maintain data integrity and detect tampering in tracking records.

The project demonstrates how bio-inspired identification combined with secure database systems can improve transparency and traceability in supply chain management.

## Problem Statement

Modern supply chains often face issues such as:

Lack of transparency in product movement

Difficulty verifying product authenticity

Risk of tampering with tracking records

Limited visibility across supply chain stages

Traditional tracking systems rely on centralized records that may be altered or manipulated.

## Features
DNA-inspired product identification

Dynamic tracking of product movement

DBMS-backed storage using MySQL

Secure record verification using cryptographic hashing

Web interface for managing and tracking products

## Tech Stack 

Frontend:

React

TypeScript

Tailwind CSS

shadcn-ui

Vite

Backend:

Node.js

Express.js

Database

MySQL (DBMS)

## Project Setup

This project uses a MySQL backend running locally.

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

## Future Improvements

Possible extensions of the system include:

Multi-role supply chain system (supplier, logistics, consumer)

Blockchain-based traceability verification

IoT integration for automated tracking

Real-time analytics dashboard for supply chain monitoring
