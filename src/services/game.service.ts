import { Injectable } from '@angular/core';
import { demoStream, StreamChunk } from './demo-stream';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  async sendMessageStream(prompt: string): Promise<AsyncGenerator<StreamChunk>> {
    const place = prompt.match(/I just clicked on (.+)! Let's go there!/)?.[1];
    return demoStream(place
      ? `Yalla! Let's go to ${place}! 🎉 My full stories about this place are coming soon, because this is a preview of MiraVerse. Which sparkling spot should we visit next?`
      : "Marhaba! Welcome to Lebanon, my summer home! 🇱🇧 This is a preview of my game. Click on a sparkling spot on the map to begin our adventure!");
  }
}
