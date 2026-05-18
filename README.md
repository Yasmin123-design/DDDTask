# Domain-Driven Design (DDD) Event-Driven Posts Microservice

A clean, robust, enterprise-grade backend system demonstrating modern software engineering practices, built using **Node.js, Express, MongoDB, Apache Kafka, and Docker**. The project strictly adheres to **Domain-Driven Design (DDD)** boundaries, decoupling core business logic from framework and database infrastructures, and utilizes **Event-Driven Architecture (EDA)**.

---

## 🏗️ Architectural Design (DDD Layers)

This application is cleanly segregated into four isolated layers to guarantee maintainability, high testability, and swap-ability of database and queuing vendors.

```
                  ┌─────────────────────────────────────┐
                  │              API Layer              │  (HTTP Controllers, Routers, Middlewares)
                  └──────────────────┬──────────────────┘
                                     │ (Invokes)
                  ┌──────────────────▼──────────────────┐
                  │          Application Layer          │  (Business Use Cases, DTOs, Abstract Interfaces)
                  └──────────────────┬──────────────────┘
                                     │ (Implements / Injects)
 ┌───────────────────────────────────┼───────────────────────────────────┐
 │                                   │                                   │
┌▼───────────────────────────────────▼──┐┌───────────────────────────────▼──┐
│             Domain Layer              ││       Infrastructure Layer       │  (MongoDB Mongoose Repositories,
│ (Entities, Aggregates, Domain Events) ││ (Kafka Event Brokers, DI Engine) │   Kafka Producers & Consumers)
└───────────────────────────────────────┘└──────────────────────────────────┘
```

### 📁 Directory Layout

```
src/
├── api/
│   ├── controllers/      # Handles HTTP request/response payloads
│   ├── routes/           # Mounts API endpoints to controllers
│   ├── middlewares/      # Global central error formatting middleware
│   ├── utils/            # ApiResponse standardizer (unified JSON payloads)
│   └── app.js            # Instantiates Express, CORS, routing, and middlewares
├── domain/
│   ├── entities/         # Post Aggregate Root & private business validations
│   ├── events/           # PostCreatedEvent domain object
│   └── repositories/     # IPostRepository contract/interface
├── application/
│   ├── use-cases/        # Orchestrators (CreatePost, GetPost, ListPosts)
│   ├── dtos/             # PostDTO data formatting boundary protectors
│   └── interfaces/       # IEventPublisher abstract contract
├── infrastructure/
│   ├── database/         # Mongoose models, MongoPostRepository, Mapper, Connection
│   ├── messaging/        # KafkaProducer setup, KafkaEventPublisher, KafkaEventConsumer
│   └── di/               # container.js (Dependency Injection Singletons wireup)
├── config/
│   └── environment.js    # Decoupled dotenv configs
├── index.js              # Application entry bootstrap & graceful shutdown orchestrator
└── package.json          # Dependency manifests (configured for modern ES Modules)
```

---

## 🛠️ Technology Stack

- **Runtime**: Node.js (v20+ alpine)
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ORM)
- **Queue/Broker**: Apache Kafka (`kafkajs` client)
- **Containerization**: Docker & Docker Compose v3.8
- **Identifiers**: UUID v4 (Domain-generated IDs mapped to MongoDB `_id` strings)

---

## 🚀 Running the Project

### Method A: Docker Compose (Highly Recommended - Single Command)

This command automatically builds our Node API container, spins up MongoDB, downloads Zookeeper, launches Kafka, registers the network bridges, connects the producer, and starts our background event consumer!

1. Clone or copy the files into your directory.
2. In the root directory, run:
   ```bash
   docker-compose up --build
   ```
3. Watch the logs! You will see:
   - MongoDB database connection establish.
   - Kafka connection establish.
   - Background consumer subscribe to topic `post-created`.
   - Express server listening on `http://localhost:8000`.

To teardown the container stack:
```bash
docker-compose down -v
```

---

