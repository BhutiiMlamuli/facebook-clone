CREATE DATABASE IF NOT EXISTS socialbook;
USE socialbook;

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    profile_pic VARCHAR(255) DEFAULT 'profile-pic.png',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE likes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY (post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert a default user (John Nicholson)
INSERT INTO users (name, email) VALUES ('John Nicholson', 'john@socialbook.com');

-- Insert sample posts (matching your static content)
INSERT INTO posts (user_id, content, image) VALUES
(1, 'Subscribe @Easy Tutorials YouTube Channel to watch more videos on website development and UI designs. #EasyTutorials #YouTubeChannel', 'images/feed-image-1.png'),
(1, 'Like and share this with friends, tag @Easy Tutorials facebook page on your post. Ask your doubts in the comments. #EasyTutorials #YouTubeChannel', 'images/feed-image-2.png'),
(1, 'We observe that all attributes on the right-hand side of the functional dependencies are prime attributes #EasyTutorials #YouTubeChannel', 'images/feed-image-3.png'),
(1, 'Eliminates Redundancy: 3NF helps to remove unnecessary duplication of data... #EasyTutorials #YouTubeChannel', 'images/feed-image-4.png'),
(1, 'Lossless Decomposition: When decomposing a relation to achieve 3NF, the decomposition should be lossless... #EasyTutorials #YouTubeChannel', 'images/feed-image-5.png');