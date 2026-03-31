import { computed, Signal, signal, WritableSignal } from "@angular/core";
import { Store } from "@ngxs/store";

export interface AdminCardState<T> {
  selectedItem: WritableSignal<T | null>;
  isNewItem: WritableSignal<boolean>;
  showDeleteConfirm: WritableSignal<boolean>;
  deleteItemId: WritableSignal<number | null>;
  showCloseConfirm: WritableSignal<boolean>;
  hasChanges: Signal<boolean>;
}

export abstract class BaseAdminComponent<T extends { id?: number | null }> {
  protected store = new Store();

  selectedItem = signal<T | null>(null);
  isNewItem = signal(false);
  showDeleteConfirm = signal(false);
  deleteItemId = signal<number | null>(null);
  showCloseConfirm = signal(false);

  protected abstract getInitialFormData(): void;
  protected abstract populateForm(item: T): void;
  protected abstract hasFormChanges(): boolean;

  hasChanges = computed(() => {
    return this.selectedItem() !== null && this.hasFormChanges();
  });

  selectItem(item: T): void {
    this.isNewItem.set(false);
    this.selectedItem.set(item);
    this.populateForm(item);
  }

  openCreate(): void {
    this.isNewItem.set(true);
    const newItem = this.createNewItem();
    this.selectedItem.set(newItem);
    this.getInitialFormData();
  }

  protected abstract createNewItem(): T;

  closeCard(): void {
    if (this.hasChanges()) {
      this.showCloseConfirm.set(true);
    } else {
      this.selectedItem.set(null);
    }
  }

  confirmClose(): void {
    this.showCloseConfirm.set(false);
    this.selectedItem.set(null);
  }

  cancelClose(): void {
    this.showCloseConfirm.set(false);
  }

  onDelete(id: number): void {
    this.deleteItemId.set(id);
    this.showDeleteConfirm.set(true);
  }

  confirmDelete(): void {
    const id = this.deleteItemId();
    if (id !== null) {
      this.handleDelete(id);
    }
    this.showDeleteConfirm.set(false);
    this.deleteItemId.set(null);
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
    this.deleteItemId.set(null);
  }

  protected abstract handleDelete(id: number): void;

  protected abstract handleSave(): void;
}
