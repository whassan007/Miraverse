import { Component, ChangeDetectionStrategy, signal, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  loginSuccess = output<void>();
  navigateToRegister = output<void>();

  private userService = inject(UserService);

  email = signal('parent@miraverse.com');
  password = signal('password123');
  error = signal<string | null>(null);
  loading = signal(false);

  login() {
    this.error.set(null);
    this.loading.set(true);
    // Simulate network delay
    setTimeout(() => {
      const success = this.userService.login(this.email(), this.password());
      if (success) {
        this.loginSuccess.emit();
      } else {
        this.error.set('Invalid email or password. Please try again.');
      }
      this.loading.set(false);
    }, 500);
  }
}
