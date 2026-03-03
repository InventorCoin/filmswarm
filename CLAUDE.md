# FilmSwarm — AI Film Pre-Production Swarm

## Competition
- **Hackathon:** Gemini Live Agent Challenge — Creative Storyteller category
- **Deadline:** March 16, 2026, 5:00 PM PDT
- **Prize:** $10K category + $25K grand prize + $5K special awards

## Tech Stack
- **Agent orchestration:** `@google/adk` (TypeScript)
- **LLM:** `gemini-3.1-pro-preview` (reasoning), `gemini-3.1-flash-image-preview` (images)
- **Backend:** Express + TypeScript + Firebase Cloud Functions v2
- **Frontend:** React + Vite + Tailwind
- **Database:** Firestore
- **Storage:** Google Cloud Storage
- **Deploy:** Firebase Hosting (client) + Cloud Functions (server)

## Key Architecture
- Director agent (custom BaseAgent) dynamically spawns agents based on story content
- RoundtableAgent enables visible multi-agent deliberation
- SSE streaming for real-time UI updates
- Three modes: Auto-pilot, Collaborate, Direct

## Models
| Purpose | Model ID |
|---------|----------|
| Agent reasoning | `gemini-3.1-pro-preview` |
| Image generation | `gemini-3.1-flash-image-preview` |
| Fallback | `gemini-2.5-flash` |

## Commands
```bash
cd server && npm run dev    # Start server
cd client && npm run dev    # Start client
firebase deploy             # Deploy everything
```
