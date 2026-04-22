<?php
require_once 'config.php';

$data = json_decode(file_get_contents('php://input'), true);
$post_id = (int)$data['post_id'];

$stmt = $pdo->prepare("SELECT id FROM likes WHERE post_id = ? AND user_id = ?");
$stmt->execute([$post_id, $_SESSION['user_id']]);
$exists = $stmt->fetch();

if ($exists) {
    $stmt = $pdo->prepare("DELETE FROM likes WHERE post_id = ? AND user_id = ?");
    $stmt->execute([$post_id, $_SESSION['user_id']]);
    $liked = false;
} else {
    $stmt = $pdo->prepare("INSERT INTO likes (post_id, user_id) VALUES (?, ?)");
    $stmt->execute([$post_id, $_SESSION['user_id']]);
    $liked = true;
}

$stmt = $pdo->prepare("SELECT COUNT(*) FROM likes WHERE post_id = ?");
$stmt->execute([$post_id]);
$count = $stmt->fetchColumn();

echo json_encode(['success' => true, 'liked' => $liked, 'count' => $count]);
?>