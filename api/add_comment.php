<?php
require_once 'config.php';

$data = json_decode(file_get_contents('php://input'), true);
$post_id = (int)$data['post_id'];
$comment = trim($data['comment'] ?? '');

if (!$comment) {
    echo json_encode(['success' => false, 'message' => 'Comment cannot be empty']);
    exit;
}

$stmt = $pdo->prepare("INSERT INTO comments (post_id, user_id, comment) VALUES (?, ?, ?)");
if ($stmt->execute([$post_id, $_SESSION['user_id'], $comment])) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to add comment']);
}
?>