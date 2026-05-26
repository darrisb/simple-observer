import { Injectable } from '@angular/core';
import { LocationStrategy } from '@angular/common';

@Injectable()
export class InternalRouterLocationStrategy extends LocationStrategy {
  private currentPath = '/';

  override path(includeHash: boolean = false): string {
    return this.currentPath;
  }

  override prepareExternalUrl(internal: string): string {
    if (!internal) {
      return '/';
    }

    return internal.startsWith('/') ? internal : `/${internal}`;
  }

  override getState(): unknown {
    return null;
  }

  override pushState(state: unknown, title: string, url: string, queryParams: string): void {
    this.currentPath = this.composeUrl(url, queryParams);
  }

  override replaceState(state: unknown, title: string, url: string, queryParams: string): void {
    this.currentPath = this.composeUrl(url, queryParams);
  }

  override forward(): void {}

  override back(): void {}

  override historyGo(relativePosition: number = 0): void {}

  override onPopState(fn: (event: PopStateEvent) => void): void {
    // Intentionally no-op: this strategy isolates router navigation from browser history.
  }

  override getBaseHref(): string {
    return '/';
  }

  private composeUrl(url: string, queryParams: string): string {
    const normalizedUrl = this.prepareExternalUrl(url || '/');

    if (!queryParams) {
      return normalizedUrl;
    }

    return `${normalizedUrl}?${queryParams}`;
  }
}
