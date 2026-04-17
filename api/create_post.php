<?php
require_once 'config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$content = trim($data['content'] ?? '');
$image = $data['image'] ?? null;

if (!$content && !$image) {
    echo json_encode(['success' => false, 'message' => 'Post content required']);
    exit;
}

$stmt = $pdo->prepare("INSERT INTO posts (user_id, content, image) VALUES (?, ?, ?)");
if ($stmt->execute([$_SESSION['user_id'], $content, $image])) {
    echo json_encode(['success' => true, 'post_id' => $pdo->lastInsertId()]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to create post']);
}
?>