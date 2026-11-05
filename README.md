# Inkloom AI – Intelligent Brand Governance Platform

## Overview

Inkloom AI is an AI-powered brand governance platform designed to help businesses maintain consistent, accurate, and trustworthy content.

It analyses content against approved brand guidelines, identifies potential issues, and provides explanations and improvement suggestions using AI.

## Problem Statement

Businesses and content creators often struggle to maintain brand consistency and content quality. Manual checking can be time-consuming and may miss spelling mistakes, repeated information, unsupported claims, and tone inconsistencies.

Inkloom AI aims to make this review process smarter and more efficient through AI-powered content analysis.

## Current MVP Progress

- React-based frontend interface.
- Brand Guidelines input section.
- Content input section.
- Node.js and Express backend.
- API endpoint for receiving content and brand guidelines.
- Frontend and backend integration.
- Google Gemini API integration.
- AI-powered content analysis.
- Spelling and grammar checking.
- Brand tone and terminology validation.
- Repeated and unnecessary content detection.
- Unsupported claim identification.
- AI-generated suggestions and explanations.

## Planned Features

- Human review with Accept/Reject options.
- Final approved content generation.
- Structured issue-wise analysis and suggestions.
- Improved brand compliance validation.

## Technology Stack

- **Frontend:** React.js, JavaScript, Tailwind CSS
- **Backend:** Node.js, Express.js
- **API:** REST API
- **Database:** MongoDB Atlas (planned)
- **AI Integration:** Google Gemini API
- **Version Control:** Git and GitHub
- **Development Tools:** Visual Studio Code, Hoppscotch

## Project Structure

```text
Inkloom-AI/
├── client/
│   ├── src/
│   └── package.json
│
├── backend/
│   ├── index.js
│   ├── package.json
│   └── .env
│
├── .gitignore
└── README.md
```

## Getting Started

### 1. Clone the Repository

```bash
git clone YOUR_REPOSITORY_URL
cd Inkloom-AI
```

### 2. Setup Frontend

Open a terminal:

```bash
cd client
npm install
npm run dev
```

### 3. Setup Backend

Open another terminal from the project root:

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder and add your Gemini API key:

```env
GEMINI_API_KEY=your_gemini_api_key
```

Start the backend:

```bash
npm run dev
```

The frontend runs on the Vite development server, and the backend runs on port 3000.

**Note:** Never upload your `.env` file or expose your API key on GitHub.

## Future Improvements

- Visual brand identity checking (logo, colours, and images).
- Advanced AI-based brand compliance analysis.
- Brand asset management and governance.
- Improved human-in-the-loop review system.

## Project Status

Currently under development as a working MVP for **CodeNexus India 2026 Hackathon – Round 2**.

The frontend-backend integration and Gemini-powered content analysis have been implemented. Human review and final content approval are planned for the next development phase.

## Author

**Taniya Chauhan**

MTech CSE | Geeta University