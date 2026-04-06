import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { AdminPersonsService } from "../../../../services/admin/admin-persons.service";
import { PersonTreeNode } from "./genealogy-tree.model";
import { ThumbnailComponent } from "../../../shared/thumbnail/thumbnail.component";

@Component({
  selector: "app-genealogy-tree",
  standalone: true,
  imports: [CommonModule, ThumbnailComponent],
  templateUrl: "./genealogy-tree.component.html",
  styleUrl: "./genealogy-tree.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenealogyTreeComponent {
  private service = inject(AdminPersonsService);
  personId = input.required<number>();
  loading = signal(false);
  tree = signal<PersonTreeNode | null>(null);

  ngOnInit(): void {
    this.loadTree();
  }

  loadTree(): void {
    this.loading.set(true);
    this.service.getFamilyTree(this.personId()).subscribe({
      next: (node) => {
        this.tree.set(node);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  imageUrl(photo: ImageInfo): string {
    return `${environment.apiUrl}/Images/thumbnail/${photo.filename}`;
  }

  fullName(node: { surname?: string | null; firstName?: string | null; patronymic?: string | null }): string {
    return [node.surname, node.firstName, node.patronymic].filter(Boolean).join(" ");
  }

  shortName(node: { surname?: string | null; firstName?: string | null }): string {
    return [node.firstName, node.surname].filter(Boolean).join(" ");
  }

  yearRange(node: { birthDate?: string | null; deathDate?: string | null }): string {
    const parts: string[] = [];
    if (node.birthDate) parts.push(new Date(node.birthDate).getFullYear().toString());
    if (node.deathDate) parts.push(new Date(node.deathDate).getFullYear().toString());
    return parts.length ? parts.join(" — ") : "";
  }
}
