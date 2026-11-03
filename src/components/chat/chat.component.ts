
import { Component, ChangeDetectionStrategy, signal, inject, ElementRef, viewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../services/gemini.service';

interface Message {
  role: 'user' | 'model';
  text: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatComponent {
  private geminiService = inject(GeminiService);
  
  messages = signal<Message[]>([
    { role: 'model', text: 'Bonjour! It\'s me, Mira. This is my special notebook where I write down all my thoughts. I\'m so glad you\'re here! What should we talk about?' }
  ]);
  userInput = signal<string>('');
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  conversationStarters = signal<string[]>([
    "Do you ever feel like you don't belong?",
    "Tell me about your Tita.",
    "What's your favorite Lebanese food?",
    "What's it like living between two countries?"
  ]);
  
  chatContainer = viewChild<ElementRef<HTMLDivElement>>('chatContainer');

  constructor() {
    effect(() => {
      if (this.messages()) {
        this.scrollToBottom();
      }
    });
  }

  startConversation(prompt: string) {
    this.userInput.set(prompt);
    this.sendMessage();
  }

  async sendMessage() {
    const userMessage = this.userInput().trim();
    if (!userMessage || this.isLoading()) {
      return;
    }

    // Add user message to chat
    this.messages.update(m => [...m, { role: 'user', text: userMessage }]);
    this.userInput.set('');
    this.isLoading.set(true);
    this.error.set(null);

    // Prepare for streaming model response by adding a placeholder
    this.messages.update(m => [...m, { role: 'model', text: '' }]);

    try {
      const stream = await this.geminiService.generateChatResponseStream(userMessage);
      
      for await (const chunk of stream) {
        // The .text property is a convenience accessor. In some streaming chunks,
        // it might be undefined if there's no text part. Default to an empty string.
        const chunkText = chunk.text ?? '';
        
        this.messages.update(currentMessages => {
          const lastMessage = currentMessages[currentMessages.length - 1];
          if (lastMessage && lastMessage.role === 'model') {
            // Create a new array with a new object for the last message to ensure immutability
            return [
              ...currentMessages.slice(0, -1),
              { ...lastMessage, text: lastMessage.text + chunkText }
            ];
          }
          return currentMessages;
        });
      }

    } catch (e) {
      console.error(e);
      const errorMessage = 'Oh la la! Something went wrong. Maybe we can try talking about something else?';
      this.error.set(errorMessage);
       this.messages.update(currentMessages => {
          const lastMessage = currentMessages[currentMessages.length - 1];
          if (lastMessage && lastMessage.role === 'model' && lastMessage.text === '') {
             // Replace the empty placeholder with the error message
            return [
              ...currentMessages.slice(0, -1),
              { ...lastMessage, text: errorMessage }
            ];
          } else {
             // If something else went wrong, add the error as a new message
             return [...currentMessages, {role: 'model', text: errorMessage}];
          }
        });
    } finally {
      this.isLoading.set(false);
    }
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
