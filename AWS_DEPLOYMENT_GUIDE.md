# AWS EC2 Production Deployment Guide 🚀☁️

This comprehensive guide outlines the exact, production-ready steps to deploy our Dockerized DDD Node.js + Express REST API (incorporating MongoDB, Zookeeper, and Apache Kafka) onto an AWS EC2 instance and make it publicly accessible to the world.

---

## 🏗️ System Architecture Overview

When deployed, the systems run inside isolated Docker containers connected by an internal virtual bridge network on your cloud server. The API port (`8000`) is mapped to the host, allowing secure external traffic to reach the REST controller endpoints.

```mermaid
graph TD
    Client[Postman / Public Client] -->|HTTP POST/GET Port 8000| API[DDD Express API Container]
    API -->|Read/Write| DB[(MongoDB Atlas Cloud)]
    API -->|Publish Event| Kafka[Apache Kafka Broker Container]
    Kafka -->|Coordinate| Zookeeper[ZooKeeper Coordinator Container]
    Kafka -->|Consume Event| EmailConsumer[Email Service Consumer]
    Kafka -->|Consume Event| NotificationConsumer[Notification Service Consumer]
    EmailConsumer -->|SMTP/TLS| Gmail[Gmail SMTP Service]
    NotificationConsumer -->|Native Fetch POST| Discord[Discord Webhook Notification]
```

---

## 🗺️ Phase 1: Launch your AWS EC2 Instance

1. **Log in to the AWS Console**: Access the [AWS Management Console](https://aws.amazon.com/) and navigate to the **EC2 Dashboard**.
2. **Launch Instance**: Click the orange **Launch Instance** button.
3. **Instance Details**:
   * **Name**: `ddd-microservice-server`
   * **OS Image (AMI)**: Choose **Ubuntu Server 22.04 LTS** (Free Tier eligible).
   * **Instance Type**: Select **t2.micro** (Free Tier eligible).
   * **Key Pair**: Click **Create new key pair**. Set name to `ddd-key`, download the `.pem` file, and keep it safe in your local machine!
4. **Network Settings (Security Group - CRITICAL)**:
   * Select **Create security group**.
   * Add the following **Inbound Security Group Rules**:
     
     | Type | Port Range | Source | Description |
     | :--- | :--- | :--- | :--- |
     | **SSH** | `22` | `My IP` or `Anywhere` | For connecting to your server terminal |
     | **Custom TCP** | `8000` | `Anywhere-IPv4` (`0.0.0.0/0`) | **Public access to your Node.js API** |

5. **Launch**: Click **Launch Instance** in the bottom-right corner.

---

## 🔑 Phase 2: Connect to Your AWS Server via SSH

Open a terminal (Git Bash, macOS Terminal, Command Prompt, or PowerShell) on your local computer in the folder where your `ddd-key.pem` is located, and run:

```bash
# 1. Set secure read-only permission for the key (Mac/Linux only)
chmod 400 ddd-key.pem

# 2. SSH into your Ubuntu EC2 Instance (Replace with your actual EC2 Public IP)
ssh -i ddd-key.pem ubuntu@<YOUR_EC2_PUBLIC_IP>
```

---

## 🐳 Phase 3: Install Docker and Docker Compose on EC2

Once logged into your Ubuntu EC2 console terminal, copy and paste the following block of commands to automatically install the complete Docker suite:

```bash
# Update Ubuntu package lists
sudo apt-get update

# Install prerequisites
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository to APT sources
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io

# Enable and start Docker service
sudo systemctl enable docker
sudo systemctl start docker

# Install Docker Compose Plugin v2
sudo mkdir -p /usr/local/lib/docker/cli-plugins/
sudo curl -SL https://github.com/docker/compose/releases/download/v2.20.2/docker-compose-linux-x86_64 -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# Verify success
docker --version
docker compose version
```

---

## 📂 Phase 4: Clone the Project Repository

Transfer your code cleanly using **Git**:

1. Push your local workspace code to your Git Repository (e.g. GitHub).
2. On the AWS EC2 SSH terminal, run:
   ```bash
   git clone <YOUR_GITHUB_REPOSITORY_URL>
   cd <YOUR_CLONED_PROJECT_DIRECTORY>
   ```

---

## ⚙️ Phase 5: Create and Configure the `.env` File on EC2

To protect your secrets, the `.env` file is ignored by Git. We must create it directly on the production server:

1. Open a new file editor:
   ```bash
   nano .env
   ```
2. Paste the following configuration, ensuring you use your correct MongoDB URL, Gmail SMTP Credentials, and Discord Webhook:
   ```env
   PORT=8000
   MONGODB_URI=mongodb+srv://yasoelabasy_db_user:NKvP2YiZozFGgX4h@cluster0.ip810oz.mongodb.net/DDDTask?retryWrites=true&w=majority&appName=Cluster0
   KAFKA_BROKERS=localhost:9092
   KAFKA_CLIENT_ID=post-service
   KAFKA_GROUP_ID=post-group

   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=yasminelabasy58@gmail.com
   SMTP_PASS=gqlzydnycoyhjpzz
   EMAIL_FROM="LMS Support <yasminelabasy58@gmail.com>"

   DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/1505725105186013217/f9OciKz3qk6o2bC5L-So9rr2Eqploc8OzffSKhlSFI0pfzWJ1RPM0LszWH_LeUP6zhQe
   ```
3. Press `Ctrl+O` then `Enter` to save, and `Ctrl+X` to exit nano.

---

## ⚡ Phase 6: Start the Docker Stack in the Background

Run Docker Compose with the detached (`-d`) flag so that your server continues running even if you close the terminal or log out of SSH:

```bash
sudo docker compose up --build -d
```

---

## 🎯 Phase 7: Verification and Live Testing

### 1. Verify running containers
Run `sudo docker compose ps` to ensure all 4 services are successfully up and healthy:
```text
NAME                IMAGE                             COMMAND                  SERVICE             CREATED             STATUS              PORTS
ddd-api-service     dddtask-api                       "docker-entrypoint.s…"   api                 5 seconds ago       Up 5 seconds        0.0.0.0:8000->8000/tcp
ddd-kafka           confluentinc/cp-kafka:7.3.0       "/etc/confluent/dock…"   kafka               5 seconds ago       Up 5 seconds        0.0.0.0:9092->9092/tcp
ddd-mongodb         mongo:6.0                         "docker-entrypoint.s…"   mongodb             5 seconds ago       Up 5 seconds        0.0.0.0:27017->27017/tcp
ddd-zookeeper       confluentinc/cp-zookeeper:7.3.0   "/etc/confluent/dock…"   zookeeper           5 seconds ago       Up 5 seconds        2181/tcp
```

### 2. Access the landing page publicly
Open your web browser and navigate to your EC2 public URL:
```text
http://<YOUR_EC2_PUBLIC_IP>:8000/
```
You will instantly receive the styled JSON API landing page!

### 3. Send a POST Request via Postman
* **Method**: `POST`
* **URL**: `http://<YOUR_EC2_PUBLIC_IP>:8000/api/posts`
* **Headers**: `Content-Type: application/json`
* **Body (JSON)**:
  ```json
  {
    "title": "Hello Cloud from AWS EC2!",
    "body": "This post was created publicly over the internet. Mapped to MongoDB, dispatched via Kafka, and sent instantly to Gmail and Discord!"
  }
  ```

Hit **Send**! You will receive the immediate JSON success payload, and your Discord channel and Gmail inbox will fire live notifications immediately! 🎉☁️
