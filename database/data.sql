USE defaultdb;

-- Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS tasks (
  id          INT           AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(255)  NOT NULL,
  completed   BOOLEAN       DEFAULT FALSE,
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO tasks (title, completed) VALUES 
('Set up the Node.js project', FALSE),
('Install Express and mysql2', TRUE),
('Create the database schema', TRUE),
('Build the GET /tasks route', FALSE),
('Build the POST /tasks route', FALSE),
('Test all endpoints in Postman', FALSE);