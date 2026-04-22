<?php
require_once 'config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);
$postId = (int)($data['post_id'] ?? 0);

if (!$postId) {
    echo json_encode(['success' => false, 'message' => 'Invalid post ID']);
    exit();
}

// Check if already liked
$stmt = $pdo->prepare("SELECT id FROM likes WHERE post_id = ? AND user_id = ?");
$stmt->execute([$postId, $_SESSION['user_id']]);
$existing = $stmt->fetch();

if ($existing) {
    // Unlike
    $stmt = $pdo->prepare("DELETE FROM likes WHERE post_id = ? AND user_id = ?");
    $stmt->execute([$postId, $_SESSION['user_id']]);
    $liked = false;
} else {
    // Like
    $stmt = $pdo->prepare("INSERT INTO likes (post_id, user_id) VALUES (?, ?)");
    $stmt->execute([$postId, $_SESSION['user_id']]);
    $liked = true;
}

// Get updated count
$stmt = $pdo->prepare("SELECT COUNT(*) FROM likes WHERE post_id = ?");
$stmt->execute([$postId]);
$count = (int)$stmt->fetchColumn();

echo json_encode([
    'success' => true,
    'liked' => $liked,
    'count' => $count
]);
?>