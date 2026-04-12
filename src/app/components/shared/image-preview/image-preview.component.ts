import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  HostListener,
  inject,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ImageCacheService } from "../../../services/image-cache.service";

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
  private imageCache = inject(ImageCacheService);

  images = signal<ImagePreviewItem[]>([]);
  currentIndex = signal(0);
  isOpen = signal(false);
  currentImageUrl = signal<string | null>(null);

  currentImage = computed(() => {
    const imgs = this.images();
    const idx = this.currentIndex();
    return imgs[idx] ?? null;
  });

  currentCaption = computed(() => {
    const img = this.currentImage();
    return img?.caption ?? null;
  });

  constructor() {
    effect(() => {
      const img = this.currentImage();
      if (img) {
        this.imageCache.getImageUrl(img.filename).subscribe((url) => {
          this.currentImageUrl.set(url);
        });
        this.preloadAdjacent();
      } else {
        this.currentImageUrl.set(null);
      }
    });
  }

  private preloadAdjacent(): void {
    const imgs = this.images();
    const idx = this.currentIndex();
    if (idx > 0) {
      this.imageCache.preloadImage(imgs[idx - 1].filename);
    }
    if (idx < imgs.length - 1) {
      this.imageCache.preloadImage(imgs[idx + 1].filename);
    }
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
    this.currentImageUrl.set(null);
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
