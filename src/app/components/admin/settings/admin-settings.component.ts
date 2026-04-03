import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FormBuilder, Validators } from "@angular/forms";
import { Store } from "@ngxs/store";
import { AppSettingsState, LoadAppSettings, UpsertAppSetting } from "../../../store/app-settings/app-settings.state";

@Component({
  selector: "app-admin-settings",
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: "./admin-settings.component.html",
  styleUrl: "./admin-settings.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSettingsComponent implements OnInit {
  private store = inject(Store);
  private fb = inject(FormBuilder);

  settings = this.store.selectSignal(AppSettingsState.items);
  loading = this.store.selectSignal(AppSettingsState.loading);

  copyrightForm = this.fb.group({
    value: ["", Validators.required],
  });

  ngOnInit(): void {
    this.store.dispatch(new LoadAppSettings());
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const copyright = this.settings().find((s) => s.key === "copyright");
      if (copyright) {
        this.copyrightForm.patchValue({ value: copyright.value });
      }
    }, 0);
  }

  onSaveCopyright(): void {
    if (this.copyrightForm.invalid) return;
    const value = this.copyrightForm.get("value")?.value ?? "";
    this.store.dispatch(new UpsertAppSetting("copyright", value, "Текст копирайта в футере"));
  }
}
