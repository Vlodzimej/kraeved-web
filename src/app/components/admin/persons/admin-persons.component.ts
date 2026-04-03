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
import { PersonsState } from "../../../store/persons/persons.state";
import {
  LoadPersons,
  CreatePerson,
  UpdatePerson,
  DeletePerson,
} from "../../../store/persons/persons.actions";
import { Person, PersonRelationType, PersonRelationDto } from "../../../models/admin/entities.model";
import { AdminPersonsService } from "../../../services/admin/admin-persons.service";
import { ConfirmDialogComponent } from "../../shared/confirm-dialog/confirm-dialog.component";
import { AdminCardComponent } from "../shared/card/admin-card.component";
import { PaginationComponent } from "../../shared/pagination/pagination.component";
import { SortableHeaderComponent, SortDirection } from "../../shared/sortable-header/sortable-header.component";
import { useAdminCrud } from "../shared/use-admin-crud";
import { ImageUploaderComponent } from "../../shared/image-uploader/image-uploader.component";
import { PersonSearchComponent } from "./person-search/person-search.component";

@Component({
  selector: "app-admin-persons",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ConfirmDialogComponent,
    AdminCardComponent,
    PaginationComponent,
    SortableHeaderComponent,
    ImageUploaderComponent,
    PersonSearchComponent,
  ],
  templateUrl: "./admin-persons.component.html",
  styleUrl: "./admin-persons.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPersonsComponent implements OnInit {
  private store = inject(Store);
  private service = inject(AdminPersonsService);
  private fb = inject(NonNullableFormBuilder);

  items = this.store.selectSignal(PersonsState.items);
  loading = this.store.selectSignal(PersonsState.loading);
  error = this.store.selectSignal(PersonsState.error);

  cardLoading = signal(false);

  searchQuery = signal("");
  currentPage = signal(1);
  pageSize = signal(10);
  sortColumn = signal<string>("id");
  sortDirection = signal<SortDirection>("asc");

  photos = signal<string[]>([]);
  relations = signal<PersonRelationDto[]>([]);
  relationTypes = signal<PersonRelationType[]>([]);
  selectedRelationPerson = signal<Person | null>(null);
  selectedRelationTypeId = signal<number | null>(null);

  form = this.fb.group({
    surname: ["", Validators.required],
    firstName: ["", Validators.required],
    patronymic: [""],
    biography: [""],
    birthDate: [""],
    deathDate: [""],
  });

  crud = useAdminCrud<Person>(
    () => ({
      surname: "",
      firstName: "",
      patronymic: "",
      biography: "",
      photos: [],
    }),
    (item) => {
      if (!item) return false;
      const formValue = this.form.getRawValue();
      return (
        item.surname !== formValue.surname ||
        item.firstName !== formValue.firstName ||
        item.patronymic !== formValue.patronymic ||
        item.biography !== formValue.biography ||
        item.birthDate !== formValue.birthDate ||
        item.deathDate !== formValue.deathDate
      );
    },
  );

  filteredItems = computed(() => {
    const items = this.items();
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return items;
    return items.filter(
      (i) =>
        i.surname.toLowerCase().includes(query) ||
        i.firstName.toLowerCase().includes(query) ||
        (i.patronymic?.toLowerCase().includes(query) ?? false),
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
    this.store.dispatch(new LoadPersons());
    this.service.getRelationTypes().subscribe({
      next: (types) => this.relationTypes.set(types),
    });
  }

  selectItem(item: Person): void {
    this.crud.isNewItem.set(false);
    this.cardLoading.set(true);
    this.service
      .getById(item.id!)
      .pipe(finalize(() => this.cardLoading.set(false)))
      .subscribe({
        next: (data) => {
          this.crud.selectItem(data);
          this.photos.set(data.photos ?? []);
          this.form.patchValue({
            surname: data.surname,
            firstName: data.firstName,
            patronymic: data.patronymic ?? "",
            biography: data.biography ?? "",
            birthDate: data.birthDate ?? "",
            deathDate: data.deathDate ?? "",
          });
          this.loadRelations(data.id!);
        },
      });
  }

  openCreate(): void {
    this.crud.openCreate();
    this.photos.set([]);
    this.relations.set([]);
    this.selectedRelationPerson.set(null);
    this.selectedRelationTypeId.set(null);
    this.form.reset({
      surname: "",
      firstName: "",
      patronymic: "",
      biography: "",
      birthDate: "",
      deathDate: "",
    });
  }

  closeCard(): void {
    this.crud.closeCard();
  }

  confirmClose(): void {
    this.crud.confirmClose();
    this.photos.set([]);
    this.relations.set([]);
    this.selectedRelationPerson.set(null);
    this.selectedRelationTypeId.set(null);
    this.form.reset({
      surname: "",
      firstName: "",
      patronymic: "",
      biography: "",
      birthDate: "",
      deathDate: "",
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

    const item = this.crud.selectedItem();
    const formValue = this.form.getRawValue();
    const photos = this.photos();
    const person: Person = {
      id: item?.id,
      surname: formValue.surname,
      firstName: formValue.firstName,
      patronymic: formValue.patronymic || null,
      biography: formValue.biography || null,
      birthDate: formValue.birthDate || null,
      deathDate: formValue.deathDate || null,
      photos: photos.length > 0 ? photos : null,
    };

    if (this.crud.isNewItem()) {
      this.store.dispatch(new CreatePerson(person));
    } else {
      this.store.dispatch(new UpdatePerson(person));
    }

    this.crud.resetCard();
  }

  onDelete(id: number): void {
    this.crud.onDelete(id);
  }

  confirmDelete(): void {
    const id = this.crud.deleteItemId();
    if (id !== null) {
      this.store.dispatch(new DeletePerson(id));
    }
    this.crud.confirmDelete();
  }

  cancelDelete(): void {
    this.crud.cancelDelete();
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

  onPhotosChange(photos: string[]): void {
    this.photos.set(photos);
  }

  onRelationPersonSelected(person: any): void {
    this.selectedRelationPerson.set(person);
  }

  onRelationTypeSelect(value: string): void {
    this.selectedRelationTypeId.set(value ? +value : null);
  }

  addRelation(): void {
    const personId = this.crud.selectedItem()?.id;
    const relatedId = this.selectedRelationPerson()?.id;
    const typeId = this.selectedRelationTypeId();
    if (!personId || !relatedId || !typeId) return;

    this.service.addRelation(personId, relatedId, typeId).subscribe({
      next: () => {
        this.loadRelations(personId);
        this.selectedRelationPerson.set(null);
        this.selectedRelationTypeId.set(null);
      },
    });
  }

  removeRelation(relation: PersonRelationDto): void {
    const personId = this.crud.selectedItem()?.id;
    if (!personId) return;

    const type = this.relationTypes().find((t) => t.title === relation.relationTitle);
    if (!type) return;

    this.service.removeRelation(personId, relation.personId, type.id).subscribe({
      next: () => this.loadRelations(personId),
    });
  }

  private loadRelations(personId: number): void {
    this.service.getRelations(personId).subscribe({
      next: (rels) => this.relations.set(rels),
      error: () => this.relations.set([]),
    });
  }

  formatDate(date: string | null | undefined): string {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("ru-RU");
  }

  getFullName(person: Person): string {
    const parts = [person.surname, person.firstName, person.patronymic].filter(Boolean);
    return parts.join(" ");
  }
}
