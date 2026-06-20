import { NgIf } from "@angular/common";
import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { CalendarPage } from "./components/calendar-page/calendar-page";

@Component({
  selector: 'app-root',
  imports: [NgIf, RouterOutlet, CalendarPage],
  template: `
    <app-calendar-page *ngIf="isDashboardWidgetMode; else appRoutes"></app-calendar-page>
    <ng-template #appRoutes>
      <router-outlet></router-outlet>
    </ng-template>
  `,
  standalone: true
})
export class App {
  readonly isDashboardWidgetMode =
    ((window as any).MYOBRM_CONFIG?.uiContext ?? '').toString() === 'dashboard_widget';
}
