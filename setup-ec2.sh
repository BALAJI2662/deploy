#!/bin/bash
set -e

echo "============================================="
echo "🚀 EC2 Setup: Course Management System (Docker)"
echo "============================================="

# 1. Update and install basic dependencies
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y curl git build-essential ca-certificates gnupg ufw

# 2. Setup 2GB Swap Memory (Crucial for t2/t3.micro instances)
if [ ! -f /swapfile ]; then
    echo "💾 Creating 2GB swap memory..."
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

# 3. Install Docker and Docker Compose Plugin
echo "🐳 Installing Docker & Docker Compose..."
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 4. Enable Docker without sudo for ubuntu user
sudo usermod -aG docker ubuntu
sudo systemctl enable docker
sudo systemctl start docker

# 5. Configure Firewall (UFW)
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable || true

echo "============================================="
echo "✅ EC2 Docker Setup Completed Successfully!"
echo "💡 Note: Log out and log back in or run 'newgrp docker' to use docker without sudo."
echo "============================================="
