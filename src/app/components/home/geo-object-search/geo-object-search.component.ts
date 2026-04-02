import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  output,
} from "@angular/core";
import { SlicePipe } from "@angular/common";
import { Store } from "@ngxs/store";
import { GeoObjectsState } from "../../../store/geo-objects/geo-objects.state";
import { GeoObjectTypesState } from "../../../store/geo-object-types/geo-object-types.state";
import { LoadGeoObjects } from "../../../store/geo-objects/geo-objects.actions";
import { LoadGeoObjectTypes } from "../../../store/geo-object-types/geo-object-types.actions";
import { GeoObjectBrief } from "../../../models/admin/entities.model";

interface SearchResult {
  obj: GeoObjectBrief;
}

@Component({
  selector: "app-geo-object-search",
  standalone: true,
  imports: [SlicePipe],
  templateUrl: "./geo-object-search.component.html",
  styleUrl: "./geo-object-search.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeoObjectSearchComponent {
  private store = inject(Store);

  selectObject = output<GeoObjectBrief>();
  openObjectDetails = output<GeoObjectBrief>();

  isOpen = signal(false);
  searchText = signal("");
  selectedTypeId = signal<number | null>(null);

  geoObjects = this.store.selectSignal(GeoObjectsState.items);
  geoObjectTypes = this.store.selectSignal(GeoObjectTypesState.items);

  filteredResults = computed<SearchResult[]>(() => {
    const objects = this.geoObjects();
    const text = this.searchText().toLowerCase().trim();
    const typeId = this.selectedTypeId();

    if (!text && typeId === null) {
      return [];
    }

    const results: SearchResult[] = [];

    for (const obj of objects) {
      const matchesText = !text ||
        obj.name?.toLowerCase().includes(text) ||
        obj.shortDescription?.toLowerCase().includes(text) ||
        obj.typeName?.toLowerCase().includes(text) ||
        obj.typeTitle?.toLowerCase().includes(text) ||
        obj.typeCategoryName?.toLowerCase().includes(text);

      const matchesType = typeId === null || obj.typeId === typeId;

      if (matchesText && matchesType) {
        results.push({ obj });
      }
    }

    return results.slice(0, 20);
  });

  ngOnInit(): void {
    this.store.dispatch(new LoadGeoObjects());
    this.store.dispatch(new LoadGeoObjectTypes());
  }

  togglePanel(): void {
    this.isOpen.set(!this.isOpen());
    if (!this.isOpen()) {
      this.clearFilters();
    }
  }

  clearFilters(): void {
    if (!this.searchText() && this.selectedTypeId() === null) {
      this.isOpen.set(false);
      return;
    }
    this.searchText.set("");
    this.selectedTypeId.set(null);
  }

  onResultClick(result: SearchResult): void {
    this.selectObject.emit(result.obj);
  }

  onResultDblClick(result: SearchResult): void {
    this.openObjectDetails.emit(result.obj);
  }

  onSearchInput(value: string): void {
    this.searchText.set(value);
  }

  onTypeChange(value: string): void {
    this.selectedTypeId.set(value ? +value : null);
  }

  trackByResult(_index: number, result: SearchResult): number | null {
    return result.obj.id ?? null;
  }
}
