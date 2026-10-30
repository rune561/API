# Task Manager — Full-Stack Application

A complete full-stack Task Manager built with **Node.js**, **Express**, and **MySQL (Aiven)**. It features a custom frontend UI that connects to a REST API to manage tasks in a cloud database.

## Project Structure

task API/
├── database/
│   └── data.sql              # SQL script to create the tasks table
├── froentend/                # Frontend UI files
│   ├── app.js
│   ├── index.html
│   └── style.css
├── src/
│   ├── controllers/          # MVC Controllers
│   │   └── taskController.js
│   ├── models/               # MVC Models (Database queries)
│   │   └── taskmodel.js
│   ├── routes/               # MVC Routes
│   │   └── taskRoutes.js
│   └── db.js                 # MySQL connection pool
├── .env                      # Secret database credentials (DO NOT COMMIT)
├── .gitignore                # Tells Git what to ignore
├── package.json              # Project dependencies and scripts
├── package-lock.json
├── README.md
├── server.js                 # Main entry point (Serves UI + API Routes)
└── test-db.js                # Script to test Aiven database connection