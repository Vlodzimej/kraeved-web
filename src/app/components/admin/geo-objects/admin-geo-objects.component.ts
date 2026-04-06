import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from "@angular/core";
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Store } from "@ngxs/store";
import { finalize } from "rxjs";
import { GeoObjectsState } from "../../../store/geo-objects/geo-objects.state";
import { GeoObjectTypesState } from "../../../store/geo-object-types/geo-object-types.state";
import { GeoObjectCategoriesState } from "../../../store/geo-object-categories/geo-object-categories.state";
import {
  LoadGeoObjects,
  CreateGeoObject,
  UpdateGeoObject,
  DeleteGeoObject,
} from "../../../store/geo-objects/geo-objects.actions";
import { LoadGeoObjectTypes } from "../../../store/geo-object-types/geo-object-types.actions";
import { LoadGeoObjectCategories } from "../../../store/geo-object-categories/geo-object-categories.actions";
import {
  GeoObject,
  GeoObjectBrief,
  GeoObjectType,
  GeoObjectCustomFields,
  Person,
  ImageInfo,
} from "../../../models/admin/entities.model";
import { AdminGeoObjectsService } from "../../../services/admin/admin-geo-objects.service";
import { AdminPersonsService } from "../../../services/admin/admin-persons.service";
import { ConfirmDialogComponent } from "../../shared/confirm-dialog/confirm-dialog.component";
import { AdminCardComponent } from "../shared/card/admin-card.component";
import { PaginationComponent } from "../../shared/pagination/pagination.component";
import { SortableHeaderComponent, SortDirection } from "../../shared/sortable-header/sortable-header.component";
import { ImageManagerComponent } from "../../shared/image-manager/image-manager.component";
import { PersonSearchComponent } from "../persons/person-search/person-search.component";
import { OknFieldsDialogComponent } from "./okn-fields-dialog/okn-fields-dialog.component";
import { useAdminCrud } from "../shared/use-admin-crud";

const DEFAULT_REGION_ID = 40;

