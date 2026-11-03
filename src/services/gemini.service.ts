import { Injectable } from '@angular/core';
import { demoStream, StreamChunk } from './demo-stream';

// Preview replies only cover the suggested conversation starters. Everything else
// says plainly that chat is not connected, so a child is never given the impression
// that Mira has understood something they shared.
const STARTER_REPLIES: Record<string, string> = {
  "Do you ever feel like you don't belong?": "Mais... yes. Sometimes. In Paris I'm the Lebanese girl, and in Beirut I'm the French cousin. Does that make sense? Or am I confusing?",
  "Tell me about your Tita.": "My Tita lives in an old stone house in Beirut, with a courtyard and a big fig tree. That tree is my thinking spot! Who is your special person?",
  "What's your favorite Lebanese food?": "Za'atar! It tastes like... comme si c'est the mountain? I don't know how to explain it. What food makes you think of home?",
  "What's it like living between two countries?": "Ten months in Paris, two summers in Beirut. I miss one place when I'm in the other. You know that feeling when you carry two homes?",
};

const NOT_CONNECTED_REPLY = "This is a preview of MiraVerse, so I can't really chat yet. Try one of the suggested questions! If something is worrying you, please talk to a grown-up you trust.";

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  async generateChatResponseStream(prompt: string): Promise<AsyncGenerator<StreamChunk>> {
    return demoStream(STARTER_REPLIES[prompt] ?? NOT_CONNECTED_REPLY);
  }
}
