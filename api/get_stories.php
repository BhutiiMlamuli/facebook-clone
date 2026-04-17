<?php
require_once 'config.php';

$stmt = $pdo->query("SELECT s.*, u.name FROM stories s JOIN users u ON s.user_id = u.id WHERE s.created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR) ORDER BY s.created_at DESC LIMIT 5");
$stories = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($stories);
?>