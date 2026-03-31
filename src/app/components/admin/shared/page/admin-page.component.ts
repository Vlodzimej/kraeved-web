import { Component, input, output } from "@angular/core";
import { ConfirmDialogComponent } from "../../../shared/confirm-dialog/confirm-dialog.component";

@Component({
  selector: "app-admin-page",
  standalone: true,
  imports: [ConfirmDialogComponent],
  templateUrl: "./admin-page.component.html",
  styleUrl: "./admin-page.component.scss",
})
export class AdminPageComponent {
  title = input.required<string>();
  loading = input(false);
  error = input<string | null>(null);

  showDeleteConfirm = input(false);
  showCloseConfirm = input(false);

  deleteConfirmed = output<void>();
  deleteCancelled = output<void>();
  closeConfirmed = output<void>();
  closeCancelled = output<void>();
}
