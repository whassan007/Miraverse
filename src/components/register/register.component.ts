import { Component, ChangeDetectionStrategy, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  registerSuccess = output<void>();
  navigateToLogin = output<void>();

  name = signal('');
  email = signal('');
  password = signal('');
  error = signal<string | null>(null);
  loading = signal(false);

  register() {
    this.loading.set(true);
    // In a real app, this would call a UserService method to create a new user.
    // We will simulate success.
    console.log('Registering user:', this.name(), this.email());
    setTimeout(() => {
        // We'll treat this as a success and then navigate as if they logged in.
        // A real app would likely auto-login the user after registration.
        this.registerSuccess.emit();
        this.loading.set(false);
    }, 1000);
  }
}
