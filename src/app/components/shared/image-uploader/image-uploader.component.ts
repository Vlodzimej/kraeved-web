import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ImagesService } from "../../../services/images.service";
import { environment } from "../../../../environments/environment";

@Component({
  selector: "app-image-uploader",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./image-uploader.component.html",
  styleUrl: "./image-uploader.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageUploaderComponent {
  images = input<string[]>([]);
  imagesChange = output<string[]>();

  uploadLoading = signal(false);

  private imagesService = inject(ImagesService);

  imageUrl = (name: string): string =>
    `${environment.apiUrl}/Images/filename/${name}`;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files?.length) return;

    this.uploadLoading.set(true);
    this.imagesService.upload(Array.from(files)).subscribe({
      next: (filenames: string[]) => {
        const current = this.images();
        this.imagesChange.emit([...current, ...filenames]);
        this.uploadLoading.set(false);
        input.value = "";
      },
      error: () => {
        this.uploadLoading.set(false);
        input.value = "";
      },
    });
  }

  removeImage(filename: string): void {
    const current = this.images();
    this.imagesChange.emit(current.filter((f) => f !== filename));
  }

  setAsThumbnail(filename: string): void {
    const current = this.images();
    const updated = current.filter((f) => f !== filename);
    this.imagesChange.emit([filename, ...updated]);
  }
}
