import { Routes } from '@angular/router';
import { authGuard } from './services/auth.guard';
import { AdminShell } from './components/admin-shell/admin-shell';
import { CalendarPage } from './components/calendar-page/calendar-page';
import { DashboardWrapper } from './components/dashboard-wrapper/dashboard-wrapper';
import { OverviewPage } from './components/overview-page/overview-page';
import { UpgradePromo } from './components/upgrade-promo/upgrade-promo';

export const routes: Routes = [
  {
    path: '',
    component: AdminShell,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'overview',
      },
      {
        path: 'overview',
        component: OverviewPage,
      },
      {
        path: 'runtime-errors',
        component: DashboardWrapper,
      },
      {
        path: 'calendar',
        component: CalendarPage,
      },
      {
        path: 'upgrade',
        component: UpgradePromo,
      },
      {
        path: 'dashboard',
        pathMatch: 'full',
        redirectTo: 'runtime-errors',
      },
      {
        path: '**',
        redirectTo: 'overview',
      }
    ]
  },
];

