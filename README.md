# Meme Generator - Full-Stack Application# meme-generator



A full-stack meme generator application with text overlay, wrapping, customization, and Docker deployment.Monorepo with `backend` (Node/Express) and `frontend` (React).



## 📋 Table of ContentsQuick start (backend):



- [Features](#features)```powershell

- [Technology Stack](#technology-stack)cd backend

- [Prerequisites](#prerequisites)npm install express

- [Quick Start with Docker](#quick-start-with-docker)npm start

- [Local Development Setup](#local-development-setup)```

- [API Documentation](#api-documentation)

- [Configuration Options](#configuration-options)Quick start (frontend):

- [Testing](#testing)

- [Project Structure](#project-structure)```powershell

- [Troubleshooting](#troubleshooting)cd frontend

npx create-react-app .

---npm start

```

## ✨ Features

### Backend API
- **REST API** with Express.js
- **Image Processing** using Sharp library
- **Text Overlay** with customizable fonts, colors, and stroke
- **Automatic Text Wrapping** based on image width
- **Text Alignment** (left, center, right)
- **Preview Generation** (scaled-down 800px max dimension)
- **HD Output** (full resolution with identical text positioning)
- **Watermark Support** (text-based with configurable position)
- **Configuration Management** (in-memory storage with POST/PUT endpoints)

### Frontend SPA
- **React** single-page application
- **Image Upload** with drag-and-drop support
- **Live Preview** on every configuration change
- **Text Customization**:
  - Top and bottom text
  - Font family selection (Impact, Arial, Helvetica)
  - Font size control
  - Text color picker
  - Stroke color picker
  - Stroke width adjustment
  - Text alignment (left/center/right)
  - All Caps toggle
  - Padding adjustment
- **Watermark Position** selector
- **HD Download** button for final meme generation

### Docker Support
- **Backend Dockerfile** with Debian-based Node.js and font support
- **Frontend Dockerfile** with multi-stage build and static file serving
- **Docker Compose** for orchestrating both services
- **Environment Variables** for flexible configuration

---

## 🛠 Technology Stack

### Backend
- **Runtime**: Node.js 18
- **Framework**: Express 5.1.0
- **Image Processing**: Sharp 0.34.4
- **File Upload**: Multer 2.0.2
- **CORS**: cors 2.8.5
- **UUID**: uuid 9.0.0

### Frontend
- **Framework**: React (create-react-app)
- **Styling**: CSS3 with custom components
- **Static Server**: serve (for Docker deployment)

### DevOps
- **Containerization**: Docker & Docker Compose
- **Base Images**: node:18-slim (Debian)
- **Fonts**: Liberation Sans, FreeSans, DejaVu Serif (installed via apt)

---

## 📦 Prerequisites

### For Docker Deployment (Recommended)
- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose v2.0+

### For Local Development
- Node.js 18+ and npm
- Git

---

## 🚀 Quick Start with Docker

### 1. Clone the Repository
```bash
git clone https://github.com/dzelilah/meme-generator.git
cd meme-generator
```

### 2. Build and Start Containers
```bash
docker compose up --build -d
```

This command will:
- Build the backend image with font support
- Build the frontend image with production-optimized React bundle
- Create a Docker network for inter-service communication
- Start both containers in detached mode

### 3. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

### 4. Stop Containers
```bash
docker compose down
```

---

## 💻 Local Development Setup

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
node index.js
```

Backend will run on **http://localhost:3001**

### Frontend Setup

1. Navigate to frontend directory (in a new terminal):
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm start
```

Frontend will run on **http://localhost:3000**

---

## 📚 API Documentation

### Base URL
- **Docker**: `http://localhost:5000`
- **Local**: `http://localhost:3001`

### Endpoints

#### 1. POST `/api/config`
Create a new meme configuration.

**Request Body** (JSON):
```json
{
  "topText": "TOP TEXT HERE",
  "bottomText": "BOTTOM TEXT HERE",
  "fontSize": 48,
  "textColor": "#ffffff",
  "fillColor": "#ffffff",
  "strokeColor": "#000000",
  "strokeWidth": 4,
  "fontFamily": "Impact",
  "textAlign": "center",
  "allCaps": true,
  "padding": 10,
  "watermarkPosition": "bottom-right",
  "scaleDown": 0.05
}
```

**Response**:
```json
{
  "id": "uuid-here",
  "topText": "TOP TEXT HERE",
  ...
}
```

#### 2. PUT `/api/config/:id`
Update an existing configuration by ID.

**Request Body**: Same as POST

**Response**: Updated configuration object

#### 3. POST `/api/meme/preview`
Generate a preview image (max 800px dimension).

**Request**: multipart/form-data
- `image`: File (PNG/JPG, max 15MB)
- `config`: JSON string with configuration

**Response**: Image (JPEG, quality 90)

**Example using curl**:
```bash
curl -X POST http://localhost:5000/api/meme/preview \
  -F "image=@my-image.jpg" \
  -F 'config={"topText":"HELLO","bottomText":"WORLD","fontSize":48,"fillColor":"#ffffff","strokeColor":"#000000","strokeWidth":4,"padding":10}' \
  --output preview.jpg
```

#### 4. POST `/api/meme/generate`
Generate HD meme at full resolution.

**Request**: Same as preview endpoint

**Response**: Image (JPEG, full resolution)

---

## ⚙️ Configuration Options

### Text Configuration

| Field | Type | Default | Description | Validation |
|-------|------|---------|-------------|------------|
| `topText` | string | `""` | Text for top caption | - |
| `bottomText` | string | `""` | Text for bottom caption | - |
| `fontSize` | number | `48` | Font size in pixels | Must be number |
| `textColor` | string | `"#ffffff"` | Alias for fillColor | Must be string |
| `fillColor` | string | `"#ffffff"` | Text fill color (hex) | Must be string |
| `strokeColor` | string | `"#000000"` | Text outline color (hex) | Must be string |
| `strokeWidth` | number | `4` | Outline width in pixels | Must be number |
| `fontFamily` | string | `"Impact"` | Font name | Any string |
| `textAlign` | enum | `"center"` | Text alignment | `"left"`, `"center"`, `"right"` |
| `allCaps` | boolean | `true` | Force uppercase | Must be boolean |
| `padding` | number | `10` | Edge padding in pixels | Must be number |

### Watermark Configuration

| Field | Type | Default | Description | Validation |
|-------|------|---------|-------------|------------|
| `watermarkPosition` | string | `"bottom-right"` | Watermark placement | Any string |
| `watermarkImage` | string | `null` | Base64 encoded image | Must be string |

### Preview Configuration

| Field | Type | Default | Description | Validation |
|-------|------|---------|-------------|------------|
| `scaleDown` | number | `0.05` | Preview scale factor | 0 to 0.25 |

---

## 🧪 Testing

### Testing with Web Interface

1. Open http://localhost:3000
2. Upload an image (PNG or JPG)
3. Enter text in Top Text and Bottom Text fields
4. Adjust font, colors, alignment, and other settings
5. Preview updates automatically
6. Click "Generate Meme" to download HD version

### Testing with Postman

#### Preview Endpoint Test

1. Create POST request to `http://localhost:5000/api/meme/preview`
2. Set Body type to `form-data`
3. Add key `image` with type `File`, select an image
4. Add key `config` with type `Text`, value:
```json
{"topText":"TEST","bottomText":"MEME","fontSize":48,"fillColor":"#ffffff","strokeColor":"#000000","strokeWidth":4,"padding":10,"textAlign":"center","allCaps":true}
```
5. Send request
6. View image in response

#### Config Endpoint Test

1. Create POST request to `http://localhost:5000/api/config`
2. Set Body type to `raw` and format to `JSON`
3. Add JSON body:
```json
{
  "topText": "SAMPLE TEXT",
  "bottomText": "BOTTOM TEXT",
  "fontSize": 48,
  "fillColor": "#ffffff"
}
```
4. Send request
5. Copy returned `id` from response
6. Create PUT request to `http://localhost:5000/api/config/{id}`
7. Update configuration and send

---

## 📁 Project Structure

```
meme-generator/
├── backend/
│   ├── models/
│   │   └── memeConfig.js          # Configuration validation
│   ├── routes/
│   │   ├── config.js              # Configuration CRUD endpoints
│   │   └── meme.js                # Image processing endpoints
│   ├── index.js                   # Express server entry point
│   ├── package.json
│   ├── Dockerfile                 # Backend container definition
│   └── .dockerignore
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ImageUpload.js     # Image upload component
│   │   │   ├── TextConfigForm.js  # Configuration form
│   │   │   └── PreviewDisplay.js  # Preview image display
│   │   ├── App.js                 # Main React component
│   │   ├── App.css                # Styling
│   │   └── index.js               # React entry point
│   ├── package.json
│   ├── Dockerfile                 # Frontend container definition
│   ├── .dockerignore
│   └── .env                       # Environment variables
├── docker-compose.yml             # Multi-container orchestration
└── README.md                      # This file
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Text Appears as Strange Symbols (�����)
**Problem**: Fonts not properly installed in Docker container

**Solution**: Rebuild backend container with font installation:
```bash
docker compose down
docker compose up --build -d
```

Backend Dockerfile includes:
```dockerfile
RUN apt-get update && apt-get install -y \
    libvips-dev \
    fonts-liberation \
    fontconfig \
    fonts-dejavu-core \
    fonts-freefont-ttf \
    && fc-cache -f -v
```

#### 2. "Failed to fetch" Error
**Problem**: Frontend cannot reach backend API

**Solution**: Check `docker-compose.yml` uses `http://localhost:5000` (not `http://backend:5000`) for browser access:
```yaml
frontend:
  build:
    context: ./frontend
    args:
      - REACT_APP_API_URL=http://localhost:5000
```

#### 3. Port Already in Use
**Problem**: Port 3000 or 5000 already occupied

**Solution**: Stop conflicting processes or change ports in `docker-compose.yml`:
```yaml
services:
  backend:
    ports:
      - "5001:5000"  # Change host port
  frontend:
    ports:
      - "3001:3000"  # Change host port
```

#### 4. Image Too Large Error
**Problem**: Upload exceeds 15MB limit

**Solution**: Resize image before upload or increase limit in `backend/routes/meme.js`:
```javascript
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB
  }
});
```

#### 5. Text Wrapping Not Working
**Problem**: Long text overflows image

**Solution**: Text wrapping is automatic based on `imageWidth - (2 × padding)`. Reduce font size or increase image width.

#### 6. Docker Build Fails
**Problem**: Network issues or cache corruption

**Solution**: Clear Docker cache and rebuild:
```bash
docker system prune -a
docker compose build --no-cache
docker compose up -d
```

---

## 🌐 Environment Variables

### Backend
- `PORT` - Server port (default: 3001, Docker: 5000)
- `NODE_ENV` - Environment mode (Docker: production)

### Frontend
- `REACT_APP_API_URL` - Backend API URL
  - Docker: `http://localhost:5000`
  - Local: `http://localhost:3001`

---

## 📝 Development Notes

### Text Wrapping Algorithm
- Approximates character width as 60% of font size for bold sans-serif
- Calculates max characters per line: `maxWidth / (fontSize × 0.6)`
- Splits text into words and builds lines within max width
- Forces word break if single word exceeds max width

### Font Mapping
Impact font is mapped to system-available fonts:
```javascript
const fontMapping = {
  'Impact': 'Liberation Sans, Arial, sans-serif',
  'Arial': 'Liberation Sans, Arial, sans-serif',
  'Comic Sans MS': 'FreeSans, Arial, sans-serif',
  'Times New Roman': 'DejaVu Serif, serif'
};
```

### Preview vs HD Generation
Both endpoints use **identical text positioning**:
1. Calculate preview dimensions (max 800px)
2. Apply text overlay at preview size
3. For HD: downscale image → apply overlay → upscale back to original

This ensures preview matches HD output exactly.

---

## 🎯 Assignment Completion Status

### ✅ Completed Requirements

- [x] Backend REST API with Express
- [x] `/api/meme/preview` endpoint (scaled preview with text)
- [x] `/api/meme/generate` endpoint (HD output with text)
- [x] `/api/config` POST endpoint (create configuration)
- [x] `/api/config/:id` PUT endpoint (update configuration)
- [x] Text overlay with customizable fonts, colors, stroke
- [x] **Text wrapping based on image width**
- [x] **Text alignment (left/center/right)**
- [x] **All Caps toggle**
- [x] Watermark support (text-based with position)
- [x] Frontend React SPA
- [x] Image upload functionality
- [x] Live preview on configuration changes
- [x] HD download button
- [x] Backend Dockerfile (Debian-based with fonts)
- [x] Frontend Dockerfile (multi-stage build with serve)
- [x] docker-compose.yml (orchestration)
- [x] Environment variable configuration
- [x] **Comprehensive README.md documentation**

### 📋 Configuration Fields Implemented

- [x] `topText` / `bottomText`
- [x] `fontFamily`
- [x] `fontSize`
- [x] `textColor` (alias for fillColor)
- [x] `fillColor`
- [x] `strokeColor`
- [x] `strokeWidth`
- [x] `textAlign` (left/center/right)
- [x] `allCaps` (boolean)
- [x] `padding`
- [x] `watermarkPosition`
- [x] `watermarkImage` (field validation, base64 ready)
- [x] `scaleDown` (field validation 0-0.25)

---

## 🚀 Next Steps (Bonus Challenge)

To deploy to cloud platforms:

### AWS Deployment
1. Push images to Amazon ECR
2. Deploy with ECS/Fargate or EC2
3. Use Application Load Balancer
4. Configure Route53 for DNS

### Azure Deployment
1. Push images to Azure Container Registry
2. Deploy to Azure Container Instances or App Service
3. Configure Azure Front Door

### GCP Deployment
1. Push images to Google Container Registry
2. Deploy to Cloud Run or GKE
3. Configure Cloud Load Balancing

---

**Built with ❤️ using Node.js, React, Sharp, and Docker**
