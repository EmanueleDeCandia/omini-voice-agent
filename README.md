# Omini Voice Agent

A voice-first AI assistant designed for natural, hands-free conversations and intelligent task execution. The project is structured to combine speech recognition, AI reasoning, and voice output into a seamless conversational experience for web or app-based interfaces.

<p align="center">
  <img src="https://img.shields.io/badge/Status-Active-success" alt="Status: Active" />
  <img src="https://img.shields.io/badge/Language-TypeScript%20%2F%20JavaScript-blue" alt="Languages" />
  <img src="https://img.shields.io/badge/AI-Voice%20Assistant-orange" alt="AI Voice Assistant" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License MIT" />
</p>

## Overview

Omini Voice Agent is a conversational interface that transforms spoken input into actionable AI responses. It is intended for use cases such as virtual assistance, interactive workflows, customer support, and multimodal AI experiences where voice is the primary interaction layer.

The application focuses on:

- Real-time speech-to-text conversion
- AI-driven response generation
- Natural voice output via text-to-speech
- Session-aware conversational flows
- Extensible backend integrations for tools, APIs, and services

## Key Features

- Voice-first user experience
- Natural language understanding with LLM-powered responses
- Real-time conversation flow management
- Support for custom tools and external integrations
- Configurable deployment for local development and production
- Easy extension for new capabilities and workflows

## Solution Architecture

```text
User Voice Input
      │
      ▼
Speech-to-Text Engine
      │
      ▼
LLM / Agent Logic
      │
      ├── Tool Calls / APIs
      ├── Memory / Context
      └── Response Generation
      │
      ▼
Text-to-Speech Engine
      │
      ▼
Audio Response to User
```

## Typical Use Cases

- Voice-enabled AI assistant in customer support
- Smart conversational kiosk or in-app assistant
- Multi-turn interactions with memory and context
- Workflow automation triggered by spoken commands
- Interactive demo application for AI voice experiences

## Project Structure

```text
.
├── app/
│   ├── components/
│   ├── pages/
│   └── routes/
├── backend/
│   ├── api/
│   ├── services/
│   └── utils/
├── src/
│   ├── agents/
│   ├── audio/
│   ├── config/
│   └── prompts/
├── public/
├── .env.example
├── package.json
├── README.md
├── LICENSE
└── .gitignore
```

## Getting Started

### Prerequisites

Before running the project, make sure you have:

- Node.js 18+ or a compatible runtime
- npm, pnpm, or yarn
- An API key for your preferred AI provider (for example OpenAI, Gemini, or another LLM service)
- A microphone-enabled environment for local voice testing

### Installation

1. Clone the repository:

```bash
git clone https://github.com/EmanueleDeCandia/omini-voice-agent.git
cd omini-voice-agent
```

2. Install dependencies:

```bash
npm install
# or
pnpm install
# or
yarn install
```

3. Configure environment variables:

```bash
cp .env.example .env
```

Then update the file with your credentials and runtime settings.

### Run the project

```bash
npm run dev
```

Open the local URL shown in the terminal to interact with the voice assistant.

## Environment Variables

Example configuration:

```env
PORT=3000
OPENAI_API_KEY=your_key_here
MODEL=gpt-4o-mini
VOICE_LANGUAGE=en-US
AUDIO_INPUT_ENABLED=true
AUDIO_OUTPUT_ENABLED=true
```

Adjust the variables according to your stack and provider configuration.

## Development Notes

This project is designed to be extensible:

- Add new speech providers or transcription services
- Plug in different LLM backends
- Add custom tools and function calling handlers
- Improve memory, context management, and session persistence
- Add authentication and rate limiting for production environments

## Roadmap

- Improve conversation quality and latency
- Add stronger session memory and context tracking
- Support multiple languages and accents
- Integrate additional tools and workflow automation
- Improve production deployment and observability

## Contributing

Contributions are welcome. If you want to improve the project, please:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request with a clear description

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For questions, suggestions, or collaboration opportunities, open an issue or reach out through the GitHub repository.

---

Built for natural, conversational AI experiences.
