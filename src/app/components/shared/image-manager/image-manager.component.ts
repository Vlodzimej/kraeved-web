import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ImagesService } from "../../../services/images.service";
import { environment } from "../../../../environments/environment";

export interface ManagedImage {
  id?: number | null;
  filename: string;
  caption?: string | null;
}

@Component({
  selector: "app-image-manager",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./image-manager.component.html",
  styleUrl: "./image-manager.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageManagerComponent {
  images = input<ManagedImage[]>([]);
  imagesChange = output<ManagedImage[]>();
  closed = output<void>();

  uploadLoading = signal(false);
  editingCaptionId: number | null = null;
  editingCaptionValue = "";

  private imagesService = inject(ImagesService);

  imageUrl(filename: string): string {
    return `${environment.apiUrl}/Images/thumbnail/${filename}`;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files?.length) return;

    this.uploadLoading.set(true);
    this.imagesService.upload(Array.from(files)).subscribe({
      next: (filenames: string[]) => {
        const current = this.images();
        const newItems: ManagedImage[] = filenames.map((f) => ({ filename: f }));
        this.imagesChange.emit([...current, ...newItems]);
        this.uploadLoading.set(false);
        input.value = "";
      },
      error: () => {
        this.uploadLoading.set(false);
        input.value = "";
      },
    });
  }

  removeImage(item: ManagedImage): void {
    const current = this.images();
    this.imagesChange.emit(
      current.filter(
        (i) => i.filename !== item.filename && i.id !== item.id,
      ),
    );
  }

  setAsThumbnail(item: ManagedImage): void {
    const current = this.images();
    const updated = current.filter(
      (i) => i.filename !== item.filename && i.id !== item.id,
    );
    this.imagesChange.emit([item, ...updated]);
  }

  startEditCaption(item: ManagedImage): void {
    this.editingCaptionId = item.id ?? null;
    this.editingCaptionValue = item.caption ?? "";
  }

  saveCaption(item: ManagedImage): void {
    const current = this.images();
    const updated = current.map((i) =>
      i.filename === item.filename && i.id === item.id
        ? { ...i, caption: this.editingCaptionValue || null }
        : i,
    );
    this.imagesChange.emit(updated);
    this.editingCaptionId = null;
    this.editingCaptionValue = "";
  }

  cancelEditCaption(): void {
    this.editingCaptionId = null;
    this.editingCaptionValue = "";
  }

  isEditing(item: ManagedImage): boolean {
    return (item.id ?? null) === this.editingCaptionId;
  }

  close(): void {
    this.closed.emit();
  }
}
