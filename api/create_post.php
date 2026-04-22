<?php
require_once 'config.php';

$data = json_decode(file_get_contents('php://input'), true);
$content = trim($data['content'] ?? '');

if (!$content) {
    echo json_encode(['success' => false, 'message' => 'Post content required']);
    exit;
}

$stmt = $pdo->prepare("INSERT INTO posts (user_id, content) VALUES (?, ?)");
if ($stmt->execute([$_SESSION['user_id'], $content])) {
    echo json_encode(['success' => true, 'post_id' => $pdo->lastInsertId()]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to create post']);
}
?>