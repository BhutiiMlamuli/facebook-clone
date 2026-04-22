<?php
require_once 'config.php';

$stmt = $pdo->query("
    SELECT s.*, u.name, u.profile_pic 
    FROM stories s 
    JOIN users u ON s.user_id = u.id 
    WHERE s.created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR) 
    ORDER BY s.created_at DESC 
    LIMIT 5
");
$stories = $stmt->fetchAll();

foreach ($stories as &$story) {
    $story['user_avatar'] = $story['profile_pic'] ?: 'profile-pic.png';
}

echo json_encode($stories);
?>