import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "tableFilter",
  standalone: true,
  pure: false,
})
export class TableFilterPipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform(items: any[] | null | undefined, searchTerm: string, columns: string[] = []): any[] {
    if (!items || !searchTerm.trim()) {
      return items ?? [];
    }

    const term = searchTerm.toLowerCase().trim();

    return items.filter((item) =>
      columns.some((col) => {
        const value = item[col];
        if (value == null) return false;
        return String(value).toLowerCase().includes(term);
      }),
    );
  }
}
