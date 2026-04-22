<?php
require_once 'config.php';

$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = 5;
$offset = ($page - 1) * $limit;

$userId = $_SESSION['user_id'] ?? 0;

$sql = "
    SELECT 
        p.*,
        u.name,
        u.profile_pic,
        COUNT(DISTINCT l.id) as like_count,
        COUNT(DISTINCT c.id) as comment_count,
        EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?) as user_liked
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN likes l ON p.id = l.post_id
    LEFT JOIN comments c ON p.id = c.post_id
    GROUP BY p.id
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
";

$stmt = $pdo->prepare($sql);
$stmt->execute([$userId, $limit, $offset]);
$posts = $stmt->fetchAll();

// Format response
foreach ($posts as &$post) {
    $post['user_avatar'] = $post['profile_pic'] ?: 'profile-pic.png';
    $post['liked_by_user'] = (bool)$post['user_liked'];
    unset($post['profile_pic'], $post['user_liked']);
}

echo json_encode($posts);
?>