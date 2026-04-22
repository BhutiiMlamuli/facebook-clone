#!/bin/bash

# Start MySQL service
sudo service mysql start

# Wait for MySQL to be ready
sleep 5

# Create database and import schema
sudo mysql -e "CREATE DATABASE IF NOT EXISTS socialbook;"
sudo mysql socialbook < database.sql

# Update database config for Codespaces
sed -i 's/$host = '\''localhost'\''/$host = '\''127.0.0.1'\''/g' api/config.php
sed -i 's/$username = '\''root'\''/$username = '\''root'\''/g' api/config.php
sed -i 's/$password = '\'''\''/$password = '\'''\''/g' api/config.php

# Create images directory if not exists
mkdir -p images

# Set permissions
chmod -R 755 .

echo "Setup complete! Start the server with: php -S 0.0.0.0:8000"