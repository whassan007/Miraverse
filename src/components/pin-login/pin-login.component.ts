import { Component, ChangeDetectionStrategy, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-pin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pin-login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PinLoginComponent {
  pinLoginSuccess = output<void>();
  backToProfiles = output<void>();

  private userService = inject(UserService);

  profile = this.userService.profileForPinLogin;
  pin = signal('');
  error = signal<string | null>(null);
  loading = signal(false);
  isLockedOut = this.userService.isLockedOut;

  submitPin() {
    this.loading.set(true);
    this.error.set(null);

    setTimeout(() => { // Simulate network delay
      const result = this.userService.validatePin(this.pin());
      if (result.success) {
        this.pinLoginSuccess.emit();
      } else {
        this.error.set(result.message);
        this.pin.set(''); // Clear pin on failure
      }
      this.loading.set(false);
    }, 500);
  }

  goBack() {
    this.backToProfiles.emit();
  }
}
