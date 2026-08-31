#!/bin/bash
set -e

echo "============================================="
echo "🚀 EC2 Setup: Course Management System"
echo "============================================="

# 1. Update and install basic dependencies
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y curl git nginx build-essential

# 2. Install Node.js (v20 LTS)
echo "📦 Installing Node.js LTS (v20)..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify versions
node -v
npm -v

# 3. Install PM2 globally
echo "📦 Installing PM2..."
sudo npm install -g pm2

# 4. Configure PM2 startup on system boot
pm2 startup systemd -u ubuntu --hp /home/ubuntu || true

# 5. Configure Nginx
echo "⚙️ Configuring Nginx..."
sudo cp /home/ubuntu/Course_management_system/nginx-course-management.conf /etc/nginx/sites-available/course_management
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/course_management /etc/nginx/sites-enabled/course_management
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

echo "============================================="
echo "✅ EC2 Server Setup Completed Successfully!"
echo "============================================="
