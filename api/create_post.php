<?php
require_once 'config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);
$content = trim($data['content'] ?? '');
$image = $data['image'] ?? null;

if (empty($content) && empty($image)) {
    echo json_encode(['success' => false, 'message' => 'Post content cannot be empty']);
    exit();
}

$stmt = $pdo->prepare("INSERT INTO posts (user_id, content, image) VALUES (?, ?, ?)");

if ($stmt->execute([$_SESSION['user_id'], $content, $image])) {
    $postId = $pdo->lastInsertId();
    
    // Get the created post with user info
    $stmt = $pdo->prepare("
        SELECT p.*, u.name, u.profile_pic 
        FROM posts p 
        JOIN users u ON p.user_id = u.id 
        WHERE p.id = ?
    ");
    $stmt->execute([$postId]);
    $post = $stmt->fetch();
    
    echo json_encode([
        'success' => true,
        'message' => 'Post created successfully',
        'post' => $post
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to create post']);
}
?>