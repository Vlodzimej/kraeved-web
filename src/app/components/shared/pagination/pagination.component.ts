import {
  Component,
  input,
  output,
  computed,
} from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-pagination",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pagination-container">
      <div class="pagination-info">
        {{ startItem() }}–{{ endItem() }} из {{ totalItems() }}
      </div>
      <div class="pagination-controls">
        <button
          class="pagination-btn"
          [disabled]="currentPage() <= 1"
          (click)="pageChange.emit(currentPage() - 1)"
          aria-label="Предыдущая страница"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        @for (page of visiblePages(); track page) {
          <button
            class="pagination-btn"
            [class.active]="page === currentPage()"
            (click)="pageChange.emit(page)"
          >
            {{ page }}
          </button>
        }

        <button
          class="pagination-btn"
          [disabled]="currentPage() >= totalPages()"
          (click)="pageChange.emit(currentPage() + 1)"
          aria-label="Следующая страница"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
      <div class="page-size-selector">
        <select
          [value]="pageSize()"
          (change)="onPageSizeChange($event)"
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
        </select>
        <span>на странице</span>
      </div>
    </div>
  `,
  styles: [`
    .pagination-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      background: #fff;
      border-top: 1px solid #eee;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .pagination-info {
      font-size: 0.8125rem;
      color: #666;
      white-space: nowrap;
    }

    .pagination-controls {
      display: flex;
      gap: 0.25rem;
      align-items: center;
    }

    .pagination-btn {
      min-width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #ddd;
      background: #fff;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8125rem;
      color: #333;
      transition: all 0.15s;
      padding: 0 0.5rem;

      &:hover:not(:disabled) {
        background: #f0f7ff;
        border-color: #2196f3;
      }

      &.active {
        background: #2196f3;
        border-color: #2196f3;
        color: #fff;
      }

      &:disabled {
        opacity: 0.4;
        cursor: default;
      }
    }

    .page-size-selector {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      color: #666;

      select {
        padding: 0.25rem 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 0.8125rem;
      }
    }
  `],
})
export class PaginationComponent {
  totalItems = input.required<number>();
  currentPage = input(1);
  pageSize = input(10);

  pageChange = output<number>();
  pageSizeChange = output<number>();

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalItems() / this.pageSize())),
  );

  visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    const maxVisible = 5;

    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = Math.min(total, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  });

  startItem = computed(() => {
    if (this.totalItems() === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });

  endItem = computed(() =>
    Math.min(this.currentPage() * this.pageSize(), this.totalItems()),
  );

  onPageSizeChange(event: Event): void {
    const value = +(event.target as HTMLSelectElement).value;
    this.pageSizeChange.emit(value);
    this.pageChange.emit(1);
  }
}
