<?php
require_once 'config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$action = $data['action'] ?? '';
$receiver_id = (int)$data['receiver_id'] ?? 0;

if ($action === 'send') {
    $stmt = $pdo->prepare("INSERT IGNORE INTO friend_requests (sender_id, receiver_id) VALUES (?, ?)");
    $stmt->execute([$_SESSION['user_id'], $receiver_id]);
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false]);
}
?>