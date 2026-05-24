import { Routes } from '@angular/router';
import { authGuard } from './services/auth.guard';
import { DashboardWrapper } from './components/dashboard-wrapper/dashboard-wrapper';
import { UpgradePromo } from './components/upgrade-promo/upgrade-promo';

export const routes: Routes = [
  {
    path: '',
    component: DashboardWrapper,
    canActivate: [authGuard]
  },
  {
    path: 'dashboard',
    component: DashboardWrapper,
    canActivate: [authGuard]
  },
  { path: 'upgrade', component: UpgradePromo },
  {
    path: '**',
    component: DashboardWrapper,
    canActivate: [authGuard]
  }
];

