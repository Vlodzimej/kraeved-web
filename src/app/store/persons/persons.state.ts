import { Injectable, inject } from "@angular/core";
import { State, Selector, Action, StateContext } from "@ngxs/store";
import { tap, catchError, switchMap } from "rxjs";
import { AdminPersonsService } from "../../services/admin/admin-persons.service";
import {
  LoadPersons,
  CreatePerson,
  UpdatePerson,
  DeletePerson,
} from "./persons.actions";
import { PersonsStateModel, personsStateDefaults } from "./persons.model";
import { Person } from "../../models/admin/entities.model";

@State<PersonsStateModel>({
  name: "persons",
  defaults: personsStateDefaults,
})
@Injectable()
export class PersonsState {
  @Selector()
  static items(state: PersonsStateModel): Person[] {
    return state.items;
  }

  @Selector()
  static loading(state: PersonsStateModel): boolean {
    return state.loading;
  }

  @Selector()
  static error(state: PersonsStateModel): string | null {
    return state.error;
  }

  private service = inject(AdminPersonsService);

  @Action(LoadPersons)
  loadPersons(ctx: StateContext<PersonsStateModel>) {
    ctx.patchState({ loading: true, error: null });
    return this.service.getAll().pipe(
      tap((items) => {
        ctx.patchState({ items, loading: false });
      }),
      catchError((err) => {
        ctx.patchState({ loading: false, error: err.message });
        throw err;
      }),
    );
  }

  @Action(CreatePerson)
  createPerson(ctx: StateContext<PersonsStateModel>, { person }: CreatePerson) {
    return this.service.create(person).pipe(
      switchMap(() => ctx.dispatch(new LoadPersons())),
      catchError((err) => {
        ctx.patchState({ error: err.message });
        throw err;
      }),
    );
  }

  @Action(UpdatePerson)
  updatePerson(ctx: StateContext<PersonsStateModel>, { person }: UpdatePerson) {
    return this.service.update(person).pipe(
      switchMap(() => ctx.dispatch(new LoadPersons())),
      catchError((err) => {
        ctx.patchState({ error: err.message });
        throw err;
      }),
    );
  }

  @Action(DeletePerson)
  deletePerson(ctx: StateContext<PersonsStateModel>, { id }: DeletePerson) {
    return this.service.delete(id).pipe(
      switchMap(() => ctx.dispatch(new LoadPersons())),
      catchError((err) => {
        ctx.patchState({ error: err.message });
        throw err;
      }),
    );
  }
}
