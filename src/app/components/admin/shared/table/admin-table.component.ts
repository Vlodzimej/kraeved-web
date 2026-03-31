import { Component, input, output, TemplateRef } from "@angular/core";
import { NgTemplateOutlet, NgClass } from "@angular/common";

export interface ColumnDef<T> {
  key: string;
  label: string;
  template: TemplateRef<{ $implicit: T }>;
}

@Component({
  selector: "app-admin-table",
  standalone: true,
  imports: [NgTemplateOutlet],
  templateUrl: "./admin-table.component.html",
  styleUrl: "./admin-table.component.scss",
})
export class AdminTableComponent<T extends { id?: number | null }> {
  columns = input.required<ColumnDef<T>[]>();
  rows = input.required<T[]>();
  activeId = input<number | null>(null);

  rowSelected = output<T>();
  rowDelete = output<number>();
}
