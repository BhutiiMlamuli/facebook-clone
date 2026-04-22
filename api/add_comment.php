<?php
require_once 'config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);
$postId = (int)($data['post_id'] ?? 0);
$comment = trim($data['comment'] ?? '');

if (!$postId || empty($comment)) {
    echo json_encode(['success' => false, 'message' => 'Invalid comment data']);
    exit();
}

$stmt = $pdo->prepare("INSERT INTO comments (post_id, user_id, comment) VALUES (?, ?, ?)");

if ($stmt->execute([$postId, $_SESSION['user_id'], $comment])) {
    $commentId = $pdo->lastInsertId();
    
    // Get the comment with user info
    $stmt = $pdo->prepare("
        SELECT c.*, u.name, u.profile_pic 
        FROM comments c 
        JOIN users u ON c.user_id = u.id 
        WHERE c.id = ?
    ");
    $stmt->execute([$commentId]);
    $newComment = $stmt->fetch();
    $newComment['user_avatar'] = $newComment['profile_pic'] ?: 'profile-pic.png';
    
    echo json_encode([
        'success' => true,
        'message' => 'Comment added',
        'comment' => $newComment
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to add comment']);
}
?>