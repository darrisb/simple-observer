import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { environment } from '../../environments/environment';

export const authGuard: CanActivateFn = (route, state) => {
  const wpConfig = (window as any).AI_CONFIG;

  if (environment.useMockApi) {
    return true;
  }

  // WordPress embedded mode: nonce/session auth is handled server-side.
  if (wpConfig?.apiUrl && wpConfig?.nonce) {
    return true;
  }

  // Base (non-pro) mode no longer requires API keys.
  return true;
};
