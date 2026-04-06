import { Component, input, output, signal, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { GeoObjectCustomFields } from "../../../../models/admin/entities.model";

const OKN_FIELD_LABELS: Record<keyof GeoObjectCustomFields, string> = {
  okn_full_name: "Наименование ОКН",
  regulatory_legal_info: "Наименование и реквизиты нпа органа гос. власти о постановке ОКН на гос. охрану",
  location_description: "Местонахождение ОКН",
  cadastral_address: "Адрес ОКН",
  egrokn_status: "АИС ЕГРОКН (статус)",
  object_type: "вид ОКН",
  date: "Датировка",
  status: "Категории историко-культурного значения",
};

const OKN_FIELD_KEYS = Object.keys(OKN_FIELD_LABELS) as (keyof GeoObjectCustomFields)[];

@Component({
  selector: "app-okn-fields-dialog",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./okn-fields-dialog.component.html",
  styleUrl: "./okn-fields-dialog.component.scss",
})
export class OknFieldsDialogComponent {
  initialData = input<GeoObjectCustomFields | null>(null);

  saved = output<GeoObjectCustomFields>();
  cancelled = output<void>();

  fieldLabels = OKN_FIELD_LABELS;
  fieldKeys = OKN_FIELD_KEYS;

  formValues = signal<Record<string, string>>(this._initFormValues());

  private _initFormValues(): Record<string, string> {
    const data = this.initialData();
    const values: Record<string, string> = {};
    for (const key of OKN_FIELD_KEYS) {
      values[key] = data?.[key] ?? "";
    }
    return values;
  }

  onFieldChange(key: string, value: string): void {
    this.formValues.set({ ...this.formValues(), [key]: value });
  }

  onSave(): void {
    const values = this.formValues();
    const result: GeoObjectCustomFields = {};
    for (const key of OKN_FIELD_KEYS) {
      result[key] = values[key] || null;
    }
    this.saved.emit(result);
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
