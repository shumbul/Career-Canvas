# AI Services

This folder contains AI models and utilities for Career Canvas using OpenAI and Azure OpenAI.

## Setup

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and configure your API keys
3. Run in development: `npm run dev`
4. Build: `npm run build`

## Features

- Career advice generation
- Resume analysis and feedback
- Interview question generation
- Integration with OpenAI GPT-4
- Optional Azure OpenAI support

## Configuration

Configure your AI service credentials in the `.env` file:

- `OPENAI_API_KEY` - Your OpenAI API key
- `AZURE_OPENAI_API_KEY` - Your Azure OpenAI key (if using Azure)
- `AZURE_OPENAI_ENDPOINT` - Your Azure OpenAI endpoint
- `AZURE_OPENAI_DEPLOYMENT` - Your deployment name
- `AZURE_OPENAI_API_VERSION` - API version