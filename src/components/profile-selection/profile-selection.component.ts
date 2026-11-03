import { Component, ChangeDetectionStrategy, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService, ParentUser, ChildProfile, ActiveProfile } from '../../services/user.service';

@Component({
  selector: 'app-profile-selection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-selection.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileSelectionComponent {
  profileSelected = output<ActiveProfile>();
  private userService = inject(UserService);
  
  user = this.userService.loggedInUser;

  selectProfile(profileData: ParentUser | ChildProfile, type: 'parent' | 'child') {
    let profile: ActiveProfile;
    if (type === 'parent') {
      const { children, ...parentData } = profileData as ParentUser;
      profile = { ...parentData, type: 'parent' };
    } else {
      profile = { ...(profileData as ChildProfile), type: 'child' };
    }
    this.profileSelected.emit(profile);
  }
}
