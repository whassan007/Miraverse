import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';

type ContactTab = 'form' | 'email' | 'chat';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactComponent {
  public userService = inject(UserService);
  activeTab = signal<ContactTab>('form');
  
  // Form state
  form = signal({
    name: '',
    email: '',
    iam: '',
    subject: '',
    orderNumber: '',
    message: ''
  });
  
  submitting = signal(false);
  submitSuccess = signal(false);
  submitError = signal<string | null>(null);

  setTab(tab: ContactTab) {
    this.activeTab.set(tab);
  }

  submitForm() {
    this.submitting.set(true);
    this.submitSuccess.set(false);
    this.submitError.set(null);

    // Mock form submission
    console.log('Submitting form:', this.form());
    setTimeout(() => {
      // Mock success/error
      if (this.form().email.includes('error')) {
        this.submitError.set("Oops! Something went wrong. Please try again or email us directly.");
      } else {
        this.submitSuccess.set(true);
        this.form.set({ name: '', email: '', iam: '', subject: '', orderNumber: '', message: '' });
        setTimeout(() => this.submitSuccess.set(false), 8000);
      }
      this.submitting.set(false);
    }, 1500);
  }
}
