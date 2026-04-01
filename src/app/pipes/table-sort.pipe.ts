import { Pipe, PipeTransform } from "@angular/core";

export interface SortConfig {
  column: string;
  direction: "asc" | "desc" | null;
}

@Pipe({
  name: "tableSort",
  standalone: true,
  pure: false,
})
export class TableSortPipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform(items: any[] | null | undefined, config: SortConfig): any[] {
    if (!items || !config.direction) {
      return items ?? [];
    }

    const { column, direction } = config;
    const sorted = [...items].sort((a, b) => {
      const valA = a[column];
      const valB = b[column];

      if (valA == null && valB == null) return 0;
      if (valA == null) return direction === "asc" ? -1 : 1;
      if (valB == null) return direction === "asc" ? 1 : -1;

      if (typeof valA === "number" && typeof valB === "number") {
        return direction === "asc" ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      return direction === "asc"
        ? strA.localeCompare(strB, "ru")
        : strB.localeCompare(strA, "ru");
    });

    return sorted;
  }
}
