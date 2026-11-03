import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, ChildProfile } from '../../services/user.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private userService = inject(UserService);
  user = this.userService.loggedInUser;
  
  newChildName = signal('');
  newChildAge = signal<number | null>(null);
  
  addChildProfile() {
    // Mock implementation
    if (this.newChildName() && this.newChildAge() !== null) {
      alert(`In a real app, this would add a new profile for ${this.newChildName()}.`);
      this.newChildName.set('');
      this.newChildAge.set(null);
    }
  }
}
