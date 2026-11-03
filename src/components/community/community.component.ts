import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-resources',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './community.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourcesComponent {
  public userService = inject(UserService);
}
