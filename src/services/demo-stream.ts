// Offline stand-in for the AI backend, so the static site works with no API key.
// Replace the callers in gemini.service.ts and game.service.ts when a backend exists.
export interface StreamChunk {
  text?: string;
}

export async function* demoStream(text: string): AsyncGenerator<StreamChunk> {
  for (const word of text.split(/(?<=\s)/)) {
    await new Promise(resolve => setTimeout(resolve, 25));
    yield { text: word };
  }
}
