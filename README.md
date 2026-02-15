# User Management System

A robust, production-ready authentication and user management system built with Node.js, featuring email verification, JWT-based authentication, cloud-managed databases, and event-driven architecture.

## 🌟 Features

- **User Authentication & Authorization**
  - JWT-based authentication with access and refresh tokens
  - Email verification via OTP
  - Role-based access control (User/Admin)
  - Secure password hashing with bcrypt

- **Email System**
  - OTP verification emails via Gmail
  - Welcome emails via Kafka event streaming
  - Asynchronous email processing with Kafka workers

- **Cloud-Managed Infrastructure**
  - MongoDB Atlas for database
  - Upstash Redis for caching and session management
  - Aiven Kafka for event streaming
  - BetterStack for centralized logging

- **Event-Driven Architecture**
  - Aiven Kafka integration for asynchronous task processing
  - Worker threads for email processing
  - Event-based communication between services

- **Security**
  - Rate limiting (100 requests per 15 minutes)
  - Helmet.js for HTTP headers security
  - XSS, NoSQL, and SQL injection protection
  - HPP (HTTP Parameter Pollution) protection
  - CORS configuration
  - Request sanitization

- **Monitoring & Logging**
  - Structured logging with Pino
  - BetterStack integration for centralized logging and monitoring
  - Real-time log streaming and analysis
  - Health check endpoint

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Technologies](#technologies)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🔧 Prerequisites

Before running this project, ensure you have the following:

- **Node.js**: v22.14 or higher
- **npm**: v9.x or higher
- **Cloud Service Accounts** (all free tiers available):
  - MongoDB Atlas account (database)
  - Upstash account (Redis)
  - Aiven account (Kafka)
  - BetterStack account (logging - optional)
  - Gmail account with App Password (email sending)

## 🚀 Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/nakul-3205/Enginow-Project-1-.git
cd Enginow-Project-1-
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Set Up Cloud Services

#### 3.1 MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and cluster
3. Create a database user
4. Whitelist your IP address (or use `0.0.0.0/0` for development)
5. Get your connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/enginow-users
   ```

#### 3.2 Upstash Redis Setup

1. Go to [Upstash](https://upstash.com/)
2. Create a free account
3. Create a new Redis database
4. Copy the connection string:
   ```
   rediss://default:password@endpoint.upstash.io:6379
   ```

#### 3.3 Aiven Kafka Setup

1. Go to [Aiven](https://aiven.io/)
2. Create a free account
3. Create a new Kafka service
4. Download the following certificates:
   - `ca.pem` (CA Certificate)
   - `service.cert` (Service Certificate)
   - `service.key` (Service Key)
5. Create a `cert/` folder in your project root
6. Place all three certificate files in the `cert/` folder:
   ```
   Enginow-Project-1-/
   ├── cert/
   │   ├── ca.pem
   │   ├── service.cert
   │   └── service.key
   ```
7. Get your Kafka broker URL from Aiven dashboard (format: `kafka-xxxxx.aivencloud.com:12345`)

#### 3.4 Gmail App Password Setup

1. Go to your [Google Account](https://myaccount.google.com/)
2. Enable 2-Factor Authentication
3. Go to Security → 2-Step Verification → App Passwords
4. Generate a new app password for "Mail"
5. Copy the 16-character password

#### 3.5 BetterStack Setup (Optional)

1. Go to [BetterStack](https://betterstack.com/)
2. Create a free account
3. Go to Logs → Sources
4. Create a new source (Node.js)
5. Copy your Source Token
6. See [BETTERSTACK_SETUP.md](./BETTERSTACK_SETUP.md) for detailed guide

### Step 4: Configure Environment Variables

Create a `.env` file in the project root:

```env
# Server Configuration
PORT=3000
NODE_ENV=DEVELOPMENT

# Database (MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/enginow-users?retryWrites=true&w=majority

# Redis (Upstash)
REDIS_URL=rediss://default:your_password@your_endpoint.upstash.io:6379

# Kafka (Aiven) - NOTE: Certificates are read from cert/ folder
KAFKA_BROKER=kafka-xxxxx.aivencloud.com:12345

# Kafka Certificates (for production deployment - leave empty for local development)
KAFKA_CA_CERT=
KAFKA_SERVICE_CERT=
KAFKA_SERVICE_KEY=

# Email Configuration (Gmail)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password
GMAIL_APP_NAME=Enginow Auth System

# JWT Secrets (generate strong random strings)
JWT_ACCESS_SECRET=your_access_token_secret_key_here_min_32_chars
JWT_REFRESH_SECRET=your_refresh_token_secret_key_here_min_32_chars

# Admin Configuration
ADMIN_SIGNUP_SECRET=your_admin_secret_key_here

# BetterStack Logging (Optional)
BETTER_STACK_TOKEN=your_betterstack_source_token_here
BETTER_STACK_HOST=https://in.logs.betterstack.com
```

**Important Notes:**
- For **local development**: Kafka certificates are read from the `cert/` folder
- For **production deployment** (Render): Certificates must be added as environment variables (see [Deployment Guide](#deployment))
- Generate strong random strings for JWT secrets: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### Step 5: Add Certificates to .gitignore

Make sure your `.gitignore` includes:

```
# Certificates
cert/
*.pem
*.cert
*.key

# Environment
.env
```

## 💻 Usage

### Start the Application

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

That's it! The application will:
- ✅ Connect to MongoDB Atlas
- ✅ Connect to Upstash Redis
- ✅ Initialize Aiven Kafka producer
- ✅ Start the Kafka consumer worker for emails
- ✅ Start the Express server on the specified port

### Access the Application

- **API Base URL**: http://localhost:3000/api/v1
- **Health Check**: http://localhost:3000/health
- **API Documentation**: http://localhost:3000/api-docs (if Swagger is configured)

## 📚 API Documentation

For complete API documentation, see:
- [API_TESTING_GUIDE.md](./API_TESTING_GUIDE.md) - Testing examples
- [openapi.yaml](./docs/openapi.yaml) - OpenAPI specification
- [Postman Collection](./postman_collection.json) - Import into Postman

### Quick API Overview

#### Public Endpoints (No Authentication)

**1. User Signup**
```bash
POST /api/v1/auth/signup
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "roleRequested": "user"
}
```

**2. Verify OTP**
```bash
POST /api/v1/auth/verify
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456"
}
```

**3. Login**
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**4. Refresh Token**
```bash
POST /api/v1/auth/refresh-token
Content-Type: application/json

