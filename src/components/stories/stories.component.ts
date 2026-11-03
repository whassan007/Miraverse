
import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ContentItem {
  id: number;
  type: 'Story' | 'Recipe';
  title: string;
  description: string;
  imageUrl: string;
}

@Component({
  selector: 'app-stories',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stories.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoriesComponent {
  contentItems = signal<ContentItem[]>([
    {
      id: 1,
      type: 'Recipe',
      title: 'Tita\'s Famous Tabbouleh',
      description: 'The secret to my Tita\'s tabbouleh is lots of fresh parsley and a little bit of love!',
      imageUrl: 'assets/mira/cooking.jpg',
    },
    {
      id: 2,
      type: 'Story',
      title: 'The Day I Got Lost in Paris',
      description: 'It was a little scary, but I discovered the most magical little bakery all by myself.',
      imageUrl: 'assets/mira/mira-wondering.jpg',
    },
    {
      id: 3,
      type: 'Story',
      title: 'Summer Nights in Beirut',
      description: 'Listening to the sounds of the city from Tita\'s balcony is my favorite part of summer.',
      imageUrl: 'assets/mira/fig-leaf.jpg',
    },
    {
      id: 4,
      type: 'Recipe',
      title: 'Fluffy French Crêpes',
      description: 'My papa taught me how to make these. The trick is to get the pan really hot!',
      imageUrl: 'assets/mira/zaatar-bowl.jpg',
    },
  ]);
}
