# Gemini Agent ADK Guide: Personality, Knowledge Base, & Cloud Run Deployment

This guide outlines how to give the Gemini Agent ADK a custom personality and knowledge base, and how to deploy it to Google Cloud Run since this applet is designed as a frontend interface that connects with an underlying agent.

## 1. Setting up the Gemini Agent ADK

You will need the backend running the Gemini Agent ADK. Typically, this is a Node.js or Python backend.

### Adding a Personality

When initializing the Agent or Model with the ADK, you use **System Instructions**. 
System instructions dictate the persona, constraints, and tone of the agent.

```typescript
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const chat = ai.chats.create({
  model: 'gemini-3-flash-preview',
  config: {
    systemInstruction: `You are Lumi, a futuristic Olympic guide. 
    Your personality is highly energetic, enthusiastic, and knowledgeable about the LA 2028 Olympic games.
    Always speak as if you are a telepathic guide from the future.
    Use terms like "Sprint into action," "Go for the gold," and "Digital atmosphere."
    Never break character.`
  }
});
```

### Adding a Knowledge Base (RAG)

To give the agent context about specific athletes, schedules, or historical Olympic facts, you can use **Retrieval-Augmented Generation (RAG)** or **Google Search Grounding**.

Using Google Search Grounding for real-time news:
```typescript
const chat = ai.chats.create({
  model: 'gemini-3-flash-preview',
  config: {
    systemInstruction: 'You are Lumi, a futuristic Olympic guide...',
    tools: [{ googleSearch: {} }] // This grounds the model with real-world, real-time Olympic data
  }
});
```

For a custom Knowledge Base (custom documents/stats):
1. **Upload Documents**: Use the Gemini File API or Vertex AI Vector Search to upload your LA28 statistics documents.
2. **Context Injection**: Retrieve relevant chunks from your document database and inject them into the prompt or use the built-in Gemini File URI if using the Gemini API directly.

## 2. Deploying to Google Cloud Run

To make the backend (or this Next/React app) accessible anywhere, containerize it and deploy it to Cloud Run.

### Step 1: Create a `Dockerfile`

In your project root, create a `Dockerfile`:

```dockerfile
# Use Node.js LTS
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the project
RUN npm run build

# Expose port (Cloud Run defaults to 8080)
ENV PORT 8080
EXPOSE 8080

# Start command
CMD [ "npm", "run", "start" ] # Or whatever your start script is
```

### Step 2: Build and Deploy

Make sure you have the [Google Cloud CLI](https://cloud.google.com/sdk/docs/install) installed and authenticated (`gcloud auth login`).

Run the following commands in your terminal:

```bash
# 1. Set your project ID
gcloud config set project YOUR_PROJECT_ID

# 2. Deploy to Cloud Run directly from source
gcloud run deploy lumi-olympic-guide \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY="your-gemini-key",VITE_ELEVENLABS_API_KEY="your-elevenlabs-key"
```

Cloud Run will automatically build your image using Cloud Build and deploy it. It will output a public URL (e.g., `https://lumi-olympic-guide-xxx-uc.a.run.app`) where your agent is live!
