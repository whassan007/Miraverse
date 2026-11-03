import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

type PrivacyView = 'parents' | 'kids';

@Component({
  selector: 'app-privacy-safety',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './privacy-safety.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivacySafetyComponent {
  activeView = signal<PrivacyView>('parents');

  setView(view: PrivacyView) {
    this.activeView.set(view);
  }
}
