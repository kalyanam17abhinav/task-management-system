-- Create database
CREATE DATABASE IF NOT EXISTS task_manager;
USE task_manager;

-- Create Roles table
CREATE TABLE IF NOT EXISTS Roles (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    role_type VARCHAR(50) NOT NULL UNIQUE
);

-- Insert default roles
INSERT IGNORE INTO Roles (role_type) VALUES ('user'), ('admin');

-- Create Users table
CREATE TABLE IF NOT EXISTS Users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role_id INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES Roles(role_id)
);

-- Create Tasks table
CREATE TABLE IF NOT EXISTS Tasks (
    task_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);