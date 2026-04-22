<?php
// Simple router to serve index.html
if (file_exists(__DIR__ . '/index.html')) {
    readfile(__DIR__ . '/index.html');
} else {
    echo "SocialBook is being set up. Please wait...";
}
?>