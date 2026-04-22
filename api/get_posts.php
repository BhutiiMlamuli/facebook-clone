<?php
require_once 'config.php';

$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = 5;
$offset = ($page - 1) * $limit;

$sql = "SELECT p.*, u.name, u.profile_pic,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
        FROM posts p
        JOIN users u ON p.user_id = u.id
        ORDER BY p.created_at DESC
        LIMIT $limit OFFSET $offset";

$stmt = $pdo->query($sql);
$posts = $stmt->fetchAll(PDO::FETCH_ASSOC);

$userId = $_SESSION['user_id'];
foreach ($posts as &$post) {
    $stmt = $pdo->prepare("SELECT 1 FROM likes WHERE post_id = ? AND user_id = ?");
    $stmt->execute([$post['id'], $userId]);
    $post['liked_by_user'] = $stmt->fetch() ? true : false;
    $post['user_avatar'] = $post['profile_pic'] ?: 'profile-pic.png';
    unset($post['profile_pic']);
}

echo json_encode($posts);
?>