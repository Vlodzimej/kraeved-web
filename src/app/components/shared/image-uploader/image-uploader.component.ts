import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ImagesService } from "../../../services/images.service";
import { environment } from "../../../../environments/environment";

export interface ImageItem {
  id?: number | null;
  filename: string;
  caption?: string | null;
}

@Component({
  selector: "app-image-uploader",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./image-uploader.component.html",
  styleUrl: "./image-uploader.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageUploaderComponent {
  images = input<ImageItem[]>([]);
  imagesChange = output<ImageItem[]>();

  uploadLoading = signal(false);
  editingCaptionId: number | null = null;
  editingCaptionValue = "";

  private imagesService = inject(ImagesService);

  imageUrl = (item: ImageItem): string =>
    `${environment.apiUrl}/Images/thumbnail/${item.filename}`;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files?.length) return;

    this.uploadLoading.set(true);
    this.imagesService.upload(Array.from(files)).subscribe({
      next: (filenames: string[]) => {
        const current = this.images();
        const newItems: ImageItem[] = filenames.map((f) => ({ filename: f }));
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

  removeImage(item: ImageItem): void {
    const current = this.images();
    this.imagesChange.emit(
      current.filter(
        (i) => i.filename !== item.filename && i.id !== item.id,
      ),
    );
  }

  setAsThumbnail(item: ImageItem): void {
    const current = this.images();
    const updated = current.filter(
      (i) => i.filename !== item.filename && i.id !== item.id,
    );
    this.imagesChange.emit([item, ...updated]);
  }

  startEditCaption(item: ImageItem): void {
    this.editingCaptionId = item.id ?? null;
    this.editingCaptionValue = item.caption ?? "";
  }

  saveCaption(item: ImageItem): void {
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

  isEditing(item: ImageItem): boolean {
    return (item.id ?? null) === this.editingCaptionId;
  }
}