{
  "token": "your_refresh_token"
}
```

#### Protected Endpoints (Require Authentication)

**5. Get Current User**
```bash
GET /api/v1/auth/me
Authorization: Bearer <access_token>
```

**6. Logout**
```bash
POST /api/v1/auth/logout
Authorization: Bearer <access_token>
```

**7. Update User**
```bash
PUT /api/v1/auth/users/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "username": "newusername"
}
```

#### Admin-Only Endpoints

**8. List All Users**
```bash
GET /api/v1/auth/users?page=1&limit=10
Authorization: Bearer <admin_access_token>
```

**9. Delete User**
```bash
DELETE /api/v1/auth/users/:id
Authorization: Bearer <admin_access_token>
```

### Response Format

All responses follow this structure:

**Success Response:**
```json
{
  "statusCode": 200,
  "data": { /* response data */ },
  "message": "Operation successful",
  "success": true
}
```

**Error Response:**
```json
{
  "statusCode": 400,
  "data": null,
  "message": "Error message",
  "success": false,
  "errors": []
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## 📁 Project Structure

```
Enginow-Project-1-/
├── cert/                      # Kafka SSL certificates (not in git)
│   ├── ca.pem
│   ├── service.cert
│   └── service.key
├── docs/                      # Documentation
│   └── openapi.yaml          # OpenAPI specification
├── src/
│   ├── config/
│   │   ├── db.js             # MongoDB Atlas connection
│   │   ├── redis.js          # Upstash Redis client
│   │   └── kafka.js          # Aiven Kafka configuration
│   ├── controllers/
│   │   └── auth.controller.js # Authentication business logic
│   ├── middleware/
│   │   ├── auth.middleware.js # JWT verification & authorization
│   │   └── error.middleware.js# Global error handler
│   ├── models/
│   │   └── user.model.js     # User schema and methods
│   ├── routes/
│   │   └── auth.route.js     # API route definitions
│   ├── utils/
│   │   ├── ApiError.js       # Custom error class
│   │   ├── ApiResponse.js    # Standardized response format
│   │   ├── asyncHandler.js   # Async error wrapper
│   │   ├── logger.js         # Pino logger with BetterStack
│   │   ├── mail.util.js      # Gmail email utilities
│   │   ├── otp.util.js       # OTP generation/verification
│   │   └── token.util.js     # JWT token generation
│   ├── workers/
│   │   └── auth.worker.js    # Kafka consumer for email events
│   └── app.js                # Express app configuration
├── index.js                   # Application entry point
├── worker-entry.js           # Worker thread entry point
├── .env                      # Environment variables (not in git)
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## 🛠️ Technologies

### Core
- **Node.js v22.14** - Runtime environment
- **Express.js** - Web framework
- **MongoDB Atlas** - Cloud-hosted database
- **Mongoose** - MongoDB ODM

### Authentication & Security
- **jsonwebtoken** - JWT implementation
- **bcryptjs** - Password hashing
- **helmet** - Security headers
- **cors** - Cross-origin resource sharing
- **hpp** - HTTP parameter pollution protection
- **perfect-express-sanitizer** - Input sanitization
- **express-rate-limit** - Rate limiting

### Cloud Infrastructure
- **MongoDB Atlas** - Managed MongoDB hosting
- **Upstash Redis** - Serverless Redis for caching
- **Aiven Kafka** - Managed Kafka for event streaming

### Email
- **nodemailer** - Email sending via Gmail
- **mailgen** - Email template generation

### Logging & Monitoring
- **pino** - Fast JSON logger
- **pino-pretty** - Pretty print for development
- **@logtail/pino** - BetterStack integration
- **morgan** - HTTP request logger

### Development
- **nodemon** - Auto-restart during development
- **dotenv** - Environment variable management

## 🔒 Security Features

1. **Rate Limiting**: 100 requests per 15 minutes per IP
2. **Password Hashing**: bcrypt with salt rounds of 10
3. **JWT Authentication**: 
   - Access tokens: 15 minutes expiry
   - Refresh tokens: 7 days expiry
4. **Input Sanitization**: XSS, NoSQL, and SQL injection protection
5. **CORS**: Configured for specific origins
6. **Helmet**: Security headers
7. **Request Size Limiting**: 10kb limit on JSON and URL-encoded data
8. **SSL/TLS**: Secure connections to all cloud services

## 🔄 Event Flow

### User Signup Flow
```
1. User submits signup
2. Validate input
3. Create user in MongoDB Atlas
4. Generate 6-digit OTP
5. Store OTP in Upstash Redis (5 min expiry)
6. Send OTP email via Gmail
7. Return success response with userId
```

### Email Verification Flow
```
1. User submits OTP
2. Verify OTP from Upstash Redis
3. Update user as verified in MongoDB
4. Publish welcome email event to Aiven Kafka
5. Generate JWT tokens
6. Store refresh token in Upstash Redis (7 days)
7. Return tokens
```

### Kafka Email Worker
```
1. Kafka consumer listens to 'auth-events' topic
2. Receives SEND_WELCOME_EMAIL event
3. Sends welcome email via Gmail asynchronously
4. Logs success/failure to BetterStack
```

## 🧪 Development

### Running in Development Mode

```bash
npm run dev
```

This uses nodemon for auto-reload on file changes.

### Development Workflow

1. Make changes to code
2. Nodemon automatically restarts the server
3. Test endpoints using:
   - Postman (import `postman_collection.json`)
   - cURL commands
   - Swagger UI at `/api-docs`

### Adding New Routes

1. Create controller in `src/controllers/`
2. Define routes in `src/routes/`
3. Register routes in `src/app.js`

Example:
```javascript
// src/routes/example.route.js
import { Router } from 'express';
import exampleController from '../controllers/example.controller.js';

const router = Router();
router.get('/', exampleController.list);

export default router;
```

### Environment-Specific Behavior

The app automatically adjusts based on `NODE_ENV`:

**Development (`NODE_ENV=DEVELOPMENT`):**
- Reads Kafka certs from `cert/` folder
- Pretty-printed logs
- Morgan HTTP logging enabled
- Detailed error messages

**Production (`NODE_ENV=PRODUCTION`):**
- Reads Kafka certs from environment variables
- Writes certs to `/tmp/certs` temporarily
- JSON-formatted logs
- Concise error messages
- BetterStack logging active

## 🐛 Error Handling

The application uses centralized error handling:

```javascript
// Throwing errors in controllers
throw new ApiError(400, "Invalid input");

// Errors are caught by asyncHandler and processed by errorHandler middleware
```

### Custom Error Class

```javascript
// Example usage
if (!user) {
    throw new ApiError(404, "User not found");
}
```

## 📊 Logging

Logs are structured JSON format using Pino with BetterStack integration:

```javascript
logger.info("User logged in", { userId: user._id });
logger.error({ error }, "Database connection failed");
logger.fatal({ error }, "Critical system failure");
```

**BetterStack Features:**
- Centralized log management
- Real-time log streaming
- Advanced search and filtering
- Log retention and analysis
- Alerts and notifications

**Configuration:**
```env
BETTER_STACK_TOKEN=your_betterstack_source_token
BETTER_STACK_HOST=https://in.logs.betterstack.com
```

For detailed BetterStack setup, see [BETTERSTACK_SETUP.md](./BETTERSTACK_SETUP.md)

## 🚀 Deployment

### Deploying to Render

For detailed deployment instructions, see the deployment guide (coming soon).

**Quick Overview:**

1. **Prepare for Production:**
   - Convert Kafka certificates to base64 environment variables
   - Update `NODE_ENV` to `PRODUCTION`
   - Ensure all cloud service URLs are correct

2. **Kafka Certificate Handling:**
   ```bash
   # Convert certs to base64 (for environment variables)
   cat cert/ca.pem | base64 > ca_base64.txt
   cat cert/service.cert | base64 > cert_base64.txt
   cat cert/service.key | base64 > key_base64.txt
   ```

3. **Add to Render:**
   - Create new Web Service
   - Connect GitHub repository
   - Add all environment variables (including base64 certs)
   - Deploy!

The `kafka.js` config automatically handles production deployment by:
- Detecting `NODE_ENV=PRODUCTION`
- Writing base64-decoded certs to `/tmp/certs`
- Using the temporary files for SSL connection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Nakul**

- GitHub: [@nakul-3205](https://github.com/nakul-3205)
- Email: nakulkejriwal246@gmail.com

## 🙏 Acknowledgments

- Express.js community
- MongoDB Atlas
- Upstash Redis
- Aiven Kafka
- BetterStack for logging infrastructure
- Gmail for email delivery

## 📧 Support

For support:
- Open an issue on [GitHub](https://github.com/nakul-3205/Enginow-Project-1-/issues)
- Email: nakulkejriwal124@gmail.com

## 🔗 Additional Resources

- [API Testing Guide](./API_TESTING_GUIDE.md)
- [BetterStack Setup](./BETTERSTACK_SETUP.md)
- [Swagger Integration](./SWAGGER_INTEGRATION_GUIDE.md)
- [OpenAPI Specification](./docs/openapi.yaml)
- [Postman Collection](./postman_collection.json)

---

**⚠️ Important Security Notes:**

1. Never commit your `.env` file or `cert/` folder to Git
2. Use strong, random JWT secrets (minimum 32 characters)
3. Rotate secrets regularly in production
4. Enable IP whitelisting on MongoDB Atlas in production
5. Use environment-specific configurations
6. Keep all dependencies updated
7. Review Aiven, Upstash, and MongoDB Atlas security best practices

**🎉 Happy Coding!**