import { Component, ChangeDetectionStrategy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService, ChildProfile } from '../../services/user.service';

interface TimelineEvent {
  month: string;
  title: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent {
  public userService = inject(UserService);

  activeChildProfile = computed<ChildProfile | null>(() => {
    const profile = this.userService.activeProfile();
    return profile?.type === 'child' ? profile as ChildProfile : null;
  });

  timelineEvents = signal<TimelineEvent[]>([
    { month: 'Sep', title: 'School Starts in Paris!', icon: '🎒', description: 'Back to school! New teacher, new friends. I miss Tita but I\'m excited to tell my friends all about my summer in Beirut.' },
    { month: 'Oct', title: 'Tita\'s Birthday!', icon: '🎂', description: 'We have a big video call to sing to Tita. I show her the painting I made of her courtyard.' },
    { month: 'Nov', title: 'Learning Arabic.', icon: '✍️', description: 'I started Arabic lessons after school. It\'s hard, but I want to speak better with Tita and my cousins next summer.' },
    { month: 'Dec', title: 'Christmas in Paris.', icon: '🎄', description: 'We make a French bûche de Noël (yule log cake) AND Lebanese ma\'amoul (date cookies). The best of both worlds!' },
    { month: 'Jan', title: 'New Year Memories.', icon: '📓', description: 'I write down all my favorite Beirut memories in my journal so I don\'t forget any details.' },
    { month: 'Feb', title: 'Planning Summer.', icon: '🗓️', description: 'Counting down the days! Only 5 more months until I see Tita again. I\'m already making a list of recipes to try.' },
    { month: 'Mar', title: 'Spring in Paris.', icon: '🌸', description: 'The jasmine flowers are blooming in the park, and the smell always reminds me of Tita\'s courtyard.' },
    { month: 'Apr', title: 'French Cooking Class.', icon: '🥐', description: 'We\'re learning to make perfect croissants at school, but I keep thinking about how Tita makes her bread.' },
    { month: 'May', title: 'Last Day of School!', icon: '☀️', description: 'School\'s out! Summer is almost, almost here!' },
    { month: 'Jun', title: 'Packing My Bags!', icon: '🧳', description: 'I\'m packing my suitcase! I always bring gifts for Tita and my cousins (and leave lots of room for things to bring back!).' },
    { month: 'Jul', title: 'ARRIVAL IN BEIRUT!', icon: '✈️', description: 'Finally! The moment I\'ve been waiting for. The airport smells different—like the sea and spices. Tita is waiting with the biggest hug. We drive through Beirut, and everything feels like coming home.' },
    { month: 'Aug', title: 'Saying Goodbye.', icon: '😢', description: 'The hardest day of the year. Saying goodbye to Tita, to the courtyard, to my cousins. Tita promises to video call every week. I promise to practice my Arabic.' },
  ]);

  selectedEvent = signal<TimelineEvent>(this.timelineEvents()[10]); // Default to July

  selectEvent(event: TimelineEvent) {
    this.selectedEvent.set(event);
  }
}
