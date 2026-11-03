import { Component, ChangeDetectionStrategy, signal, inject, ElementRef, viewChild, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';
import { StreamChunk } from '../../services/demo-stream';

interface GameMessage {
  role: 'user' | 'model';
  text: string;
}

interface Location {
  name: string;
}

interface Region {
  name: string;
  color: string;
  locations: Location[];
}


@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameComponent implements OnInit {
  private gameService = inject(GameService);

  messages = signal<GameMessage[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  visitedLocations = signal<string[]>([]);

  regions: Region[] = [
    { name: 'BEIRUT', color: 'bg-coral/20', locations: [{ name: 'Raouche Rocks' }, { name: 'Corniche' }, { name: 'National Museum' }, { name: "Tita's Neighborhood" }] },
    { name: 'MOUNT LEBANON', color: 'bg-sage-green/20', locations: [{ name: 'Byblos (Ancient Castle Town)' }, { name: 'Jeita Grotto' }, { name: 'Harissa - Our Lady of Lebanon' }] },
    { name: 'BEKAA VALLEY', color: 'bg-sunny-yellow/20', locations: [{ name: 'Baalbek (Giant Roman Temples)' }, { name: 'Taanayel Farms' }, { name: 'Anjar (Ancient Desert City)' }] },
    { name: 'NORTH LEBANON', color: 'bg-powder-blue/30', locations: [{ name: 'Tripoli (Sweet City)' }, { name: 'Bcharre & Cedars of God' }, { name: 'Qadisha Valley' }] },
    { name: 'SOUTH LEBANON', color: 'bg-purple-200/50', locations: [{ name: 'Tyre (Phoenician Port Adventures)' }, { name: 'Sidon (Sea Castle Island)' }, { name: 'Beaufort Castle' }] },
  ];

  chatContainer = viewChild<ElementRef<HTMLDivElement>>('chatContainer');

  constructor() {
    effect(() => {
      if (this.messages()) {
        this.scrollToBottom();
      }
    });
  }

  ngOnInit() {
    this.startGame();
  }

  isVisited(locationName: string): boolean {
    return this.visitedLocations().includes(locationName);
  }

  async startGame() {
    this.isLoading.set(true);
    this.messages.set([]);
    this.visitedLocations.set([]);
    this.error.set(null);

    // Add a placeholder for Mira's first message
    this.messages.update(m => [...m, { role: 'model', text: '' }]);
    
    try {
      // The AI is prompted to send the first message when the user lands on the page.
      const stream = await this.gameService.sendMessageStream("Let's start the game!");
      await this.handleStream(stream);
    } catch (e) {
      console.error(e);
      this.error.set("Oh la la! I'm having a little trouble starting the game right now. Maybe try again in a moment?");
      this.messages.update(m => m.slice(0, -1)); // Remove the empty placeholder
    } finally {
      this.isLoading.set(false);
    }
  }

  async selectLocation(locationName: string) {
    if (this.isLoading() || this.isVisited(locationName)) {
      return;
    }
    
    const userMessage = `I just clicked on ${locationName}! Let's go there!`;
    
    this.visitedLocations.update(v => [...v, locationName]);
    this.messages.update(m => [...m, { role: 'user', text: `Let's go to ${locationName}!` }]);
    this.isLoading.set(true);
    this.error.set(null);

    // Add placeholder for model's response
    this.messages.update(m => [...m, { role: 'model', text: '' }]);

    try {
      const stream = await this.gameService.sendMessageStream(userMessage);
      await this.handleStream(stream);
    } catch (e) {
      console.error(e);
      const errorMessage = 'Oh la la! Something went wrong. Maybe we can try another place?';
      this.error.set(errorMessage);
       this.messages.update(currentMessages => {
          const lastMessage = currentMessages[currentMessages.length - 1];
          if (lastMessage && lastMessage.role === 'model' && lastMessage.text === '') {
            return [ ...currentMessages.slice(0, -1), { ...lastMessage, text: errorMessage }];
          }
          return [...currentMessages, {role: 'model', text: errorMessage}];
        });
    } finally {
      this.isLoading.set(false);
    }
  }

  private async handleStream(stream: AsyncGenerator<StreamChunk>) {
    let fullResponseText = '';
    for await (const chunk of stream) {
      const chunkText = chunk.text ?? '';
      fullResponseText += chunkText;
      
      // Sanitize the text on each chunk to prevent the JSON from ever rendering
      const sanitizedText = this.removeGameStateJson(fullResponseText);

      this.messages.update(currentMessages => {
        const lastMessage = currentMessages[currentMessages.length - 1];
        if (lastMessage && lastMessage.role === 'model') {
          return [
            ...currentMessages.slice(0, -1),
            { ...lastMessage, text: sanitizedText }
          ];
        }
        return currentMessages;
      });
    }
  }

  private removeGameStateJson(text: string): string {
    // This regex looks for a JSON object that contains "visited_locations" and removes it.
    const gameStateRegex = /{\s*"visited_locations":[\s\S]*?}\s*/g;
    return text.replace(gameStateRegex, '').trim();
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const element = this.chatContainer()?.nativeElement;
      if (element) {
        element.scrollTop = element.scrollHeight;
      }
    }, 0);
  }
}