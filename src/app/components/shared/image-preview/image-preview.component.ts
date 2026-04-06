import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { environment } from "../../../../environments/environment";

export interface ImagePreviewItem {
  filename: string;
  caption?: string | null;
}

@Component({
  selector: "app-image-preview",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./image-preview.component.html",
  styleUrl: "./image-preview.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImagePreviewComponent {
  images = signal<ImagePreviewItem[]>([]);
  currentIndex = signal(0);
  isOpen = signal(false);

  currentImage = computed(() => {
    const imgs = this.images();
    const idx = this.currentIndex();
    return imgs[idx] ?? null;
  });

  currentCaption = computed(() => {
    const img = this.currentImage();
    return img?.caption ?? null;
  });

  imageUrl(filename: string): string {
    return `${environment.apiUrl}/Images/filename/${filename}`;
  }

  open(images: ImagePreviewItem[], startIndex: number = 0): void {
    this.images.set(images);
    this.currentIndex.set(startIndex >= 0 && startIndex < images.length ? startIndex : 0);
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
    this.images.set([]);
    this.currentIndex.set(0);
  }

  prev(): void {
    if (this.currentIndex() > 0) {
      this.currentIndex.set(this.currentIndex() - 1);
    }
  }

  next(): void {
    if (this.currentIndex() < this.images().length - 1) {
      this.currentIndex.set(this.currentIndex() + 1);
    }
  }

  @HostListener("document:keydown.arrowleft")
  onArrowLeft(): void {
    if (this.isOpen()) this.prev();
  }

  @HostListener("document:keydown.arrowright")
  onArrowRight(): void {
    if (this.isOpen()) this.next();
  }

  @HostListener("document:keydown.escape")
  onEscape(): void {
    if (this.isOpen()) this.close();
  }
}
