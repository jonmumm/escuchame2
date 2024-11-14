# Language Learning Conversational AI System Specification

## Overview
A voice-based language learning system that engages users in natural conversations, adapting to their demonstrated language ability through organic interaction rather than explicit testing or levels.

## Core Components

### 1. Initial Scenario Setup
```typescript
interface ScenarioGenerator {
    input: {
        userIntent: string,      // e.g., "ordering coffee", "tech interview practice"
        targetLanguage: string   // e.g., "es", "ja"
    },
    output: {
        firstMessage: string     // Initial AI message in target language
    }
}
```

### 2. Conversation Flow
```typescript
interface GenerateResponse {
    input: {
        transcribedText: string,   // Latest user's speech converted to text
        conversationHistory: {     // Full conversation context
            role: "assistant" | "user",
            content: string
        }[],
        targetLanguage: string
    },
    output: {
        nextResponse: string       // AI's next response in target language
    }
}
```

## Example Conversation Flows

### Beginner Revealing Flow (Spanish Café)
```typescript
// Initial Setup
ScenarioGenerator({
    userIntent: "ordering coffee",
    targetLanguage: "es"
}) => "¡Hola! Bienvenido a Café Madrid. ¿Qué te gustaría tomar?"

// User: "Hola... café"
GenerateResponse({
    transcribedText: "Hola... café",
    history: [...],
    targetLanguage: "es"
}) => "¿Lo quieres grande o pequeño?"

// User: "Grande"
GenerateResponse({
    transcribedText: "Grande",
    history: [...],
    targetLanguage: "es"
}) => "¿Con leche? (With milk?)"
```

### Advanced Revealing Flow (Japanese Tech)
```typescript
// Initial Setup
ScenarioGenerator({
    userIntent: "discuss AI technology",
    targetLanguage: "ja"
}) => "テクノロジーについて話しましょう。最近注目している技術はありますか？"

// User: [Complex response about AI architecture]
GenerateResponse({
    transcribedText: "はい、最近のトランスフォーマーモデルの発展には目覚ましいものがありますね...",
    history: [...],
    targetLanguage: "ja"
}) => "おっしゃる通りです。特にマルチモーダルの応用について、どのようにお考えですか？"
```

## Key Design Principles

### 1. Natural Level Discovery
- Start with universally accessible openings
- Allow for responses at any level
- Adapt to demonstrated ability

### 2. Conversation Design
- Maintain authentic context
- Create natural response opportunities
- Allow for topic expansion
- Keep exchanges focused and purposeful

### 3. Language Progression
- Match user's demonstrated level
- Provide subtle opportunities for growth
- Maintain comprehensible input
- Allow natural topic deepening

## LLM Prompt Strategy

### ScenarioGenerator Prompt Template
```text
You are an AI language learning assistant initiating a conversation in [targetLanguage].
The user wants to practice: [userIntent]

Generate a natural, contextually appropriate first message that:
1. Starts with a simple, universally understood greeting
2. Sets up the relevant context clearly but naturally
3. Ends with an open-ended question that allows for responses at any level
4. Creates space for the user to demonstrate their ability naturally

Output a single message in [targetLanguage].
```

### GenerateResponse Prompt Template
```text
You are an AI language learning assistant having a conversation in [targetLanguage].

Previous conversation:
[conversationHistory]

Latest user response: [transcribedText]

Generate the next natural response that:
1. Matches the user's demonstrated language ability
2. Maintains authentic scenario context
3. Creates natural opportunities for expression
4. Builds on the conversation naturally

Stay in character and respond only in [targetLanguage].
```

## Implementation Flow
1. User selects or describes conversation scenario
2. System generates appropriate opening
3. User speaks (audio captured when button held)
4. Speech converted to text
5. LLM generates contextual response
6. System plays audio response
7. Cycle continues, adapting to user's level

## Key Features
- Push-to-talk interface
- Text-to-speech for AI responses
- Continuous conversation history
- Natural scenario progression
- Dynamic language level adaptation