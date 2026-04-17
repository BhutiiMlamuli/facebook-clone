<?php
require_once 'config.php';

$stmt = $pdo->query("SELECT * FROM events WHERE event_date >= CURDATE() ORDER BY event_date ASC LIMIT 3");
$events = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($events);
?>