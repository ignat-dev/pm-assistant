# 🔮 PM Assistant

## Overview
PM Assistant is a modern web application for processing chat transcripts and extracting actionable feature requests using AI. It enables teams to review, prioritize, and manage feature requests sourced directly from customer conversations. The app demonstrates a full-stack workflow with a Next.js frontend, backend API endpoints, and a centralized in-memory database service (ready for future migration to Firestore or other persistent storage).

## Features
- **Transcript Processing**: Store chat transcripts, generate summaries, and extract feature requests using AI (LangChain/OpenAI integration).
- **Feature Request Review**: View, review, and prioritize extracted feature requests.
- **Modern UI**: Responsive split-view layout styled with PicoCSS (via SCSS).
- **Centralized Data Service**: All data operations are abstracted via a service layer for easy migration.
- **Code Quality**: Enforced code style via ESLint and EditorConfig.

## Tech Stack
 - **Frontend**: [Next.js][1], [React][2], [TypeScript][3], [PicoCSS][5], [SCSS][4]
 - **Backend**: [Next.js][1], [TypeScript][3]
 - **AI Integration**: [LangChain][6], [OpenAI][7]
 - **Database**: In-memory DB, ready for Firestore
 - **Linting/Formatting**: [ESLint][8], [EditorConfig][9]

## Getting Started

### Project Structure

```text
root/
├── src/
│   ├── app/
│   │   ├── api/                # Backend API endpoints
│   │   ├── features/           # Features UI components
│   │   ├── transcripts/        # Transcripts UI components
│   │   ├── layout.tsx          # App layout
│   │   ├── main.scss           # Global styles
│   │   └── page.tsx            # Main landing page
│   ├── common/
│   │   └── constants.ts        # Shared constants
│   ├── components/             # Shared UI components
│   ├── lib/
│   │   └── api/                # Frontend API abstractions
│   ├── services/               # Backend service methods
│   ├── types/                  # Shared type definitions
│   └── utils/                  # Shared utility functions
├── data/
│   └── transcripts.json        # Sample transcripts data
├── .editorconfig               # EditorConfig settings
├── .env.template               # Environment variable template
├── eslint.config.js            # ESLint configuration
├── next.config.ts              # Next.js configuration
├── package.json                # Project metadata and scripts
└── tsconfig.json               # TypeScript configuration
```

### Prerequisites
- Node.js (v22+ recommended)
- npm (v9+ recommended)
- OpenAI API key (for AI features)

### Setup

1. **Clone the repository**
   ```sh
   git clone https://github.com/ignat-dev/pm-assistant.git
   cd pm-assistant
   ```

2. **Install dependencies**
   ```sh
   npm install
   ```

3. **Configure environment variables**
   - Copy the template file:
     ```sh
     cp .env.template .env
     ```

   - Edit `.env` and set your OpenAI API key:
     ```env
     OPENAI_API_KEY=your-openai-key-here
     ```

4. **Run the development server**
   ```sh
   npm run dev
   ```

5. **Access the app**
   - Open [http://localhost:3000](http://localhost:3000) in your browser.

### Scripts & Commands

| Command         | Description                                                |
|-----------------|------------------------------------------------------------|
| `npm run dev`   | Start the development server (Next.js, hot reload)         |
| `npm run build` | Build the app for production                               |
| `npm start`     | Start the production server                                |
| `npm run lint`  | Run ESLint to check code style and formatting              |



[1]: https://nextjs.org/
[2]: https://react.dev/
[3]: https://www.typescriptlang.org/
[4]: https://sass-lang.com/
[5]: https://picocss.com/
[6]: https://langchain.com/
[7]: https://openai.com/
[8]: https://eslint.org/
[9]: https://editorconfig.org/