### Method B: Running Locally (Non-Dockerized)

Ensure you have a local MongoDB server running on `mongodb://localhost:27017` and a local Kafka broker on `localhost:9092`.

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create your `.env` file from the template:
   ```bash
   cp .env.example .env
   ```
3. Start the application in hot-reloading development mode:
   ```bash
   npm run dev
   ```

---

## 📡 REST API Documentation

All HTTP response payloads return a unified JSON response schema handled by `ApiResponse`:

```json
{
  "status": "success",
  "results": 1, // Only present when returning arrays
  "data": { ... }
}
```

### 1. Create Post
- **Endpoint**: `POST /api/posts`
- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "title": "Clean Coding with DDD",
    "body": "This post is saved inside MongoDB and successfully published to Kafka topic!"
  }
  ```
- **Response (`201 Created`)**:
  ```json
  {
    "status": "success",
    "data": {
      "id": "e2a6d71c-43df-498c-850d-8386de6640ab",
      "title": "Clean Coding with DDD",
      "body": "This post is saved inside MongoDB and successfully published to Kafka topic!",
      "createdAt": "2026-05-18T00:30:15.123Z"
    }
  }
  ```

### 2. Get Post by ID
- **Endpoint**: `GET /api/posts/:id`
- **Response (`200 OK`)**:
  ```json
  {
    "status": "success",
    "data": {
      "id": "e2a6d71c-43df-498c-850d-8386de6640ab",
      "title": "Clean Coding with DDD",
      "body": "This post is saved inside MongoDB and successfully published to Kafka topic!",
      "createdAt": "2026-05-18T00:30:15.123Z"
    }
  }
  ```

### 3. List All Posts
- **Endpoint**: `GET /api/posts`
- **Response (`200 OK`)**:
  ```json
  {
    "status": "success",
    "results": 1,
    "data": [
      {
        "id": "e2a6d71c-43df-498c-850d-8386de6640ab",
        "title": "Clean Coding with DDD",
        "body": "This post is saved inside MongoDB and successfully published to Kafka topic!",
        "createdAt": "2026-05-18T00:30:15.123Z"
      }
    ]
  }
  ```

---

## ⚡ Event-Driven Flow (Kafka Visual Logs)

When `POST /api/posts` is executed successfully:
1. `CreatePostUseCase` instantiates `Post.create()`, registering `PostCreatedEvent` on the aggregate root.
2. The post is saved to Mongoose MongoDB.
3. The use case extracts events via `post.pullDomainEvents()`.
4. `KafkaEventPublisher` serializes the payload to JSON and dispatches it to Kafka broker on topic `post-created`.
5. Simultaneously, our background listener `KafkaEventConsumer` captures the message and outputs a beautiful visual log in the Docker console:

```
======================================================
📥 [Kafka Consumer] NEW EVENT PICKED UP FROM BROKER
Topic: "post-created" | Partition: 0 | Offset: 14
------------------------------------------------------
Event Name : PostCreated
Occurred On: 2026-05-18T00:30:15.123Z
Post ID    : e2a6d71c-43df-498c-850d-8386de6640ab
Post Title : Clean Coding with DDD
Post Body  : This post is saved inside MongoDB and successfully published to Kafka topic!
======================================================
```

---

## ☁️ Cloud Deployment Walkthrough (AWS EC2)

Deploying a multi-container Docker compose system on the free tier of a Cloud Provider (AWS EC2) is highly secure, fast, and stable.

### Step 1: Spin up an AWS EC2 Instance
1. Log in to AWS Management Console.
2. Navigate to **EC2** -> **Launch Instance**.
3. Choose **Ubuntu Server 22.04 LTS** (eligible for Free Tier, `t2.micro` or `t3.micro`).
4. Generate or select a Key Pair (`.pem`) to access the instance via SSH.
5. In **Network Settings (Security Group)**:
   - Allow **SSH** (Port 22) for administration.
   - Allow **HTTP (Port 80)** and custom port **8000** for public REST API consumption.
   - Keep MongoDB ports (`27017`) and Kafka ports (`9092`/`29092`) **entirely closed** to the public internet. They only communicate securely inside Docker's virtual network bridge!

### Step 2: Install Docker and Docker Compose on Ubuntu
Connect to your EC2 instance via SSH:
```bash
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip
```

Run the installation script:
```bash
# Update package list
sudo apt-get update -y

