import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { DashboardMenu } from "./dashboard-menu/dashboard-menu";

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet, DashboardMenu],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {

}
