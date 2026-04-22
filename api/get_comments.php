<?php
require_once 'config.php';

$post_id = (int)$_GET['post_id'];
$stmt = $pdo->prepare("SELECT c.comment, c.created_at, u.name, u.profile_pic FROM comments c JOIN users u ON c.user_id = u.id WHERE c.post_id = ? ORDER BY c.created_at ASC");
$stmt->execute([$post_id]);
$comments = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($comments as &$c) {
    $c['user_avatar'] = $c['profile_pic'] ?: 'profile-pic.png';
    unset($c['profile_pic']);
}
echo json_encode($comments);
?>