@Component({
  selector: "app-admin-geo-objects",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ConfirmDialogComponent,
    AdminCardComponent,
    PaginationComponent,
    SortableHeaderComponent,
    ImageManagerComponent,
    PersonSearchComponent,
    OknFieldsDialogComponent,
  ],
  templateUrl: "./admin-geo-objects.component.html",
  styleUrl: "./admin-geo-objects.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminGeoObjectsComponent implements OnInit {
  private store = inject(Store);
  private service = inject(AdminGeoObjectsService);
  private personsService = inject(AdminPersonsService);
  private fb = inject(NonNullableFormBuilder);

  items = this.store.selectSignal(GeoObjectsState.items);
  loading = this.store.selectSignal(GeoObjectsState.loading);
  error = this.store.selectSignal(GeoObjectsState.error);

  types = this.store.selectSignal(GeoObjectTypesState.items);
  categories = this.store.selectSignal(GeoObjectCategoriesState.items);

  selectedCategoryId = signal<number | null>(null);

  filteredTypes = computed(() => {
    const catId = this.selectedCategoryId();
    const allTypes = this.types();
    if (catId == null) return allTypes;
    return allTypes.filter((t) => t.categoryId === catId);
  });

  cardLoading = signal(false);
  showImageManager = signal(false);
  showOknFields = signal(false);

  customFields = signal<GeoObjectCustomFields | null>(null);

  isOknCategory = computed(() => {
    const catId = this.selectedCategoryId();
    const categories = this.categories();
    const cat = categories.find((c) => c.id === catId);
    return cat?.name?.toUpperCase() === "OKN";
  });

  images = signal<ImageInfo[]>([]);
  linkedPersons = signal<Person[]>([]);

  parentGeoObject = signal<GeoObjectBrief | null>(null);
  parentSearchQuery = signal("");
  parentSearchResults = signal<GeoObjectBrief[]>([]);
  showParentSearch = signal(false);

  searchQuery = signal("");
  currentPage = signal(1);
  pageSize = signal(10);
  sortColumn = signal<string>("id");
  sortDirection = signal<SortDirection>("asc");

  form = this.fb.group({
    name: ["", Validators.required],
    description: [""],
    shortDescription: [""],
    coordinates: this.fb.control<string>(""),
    regionId: this.fb.control<number | null>({ value: DEFAULT_REGION_ID, disabled: true }),
    categoryId: this.fb.control<number | null>(null),
    typeId: this.fb.control<number | null>(null),
    parentId: this.fb.control<number | null>(null),
  });

  crud = useAdminCrud<GeoObject>(
    () => ({
      name: "",
      description: "",
      shortDescription: "",
      images: [],
      thumbnail: "",
    }),
    (item) => {
      if (!item) return false;
      const formValue = this.form.getRawValue();
      const coords = formValue.coordinates.split(",").map((s) => s.trim());
      const formLat = coords[0] ? parseFloat(coords[0]) : null;
      const formLng = coords[1] ? parseFloat(coords[1]) : null;
      return (
        item.name !== formValue.name ||
        item.description !== formValue.description ||
        item.shortDescription !== formValue.shortDescription ||
        (item.latitude ?? null) !== formLat ||
        (item.longitude ?? null) !== formLng ||
        (item.regionId ?? null) !== formValue.regionId ||
        (item.typeId ?? null) !== formValue.typeId
      );
    },
  );

  filteredItems = computed(() => {
    const items = this.items();
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return items;
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(query) ||
        (i.shortDescription?.toLowerCase().includes(query) ?? false) ||
        (i.typeTitle?.toLowerCase().includes(query) ?? false),
    );
  });

  sortedItems = computed(() => {
    const items = [...this.filteredItems()];
    const column = this.sortColumn();
    const dir = this.sortDirection();
    if (!dir) return items;

    items.sort((a, b) => {
      const valA = (a as unknown as Record<string, unknown>)[column];
      const valB = (b as unknown as Record<string, unknown>)[column];
      if (valA == null && valB == null) return 0;
      if (valA == null) return dir === "asc" ? -1 : 1;
      if (valB == null) return dir === "asc" ? 1 : -1;
      if (typeof valA === "number" && typeof valB === "number") {
        return dir === "asc" ? valA - valB : valB - valA;
      }
      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      return dir === "asc"
        ? strA.localeCompare(strB, "ru")
        : strB.localeCompare(strA, "ru");
    });

    return items;
  });

  pagedItems = computed(() => {
    const items = this.sortedItems();
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return items.slice(start, start + size);
  });

  totalFilteredItems = computed(() => this.filteredItems().length);

  ngOnInit(): void {
    this.store.dispatch(new LoadGeoObjectCategories());
    this.store.dispatch(new LoadGeoObjectTypes());
    this.store.dispatch(new LoadGeoObjects());
  }

  selectItem(item: GeoObjectBrief): void {
    this.crud.isNewItem.set(false);
    this.cardLoading.set(true);
    this.service
      .getById(item.id!)
      .pipe(finalize(() => this.cardLoading.set(false)))
      .subscribe({
        next: (data) => {
          this.crud.selectItem(data);
          this.images.set(data.images ?? []);
          this.customFields.set(
            (data.customFields && typeof data.customFields === "object")
              ? data.customFields as GeoObjectCustomFields
              : null,
          );
          this.parentGeoObject.set(data.parent ?? null);
          const matchedType = this.types().find((t) => t.id === data.typeId);
          const catId = matchedType?.categoryId ?? null;
          this.selectedCategoryId.set(catId);
          this.form.patchValue({
            name: data.name,
            description: data.description,
            shortDescription: data.shortDescription,
            coordinates: data.latitude != null && data.longitude != null
              ? `${data.latitude}, ${data.longitude}`
              : "",
            regionId: data.regionId ?? null,
            categoryId: catId,
            typeId: data.typeId ?? null,
            parentId: data.parentId ?? null,
          });
          this.loadLinkedPersons(data.id!);
        },
      });
  }

  openCreate(): void {
    this.crud.openCreate();
    this.images.set([]);
    this.linkedPersons.set([]);
    this.customFields.set(null);
    this.parentGeoObject.set(null);
    this.parentSearchQuery.set("");
    this.parentSearchResults.set([]);
    this.showParentSearch.set(false);
    this.selectedCategoryId.set(null);
    this.form.reset({
      name: "",
      description: "",
      shortDescription: "",
      coordinates: "",
      regionId: DEFAULT_REGION_ID,
      categoryId: null,
      typeId: null,
      parentId: null,
    });
  }

  closeCard(): void {
    this.crud.closeCard();
  }

  confirmClose(): void {
    this.crud.confirmClose();
    this.images.set([]);
    this.linkedPersons.set([]);
    this.customFields.set(null);
    this.parentGeoObject.set(null);
    this.parentSearchQuery.set("");
    this.parentSearchResults.set([]);
    this.showParentSearch.set(false);
    this.selectedCategoryId.set(null);
    this.form.reset({
      name: "",
      description: "",
      shortDescription: "",
      coordinates: "",
      regionId: null,
      categoryId: null,
      typeId: null,
      parentId: null,
    });
  }

  cancelClose(): void {
    this.crud.cancelClose();
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();
    if (!formValue.categoryId || !formValue.typeId) {
      this.form.markAllAsTouched();
      return;
    }

    const item = this.crud.selectedItem();
    const coords = formValue.coordinates.split(",").map((s) => s.trim());
    const imgs = this.images();
    const geoObject: GeoObject = {
      id: item?.id,
      name: formValue.name,
      description: formValue.description,
      shortDescription: formValue.shortDescription,
      latitude: coords[0] ? parseFloat(coords[0]) : null,
      longitude: coords[1] ? parseFloat(coords[1]) : null,
      regionId: formValue.regionId,
      typeId: formValue.typeId,
      parentId: formValue.parentId,
      images: imgs.length > 0 ? imgs : null,
      thumbnail: imgs.length > 0 ? imgs[0].filename : null,
      customFields: this.customFields(),
    };

    if (this.crud.isNewItem()) {
      this.store.dispatch(new CreateGeoObject(geoObject));
    } else {
      this.store.dispatch(new UpdateGeoObject(geoObject));
    }

    this.crud.resetCard();
  }

  onDelete(id: number): void {
    this.crud.onDelete(id);
  }

  confirmDelete(): void {
    const id = this.crud.deleteItemId();
    if (id !== null) {
      this.store.dispatch(new DeleteGeoObject(id));
    }
    this.crud.confirmDelete();
  }

  cancelDelete(): void {
    this.crud.cancelDelete();
  }

  trackType(_index: number, type: GeoObjectType): number | null {
    return type.id ?? null;
  }

  onCategoryChange(categoryId: number | null): void {
    this.selectedCategoryId.set(categoryId);
    this.form.patchValue({ typeId: null });
  }

  openOknFields(): void {
    this.showOknFields.set(true);
  }

  onOknFieldsSaved(data: GeoObjectCustomFields): void {
    this.customFields.set(data);
    this.showOknFields.set(false);
  }

  onOknFieldsCancelled(): void {
    this.showOknFields.set(false);
  }

  searchParentGeoObject(): void {
    const query = this.parentSearchQuery().trim().toLowerCase();
    if (!query) {
      this.parentSearchResults.set([]);
      return;
    }
    const currentId = this.crud.selectedItem()?.id;
    const results = this.items().filter(
      (i) =>
        i.id !== currentId &&
        i.name.toLowerCase().includes(query),
    );
    this.parentSearchResults.set(results);
    this.showParentSearch.set(true);
  }

  selectParentGeoObject(item: GeoObjectBrief): void {
    this.parentGeoObject.set(item);
    this.form.patchValue({ parentId: item.id });
    this.parentSearchQuery.set("");
    this.parentSearchResults.set([]);
    this.showParentSearch.set(false);
  }

  clearParentGeoObject(): void {
    this.parentGeoObject.set(null);
    this.form.patchValue({ parentId: null });
    this.parentSearchQuery.set("");
    this.parentSearchResults.set([]);
    this.showParentSearch.set(false);
  }

  onSort({ column, direction }: { column: string; direction: SortDirection }): void {
    this.sortColumn.set(column);
    this.sortDirection.set(direction);
    this.currentPage.set(1);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  onImagesChange(images: ImageInfo[]): void {
    this.images.set(images);
  }

  onPersonSelected(person: Person): void {
    const geoObjectId = this.crud.selectedItem()?.id;
    if (!geoObjectId) return;
    const alreadyLinked = this.linkedPersons().some((p) => p.id === person.id);
    if (alreadyLinked) return;

    this.personsService.link(person.id!, geoObjectId).subscribe({
      next: () => {
        this.linkedPersons.set([...this.linkedPersons(), person]);
      },
    });
  }

  removeLinkedPerson(personId: number): void {
    const geoObjectId = this.crud.selectedItem()?.id;
    if (!geoObjectId) return;

    this.personsService.unlink(personId, geoObjectId).subscribe({
      next: () => {
        this.linkedPersons.set(this.linkedPersons().filter((p) => p.id !== personId));
      },
    });
  }

  private loadLinkedPersons(geoObjectId: number): void {
    this.personsService.getPersonsByGeoObjectId(geoObjectId).subscribe({
      next: (persons) => this.linkedPersons.set(persons),
      error: () => this.linkedPersons.set([]),
    });
  }

  getPersonFullName(person: Person): string {
    return [person.surname, person.firstName, person.patronymic].filter(Boolean).join(" ");
  }
}
