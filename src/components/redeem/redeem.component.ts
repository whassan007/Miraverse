import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-redeem',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './redeem.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RedeemComponent {
  private userService = inject(UserService);

  code = signal('');
  result = signal<{ success: boolean; message: string; amount?: number; } | null>(null);
  loading = signal(false);

  redeem() {
    this.result.set(null);
    this.loading.set(true);
    // Simulate network delay
    setTimeout(() => {
        const response = this.userService.redeemGiftCard(this.code());
        this.result.set(response);
        if (response.success) {
        this.code.set('');
        }
        this.loading.set(false);
    }, 1000);
  }
}