# Install Docker dependencies
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker’s official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Set up stable Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io

# Enable Docker on startup
sudo systemctl enable docker
sudo systemctl start docker

# Add Ubuntu user to Docker group (removes sudo requirement for docker commands)
sudo usermod -aG docker ubuntu
newgrp docker

# Download and install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Step 3: Clone Code and Boot the Application Stack
1. Clone your GitHub repository on the EC2 server:
   ```bash
   git clone <YOUR_GITHUB_REPO_URL> ddd-backend
   cd ddd-backend
   ```
2. Create the production `.env` file:
   ```bash
   # Create production configs pointing to internal docker services
   echo "PORT=8000
   MONGODB_URI=mongodb://mongodb:27017/ddd_task
   KAFKA_BROKERS=kafka:29092
   KAFKA_CLIENT_ID=post-service
   KAFKA_GROUP_ID=post-group" > .env
   ```
3. Run the container stack in detached background mode:
   ```bash
   docker-compose up -d --build
   ```
4. Verify all containers are running successfully:
   ```bash
   docker-compose ps
   ```
5. Your REST API is now officially live and publicly accessible at:
   `http://<YOUR_EC2_PUBLIC_IP>:8000`

---

## 📁 Submission Assets

1. **Postman Collection**: Located in the root folder as `Posts_API.postman_collection.json`. Import it directly to run the endpoints.
2. **Docker Compose Orchestration**: Configured completely inside `docker-compose.yml` and optimized in `Dockerfile`.

---

## 📹 Video Walkthrough Outline (Voice Guide)

To record a high-scoring 5-minute video, follow this professional narration structure:

1. **Introduction (30s)**:
   - *"Hello! Today I will show you my DDD-structured, Event-Driven Backend System built on Node.js, Express, MongoDB, Apache Kafka, and Docker."*
   - Show your IDE workspace.
2. **Project Architecture explanation (1m 30s)**:
   - Explain your folders: *Domain*, *Application*, *Infrastructure*, *API*.
   - Open `domain/entities/post.entity.js` -> show validation rules and `PostCreatedEvent` aggregate registration.
   - Open `application/use-cases/create-post.usecase.js` -> highlight how it uses abstract interfaces (`IPostRepository` and `IEventPublisher`) showing clean boundary separation.
   - Open `infrastructure/di/container.js` -> show how Mongoose and Kafka are injected cleanly.
3. **Show Local Docker-Compose Run (1m)**:
   - Run `docker-compose up` on your local terminal.
   - Point out how Zookeeper, Kafka, MongoDB, and API server boot in sequence.
   - Point out the active listener log: `🎧 [Kafka Consumer] Listening on topic "post-created"`.
4. **Trigger REST Endpoints via Postman (1m)**:
   - Open Postman, show the imported collection.
   - Execute `POST /api/posts` with JSON body payload.
   - Show the `201 Created` response.
   - **CRITICAL MOMENT**: Switch immediately to your Docker Compose terminal and highlight the log generated by the background Kafka Consumer capturing the newly published event!
   - Execute `GET /api/posts` and `GET /api/posts/:id` to show successful retrievals from MongoDB.
5. **Show Live Deployed System (1m)**:
   - Open your web browser or Postman and hit `http://<YOUR_EC2_PUBLIC_IP>:8000/`.
   - Show the successful health check JSON returning public success.
   - Wrap up: *"The entire stack is containerized and deployed on AWS EC2, isolated securely inside internal network bridges. Thank you!"*
