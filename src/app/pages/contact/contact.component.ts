import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { STORE_CONFIG } from '../../core/config/store.config';
import { ToastService } from '../../core/services/toast.service';
import { WhatsappService } from '../../core/services/whatsapp.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent {
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  private whatsappService = inject(WhatsappService);

  readonly config = STORE_CONFIG;
  submitted = false;

  contactForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    message: ['', [Validators.required, Validators.minLength(10)]],
  });

  get f() {
    return this.contactForm.controls;
  }

  submit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      this.toast.error('Please fill in all fields correctly.');
      return;
    }

    const { name, email, message } = this.contactForm.getRawValue();
    const text = `Hello, my name is ${name} (${email}).\n\n${message}`;
    const url = this.whatsappService.buildWhatsAppUrl(text);
    window.open(url, '_blank', 'noopener');

    this.submitted = true;
    this.toast.success('Opening WhatsApp to send your message...');
    this.contactForm.reset();
  }
}
