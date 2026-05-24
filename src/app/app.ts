import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet], // Only need RouterOutlet here
  template: `<router-outlet />`,
  standalone: true
})
export class App {}
