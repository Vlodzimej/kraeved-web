import { computed, Signal, signal, WritableSignal } from "@angular/core";

export interface CrudItem {
  id?: number | null;
}

export interface AdminCrudState<T extends CrudItem> {
  selectedItem: WritableSignal<T | null>;
  isNewItem: WritableSignal<boolean>;
  showDeleteConfirm: WritableSignal<boolean>;
  deleteItemId: WritableSignal<number | null>;
  showCloseConfirm: WritableSignal<boolean>;
  hasChanges: Signal<boolean>;
  selectItem: (item: T) => void;
  openCreate: () => void;
  closeCard: () => void;
  confirmClose: () => void;
  cancelClose: () => void;
  onDelete: (id: number) => void;
  confirmDelete: () => void;
  cancelDelete: () => void;
  resetCard: () => void;
}

export function useAdminCrud<T extends CrudItem>(
  createEmpty: () => T,
  hasChangesCheck: (item: T | null) => boolean,
): AdminCrudState<T> {
  const selectedItem = signal<T | null>(null);
  const isNewItem = signal(false);
  const showDeleteConfirm = signal(false);
  const deleteItemId = signal<number | null>(null);
  const showCloseConfirm = signal(false);

  const hasChanges = computed(() => hasChangesCheck(selectedItem()));

  function selectItem(item: T): void {
    isNewItem.set(false);
    selectedItem.set(item);
  }

  function openCreate(): void {
    isNewItem.set(true);
    selectedItem.set(createEmpty());
  }

  function closeCard(): void {
    if (hasChangesCheck(selectedItem())) {
      showCloseConfirm.set(true);
    } else {
      selectedItem.set(null);
    }
  }

  function confirmClose(): void {
    showCloseConfirm.set(false);
    selectedItem.set(null);
  }

  function cancelClose(): void {
    showCloseConfirm.set(false);
  }

  function onDelete(id: number): void {
    deleteItemId.set(id);
    showDeleteConfirm.set(true);
  }

  function confirmDelete(): void {
    deleteItemId.set(null);
    showDeleteConfirm.set(false);
  }

  function cancelDelete(): void {
    deleteItemId.set(null);
    showDeleteConfirm.set(false);
  }

  function resetCard(): void {
    selectedItem.set(null);
    isNewItem.set(false);
  }

  return {
    selectedItem,
    isNewItem,
    showDeleteConfirm,
    deleteItemId,
    showCloseConfirm,
    hasChanges,
    selectItem,
    openCreate,
    closeCard,
    confirmClose,
    cancelClose,
    onDelete,
    confirmDelete,
    cancelDelete,
    resetCard,
  };
}
