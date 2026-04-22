<?php
require_once 'config.php';

$data = json_decode(file_get_contents('php://input'), true);

$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if (empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Email and password required']);
    exit();
}

$stmt = $pdo->prepare("SELECT id, name, email, password, profile_pic, bio FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if ($user && password_verify($password, $user['password'])) {
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_name'] = $user['name'];
    $_SESSION['user_email'] = $user['email'];
    
    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'user' => [
            'id' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'profile_pic' => $user['profile_pic'] ?: 'profile-pic.png',
            'bio' => $user['bio']
        ]
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
}
?>