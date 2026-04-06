import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { environment } from "../../../../environments/environment";

export type ThumbnailShape = "square" | "circle";
export type ThumbnailSize = "xs" | "sm" | "md" | "lg" | "xl" | number;
export type ThumbnailVariant = "default" | "clickable" | "bordered";

@Component({
  selector: "app-thumbnail",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./thumbnail.component.html",
  styleUrl: "./thumbnail.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThumbnailComponent {
  /** Image filename (appended to /Images/thumbnail/) */
  filename = input<string | null>(null);

  /** Direct image URL (overrides filename) */
  src = input<string | null>(null);

  /** Alt text */
  alt = input<string>("");

  /** Shape: square or circle */
  shape = input<ThumbnailShape>("square");

  /** Size preset or custom pixel value */
  size = input<ThumbnailSize>("md");

  /** Display variant */
  variant = input<ThumbnailVariant>("default");

  /** Initials to show when no image (for avatars) */
  initials = input<string>("");

  /** Click handler */
  clicked = output<void>();

  /** Show placeholder SVG when no image */
  showPlaceholder = input<boolean>(false);

  resolvedSrc = computed(() => {
    const direct = this.src();
    if (direct) return direct;
    const fn = this.filename();
    if (fn) return `${environment.apiUrl}/Images/thumbnail/${fn}`;
    return null;
  });

  resolvedSize = computed(() => {
    const s = this.size();
    if (typeof s === "number") return s;
    const map: Record<string, number> = {
      xs: 32,
      sm: 48,
      md: 72,
      lg: 120,
      xl: 160,
    };
    return map[s] ?? 72;
  });

  isCircle = computed(() => this.shape() === "circle");

  onClick(): void {
    this.clicked.emit();
  }
}
