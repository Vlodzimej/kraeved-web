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
import { HttpClient } from "@angular/common/http";
import { Observable, forkJoin, of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { ImagesService } from "../../../services/images.service";
import { environment } from "../../../../environments/environment";

export interface ManagedImage {
  id?: number | null;
  filename: string;
  caption?: string | null;
}

export const CAPTION_MAX_LENGTH = 500;

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
  objectId = input<number | null>(null);
  objectType = input<"geoObject" | "person" | null>(null);

  readonly captionMaxLength = CAPTION_MAX_LENGTH;

  uploadLoading = signal(false);
  editingCaptionId: number | null = null;
  editingCaptionValue = "";
  captionError = signal(false);
  draggedIndex: number | null = null;

  private http = inject(HttpClient);
  private imagesService = inject(ImagesService);

  imageUrl(filename: string): string {
    return `${environment.apiUrl}/Images/thumbnail/${filename}`;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files?.length) return;

    this.uploadLoading.set(true);
    const objId = this.objectId();
    const objType = this.objectType();

    this.imagesService.upload(Array.from(files)).pipe(
      finalize(() => {
        this.uploadLoading.set(false);
        input.value = "";
      })
    ).subscribe({
      next: (filenames: string[]) => {
        const current = this.images();

        if (objId != null && objType != null) {
          const requests = filenames.map(filename => 
            this.addImageToObject(objId, objType, filename).pipe(
              catchError(() => of({ filename, id: null, caption: null }))
            )
          );

          forkJoin(requests).subscribe({
            next: results => {
              const newImages = results.map((r: any) => {
                const data = r.data || r;
                return {
                  id: data.id ?? null,
                  filename: data.filename || '',
                  caption: data.caption ?? null
                };
              });
              this.imagesChange.emit([...current, ...newImages]);
            },
            error: err => console.error("forkJoin error:", err)
          });
        } else {
          const newItems = filenames.map(f => ({ filename: f }));
          this.imagesChange.emit([...current, ...newItems]);
        }
      },
      error: () => {
        this.uploadLoading.set(false);
        input.value = "";
      },
    });
  }

  private addImageToObject(objectId: number, objectType: "geoObject" | "person", filename: string): Observable<any> {
    const endpoint = objectType === "geoObject"
      ? `${environment.apiUrl}/GeoObjects/${objectId}/images`
      : `${environment.apiUrl}/Persons/${objectId}/images`;
    return this.http.post(endpoint, { filename });
  }

  removeImage(item: ManagedImage): void {
    if (item.id != null) {
      this.imagesService.delete(item.filename).subscribe({
        error: (err) => {
          console.error("Failed to delete image:", err);
        },
      });
    }
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

  onDragStart(index: number): void {
    this.draggedIndex = index;
  }

  onDragOver(event: DragEvent, index: number): void {
    event.preventDefault();
    if (this.draggedIndex === null || this.draggedIndex === index) return;

    const current = [...this.images()];
    const draggedItem = current[this.draggedIndex];
    current.splice(this.draggedIndex, 1);
    current.splice(index, 0, draggedItem);
    this.draggedIndex = index;
    this.imagesChange.emit(current);
  }

  onDragEnd(): void {
    if (this.draggedIndex !== null) {
      this.saveImagesOrder(this.images());
    }
    this.draggedIndex = null;
  }

  private saveImagesOrder(images: ManagedImage[]): void {
    const objId = this.objectId();
    const objType = this.objectType();
    if (objId == null || objType == null) return;

    const imageIds = images.map(img => img.id).filter((id): id is number => id != null);
    if (imageIds.length === 0) return;

    const endpoint = objType === "geoObject"
      ? `${environment.apiUrl}/GeoObjects/${objId}/images/order`
      : `${environment.apiUrl}/Persons/${objId}/images/order`;
    
    this.http.put(endpoint, { imageIds }).subscribe({
      error: (err) => console.error("Failed to save images order:", err)
    });
  }

  startEditCaption(item: ManagedImage): void {
    this.editingCaptionId = item.id ?? null;
    this.editingCaptionValue = item.caption ?? "";
    this.captionError.set(false);
  }

  saveCaption(item: ManagedImage): void {
    if (this.editingCaptionValue.length > CAPTION_MAX_LENGTH) {
      this.captionError.set(true);
      return;
    }
    this.captionError.set(false);
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
