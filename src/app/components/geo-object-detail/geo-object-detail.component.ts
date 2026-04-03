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
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { GeoObjectsService } from "../../services/geo-objects.service";
import { CommentsService, CommentDto } from "../../services/comments.service";
import { GeoObject, PersonBrief } from "../../models/admin/entities.model";
import { environment } from "../../../environments/environment";
import { Store } from "@ngxs/store";
import { AuthState } from "../../store/auth/auth.state";

@Component({
  selector: "app-geo-object-detail",
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: "./geo-object-detail.component.html",
  styleUrl: "./geo-object-detail.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeoObjectDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private geoObjectsService = inject(GeoObjectsService);
  private commentsService = inject(CommentsService);
  private fb = inject(FormBuilder);
  private store = inject(Store);

  geoObject = signal<GeoObject | null>(null);
  persons = signal<PersonBrief[]>([]);
  comments = signal<CommentDto[]>([]);
  loading = signal(false);
  isAuthenticated = this.store.selectSignal(AuthState.isAuthenticated);
  currentUserId = signal<number | null>(null);

  commentForm = this.fb.group({
    text: ["", Validators.required],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.loadGeoObject(+id);
    }
  }

  loadGeoObject(id: number): void {
    this.loading.set(true);
    this.geoObjectsService.getById(id).subscribe({
      next: (obj) => {
        this.geoObject.set(obj);
        this.geoObjectsService.getPersonsByGeoObjectId(id).subscribe({
          next: (p) => this.persons.set(p),
        });
        this.commentsService.getByGeoObjectId(id).subscribe({
          next: (c) => this.comments.set(c),
        });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(["/home"]);
      },
    });
  }

  submitComment(): void {
    if (this.commentForm.invalid || !this.geoObject()) return;
    const text = this.commentForm.get("text")?.value?.trim();
    if (!text) return;

    this.commentsService.add(this.geoObject()!.id!, text).subscribe({
      next: (comment) => {
        this.comments.set([comment, ...this.comments()]);
        this.commentForm.reset();
      },
    });
  }

  deleteComment(commentId: number): void {
    this.commentsService.delete(commentId).subscribe({
      next: () => {
        this.comments.set(this.comments().filter((c) => c.id !== commentId));
      },
    });
  }

  imageUrl(name: string): string {
    return `${environment.apiUrl}/Images/thumbnail/${name}`;
  }

  fullName(person: PersonBrief): string {
    return [person.surname, person.firstName].filter(Boolean).join(" ");
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  getCommentAuthor(comment: CommentDto): string {
    const name = comment.user?.name?.trim();
    const surname = comment.user?.surname?.trim();
    if (name || surname) {
      return `${name || ""} ${surname || ""}`.trim();
    }
    return comment.user?.email ?? "Аноним";
  }

  goBack(): void {
    this.router.navigate(["/home"]);
  }
}
