import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  output,
  computed,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { AdminPersonsService } from "../../../../services/admin/admin-persons.service";
import { Person } from "../../../../models/admin/entities.model";
import { debounceTime, Subject, switchMap, of } from "rxjs";

@Component({
  selector: "app-person-search",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./person-search.component.html",
  styleUrl: "./person-search.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonSearchComponent {
  private service = inject(AdminPersonsService);

  personSelected = output<Person>();
  personCleared = output<void>();

  searchText = signal("");
  selectedPerson = signal<Person | null>(null);
  results = signal<Person[]>([]);
  showDropdown = signal(false);
  loading = signal(false);

  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject
      .pipe(
        debounceTime(300),
        switchMap((query) => {
          if (query.length < 3) {
            this.results.set([]);
            this.showDropdown.set(false);
            return of([]);
          }
          this.loading.set(true);
          return this.service.search(query);
        }),
      )
      .subscribe({
        next: (persons) => {
          this.results.set(persons.filter((p) => p != null));
          this.showDropdown.set(persons.length > 0);
          this.loading.set(false);
        },
        error: () => {
          this.results.set([]);
          this.loading.set(false);
        },
      });
  }

  filteredResults = computed(() => this.results().filter((p) => p != null));

  onInput(value: string): void {
    const filtered = value.replace(/[^a-zA-Zа-яА-ЯёЁ\s-]/g, "");
    this.searchText.set(filtered);
    this.searchSubject.next(filtered);
  }

  onSelect(person: Person): void {
    this.selectedPerson.set(person);
    this.personSelected.emit(person);
    this.searchText.set("");
    this.results.set([]);
    this.showDropdown.set(false);
  }

  clearSelected(): void {
    this.selectedPerson.set(null);
    this.personCleared.emit();
  }

  reset(): void {
    this.selectedPerson.set(null);
    this.searchText.set("");
    this.results.set([]);
    this.showDropdown.set(false);
  }

  onBlur(): void {
    setTimeout(() => this.showDropdown.set(false), 200);
  }

  onFocus(): void {
    if (this.results().length > 0) {
      this.showDropdown.set(true);
    }
  }

  getFullName(person: Person): string {
    return [person.surname, person.firstName, person.patronymic].filter(Boolean).join(" ");
  }
}
