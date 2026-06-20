import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { environment } from '../../../environments/environment';

interface NavItem {
  label: string;
  path: string;
  description: string;
}

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin-shell.html',
  styleUrl: './admin-shell.scss',
})
export class AdminShell {
  readonly dataSourceLabel = 'Live';
  readonly modeLabel = 'free';
  readonly backendLabel = 'On';

  readonly navItems: NavItem[] = [
    {
      label: 'Overview',
      path: '/overview',
      description: 'Runtime summary and recent system health.',
    },
    {
      label: 'Runtime Errors',
      path: '/runtime-errors',
      description: 'Calendar and grouped error triage view.',
    },
  ];

  constructor() {
    if (environment.useMockApi) {
      this.navItems.splice(2, 0, {
        label: 'Calendar Workbench',
        path: '/calendar',
        description: 'Mock-mode route for calendar widget development.',
      });
    }
  }
}
