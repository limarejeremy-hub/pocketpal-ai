# GoLove Local V1

Private, local-first Android roleplay companion built from PocketPal AI.

## Product target

The first milestone is **chat only**. Keep PocketPal's proven local GGUF/llama.cpp inference stack and replace the generic-assistant experience with a character-first roleplay experience.

### V1 goals

- Android-first, fully local chat after model download.
- No message quota, credits, subscription or cloud requirement for chat.
- Multiple persistent fictional adult characters (18+), each with their own identity, age, profession, personality, speaking style, history and relationship state.
- Natural contemporary French as a first-class language.
- Strong continuity across long conversations without relying only on the model context window.
- Proactive characters that can initiate actions/events and progress scenes naturally.
- Explicit **Autonomous Mode** triggered by phrases such as `prends le contrôle`, `mode autonome`, `continue toute seule` or equivalent intent.
- Autonomous Mode must progress through multiple meaningful beats before yielding, may control secondary fictional adult characters and time/location, but must never invent the user's dialogue, thoughts or major decisions.
- Multiple characters may interact with each other.
- Per-character model and generation settings so models can be benchmarked/replaced without rewriting the product.
- Adult fictional roleplay is a supported use case. All characters in romantic/intimate contexts must be fictional adults 18+. No sexual content involving minors and no non-consensual sexual depictions of real people.

## Architecture direction

Reuse before rewriting:

1. `llama.rn` / llama.cpp GGUF inference and Android acceleration.
2. Existing streaming chat pipeline / AgentRunner.
3. Existing Roleplay Pal data and UI as the migration source for Character Profiles.
4. WatermelonDB for durable local state.
5. Existing Hugging Face GGUF download/import flow.
6. Existing benchmark tooling for model comparison.

Add a roleplay layer above inference:

- **CharacterProfile**: immutable identity + editable personality/world fields.
- **SceneState**: current place, time, active cast, relationship state, unresolved events.
- **MemoryService**: extracts durable facts and rolling summaries; injects only relevant memories into prompts.
- **RoleplayPromptBuilder**: builds compact model-specific prompts from character + scene + retrieved memory.
- **AutonomyController**: detects autonomous-mode intent and enforces multi-beat progression without taking agency from the user.
- **ModelProfile**: per-model chat template and sampling presets.
- **Continuity tests**: regression fixtures for names, relationships, locations, chronology, French and autonomy.

## Memory strategy

Do not solve memory by continuously increasing context size.

Use three layers:

- recent conversation window;
- rolling scene/chapter summary;
- durable structured memories per character/conversation.

Durable memories should include people, relationships, important events, preferences established in-story, promises, places and timeline facts. Retrieval must be scoped to the current character/conversation.

## First benchmark model

Start with the Qwen3 4B Hivemind GGUF already selected for device testing. The runtime must remain model-agnostic: Hivemind is a benchmark candidate, not a hard dependency.

## Definition of done for V1

A user can create/select a fictional adult character, start a French conversation, close/reopen the app, continue with remembered facts, invoke Autonomous Mode, receive several coherent story developments without repeated permission questions, and chat indefinitely without a service-side quota.

## Out of scope for V1

Image generation, video, avatar animation, social marketplace, monetization and cloud accounts. These can come later; they must not delay the chat engine.
