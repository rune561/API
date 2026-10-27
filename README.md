# Simplified Task API

A beginner-friendly, full-stack REST API built with **Node.js**, **Express**, and **MySQL (Aiven)**. 

Unlike the advanced MVC version, this project consolidates all routing, validation, and SQL queries into a single `server.js` file to make it easier to understand how the pieces connect.

## Project Structure

```text
simplified-task-api/
├── .env                  # Your secret credentials (DO NOT COMMIT)
├── .env.example          # Template for environment variables
├── .gitignore            # Tells Git what to ignore
├── package.json          # Project dependencies and scripts
├── server.js             # The main entry point (Routes + Logic)
└── src/
    └── db.js             # MySQL connection pool