import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { STORE_CONFIG } from '../../core/config/store.config';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent {
  readonly config = STORE_CONFIG;

  readonly values = [
    {
      title: 'Considered Design',
      description: 'Every piece is chosen for its cut, fabric and finish — built to be worn for years, not seasons.',
    },
    {
      title: 'Honest Pricing',
      description: 'Premium quality without the premium markup. We work directly with makers to keep costs fair.',
    },
    {
      title: 'Real Customer Care',
      description: 'Order and get support directly on WhatsApp — no call centers, no chatbots, just real people.',
    },
  ];
}
