import { Component, input, output } from "@angular/core";

@Component({
  selector: "app-admin-card",
  standalone: true,
  templateUrl: "./admin-card.component.html",
  styleUrl: "./admin-card.component.scss",
})
export class AdminCardComponent {
  title = input.required<string>();
  saveLabel = input("Сохранить");
  loading = input(false);

  saved = output<void>();
  closed = output<void>();
}
