import { Component, input, output } from "@angular/core";
import { ModalComponent } from "../../../shared/modal/modal.component";

@Component({
  selector: "app-admin-card",
  standalone: true,
  imports: [ModalComponent],
  templateUrl: "./admin-card.component.html",
  styleUrl: "./admin-card.component.scss",
})
export class AdminCardComponent {
  isOpen = input(false);
  title = input.required<string>();
  saveLabel = input("Сохранить");
  loading = input(false);

  saved = output<void>();
  closed = output<void>();
}
