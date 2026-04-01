import {
  Component,
  input,
  output,
} from "@angular/core";

export type SortDirection = "asc" | "desc" | null;

@Component({
  selector: "app-sortable-header",
  standalone: true,
  template: `
    <span class="sortable-header" (click)="toggleSort()">
      <ng-content></ng-content>
      <span class="sort-icon" [class.active]="direction()">
        @if (direction() === "asc") {
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        } @else if (direction() === "desc") {
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        } @else {
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
            <polyline points="18 15 12 9 6 15" style="opacity: 0.3"></polyline>
          </svg>
        }
      </span>
    </span>
  `,
  styles: [`
    .sortable-header {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      cursor: pointer;
      user-select: none;
      transition: color 0.15s;

      &:hover {
        color: #2196f3;
      }
    }

    .sort-icon {
      display: inline-flex;
      opacity: 0.3;
      transition: opacity 0.15s;

      &.active {
        opacity: 1;
        color: #2196f3;
      }
    }
  `],
})
export class SortableHeaderComponent {
  column = input.required<string>();
  direction = input<SortDirection>(null);

  sortChange = output<{ column: string; direction: SortDirection }>();

  toggleSort(): void {
    const current = this.direction();
    let next: SortDirection;

    if (current === null) {
      next = "asc";
    } else if (current === "asc") {
      next = "desc";
    } else {
      next = null;
    }

    this.sortChange.emit({ column: this.column(), direction: next });
  }
}
