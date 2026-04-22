<?php
require_once 'config.php';

$postId = (int)($_GET['post_id'] ?? 0);

if (!$postId) {
    echo json_encode([]);
    exit();
}

$stmt = $pdo->prepare("
    SELECT c.*, u.name, u.profile_pic 
    FROM comments c 
    JOIN users u ON c.user_id = u.id 
    WHERE c.post_id = ? 
    ORDER BY c.created_at ASC
");
$stmt->execute([$postId]);
$comments = $stmt->fetchAll();

foreach ($comments as &$comment) {
    $comment['user_avatar'] = $comment['profile_pic'] ?: 'profile-pic.png';
    unset($comment['profile_pic']);
}

echo json_encode($comments);
?>