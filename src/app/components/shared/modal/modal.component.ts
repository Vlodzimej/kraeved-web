import {
  Component,
  input,
  output,
  effect,
  ElementRef,
  viewChild,
  HostListener,
} from "@angular/core";

@Component({
  selector: "app-modal",
  standalone: true,
  template: `
    @if (isOpen()) {
      <div class="modal-backdrop" (click)="onBackdropClick()">
        <div
          class="modal-container"
          #modalContent
          (click)="$event.stopPropagation()"
          role="dialog"
          aria-modal="true"
        >
          <div class="modal-header">
            <h2 class="modal-title">{{ title() }}</h2>
            <button class="modal-close" (click)="closed.emit()" aria-label="Закрыть">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <ng-content></ng-content>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.15s ease-out;
    }

    .modal-container {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      width: 90%;
      max-width: 560px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      animation: slideIn 0.2s ease-out;
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid #eee;
    }

    .modal-title {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: #333;
    }

    .modal-close {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.25rem;
      color: #999;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.15s, background 0.15s;

      &:hover {
        color: #333;
        background: #f0f0f0;
      }
    }

    .modal-body {
      padding: 1.25rem;
      overflow-y: auto;
      flex: 1;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
  `],
})
export class ModalComponent {
  isOpen = input(false);
  title = input.required<string>();

  closed = output<void>();

  private modalContent = viewChild<ElementRef<HTMLElement>>("modalContent");

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    });
  }

  @HostListener("document:keydown.escape")
  onEscape(): void {
    if (this.isOpen()) {
      this.closed.emit();
    }
  }

  onBackdropClick(): void {
    this.closed.emit();
  }
}
