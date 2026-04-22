<?php
$host = '127.0.0.1';
$port = 3306;
$dbname = 'socialbook';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;port=$port;charset=utf8mb4", $username, $password);
    echo "Connected to MySQL server!<br>";
    
    // Create database if not exists
    $pdo->exec("CREATE DATABASE IF NOT EXISTS $dbname");
    $pdo->exec("USE $dbname");
    
    // Check if users table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'users'");
    if ($stmt->rowCount() > 0) {
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
        $result = $stmt->fetch();
        echo "Users table exists! Number of users: " . $result['count'];
    } else {
        echo "Users table doesn't exist. Please import database.sql";
    }
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
