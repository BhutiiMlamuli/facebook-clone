-- Drop and recreate database
DROP DATABASE IF EXISTS socialbook;
CREATE DATABASE socialbook;
USE socialbook;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    profile_pic VARCHAR(255) DEFAULT 'profile-pic.png',
    cover_pic VARCHAR(255) DEFAULT NULL,
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Posts table
CREATE TABLE posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);

-- Comments table
CREATE TABLE comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_post_id (post_id)
);

-- Likes table
CREATE TABLE likes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_like (post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_post_user (post_id, user_id)
);

-- Stories (expire after 24h)
CREATE TABLE stories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    image VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_created_at (created_at)
);

-- Events
CREATE TABLE events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    location VARCHAR(200),
    image VARCHAR(255),
    created_by INT,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_event_date (event_date)
);

-- Friend requests
CREATE TABLE friend_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'declined') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id),
    UNIQUE KEY unique_request (sender_id, receiver_id),
    INDEX idx_status (status)
);

-- Insert sample data with hashed passwords (password: 'password123')
INSERT INTO users (name, email, password, bio) VALUES 
('John Doe', 'john@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Software developer passionate about web technologies'),
('Jane Smith', 'jane@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'UI/UX Designer & Creative Artist'),
('Mike Johnson', 'mike@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Digital Marketer'),
('Sarah Wilson', 'sarah@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Content Creator');

INSERT INTO posts (user_id, content) VALUES 
(1, 'Welcome to SocialBook! 🎉 This is my first post. Feel free to connect with me! #SocialBook #NewBeginnings'),
(2, 'Excited to be part of this amazing community! Can\'t wait to share my creative journey with all of you. ✨ #CreativeLife'),
(3, 'Just joined SocialBook! Looking forward to connecting with fellow marketers and sharing insights. 📈 #DigitalMarketing'),
(1, 'Beautiful day for coding! Building amazing things with PHP and JavaScript. 💻 #WebDev'),
(2, 'Just finished a new design project. So proud of how it turned out! 🎨 #DesignInspiration');

INSERT INTO comments (post_id, user_id, comment) VALUES 
(1, 2, 'Welcome John! Looking forward to seeing your posts! 🎉'),
(1, 3, 'Great to have you here!'),
(2, 1, 'Love your energy Jane! Keep sharing!'),
(3, 1, 'Welcome Mike! Always good to have marketing experts here.');

INSERT INTO likes (post_id, user_id) VALUES 
(1, 2), (1, 3), (1, 4),
(2, 1), (2, 3),
(3, 1), (3, 2);

INSERT INTO events (title, description, event_date, location) VALUES 
('Tech Meetup 2024', 'Annual technology conference with industry experts', '2024-12-15', 'San Francisco, CA'),
('Web Development Workshop', 'Learn modern web development practices', '2024-12-20', 'Online'),
('Design Thinking Session', 'Interactive session on creative problem solving', '2024-12-25', 'New York, NY');

INSERT INTO stories (user_id, image) VALUES 
(1, 'story1.jpg'),
(2, 'story2.jpg'),
(3, 'story3.jpg');

INSERT INTO friend_requests (sender_id, receiver_id, status) VALUES 
(1, 2, 'accepted'),
(1, 3, 'accepted'),
(2, 4, 'pending');