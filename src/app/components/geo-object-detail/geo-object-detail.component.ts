import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
  viewChild,
  ElementRef,
  AfterViewInit,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { GeoObjectsService } from "../../services/geo-objects.service";
import { CommentsService, CommentDto } from "../../services/comments.service";
import { GeoObject, GeoObjectCustomFields, PersonBrief, ImageInfo } from "../../models/admin/entities.model";
import { environment } from "../../../environments/environment";
import { Store } from "@ngxs/store";
import { AuthState } from "../../store/auth/auth.state";
import { ImagePreviewComponent, ImagePreviewItem } from "../shared/image-preview/image-preview.component";
import { ThumbnailComponent } from "../shared/thumbnail/thumbnail.component";

@Component({
  selector: "app-geo-object-detail",
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, ImagePreviewComponent, ThumbnailComponent],
  templateUrl: "./geo-object-detail.component.html",
  styleUrl: "./geo-object-detail.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeoObjectDetailComponent implements OnInit, AfterViewInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private geoObjectsService = inject(GeoObjectsService);
  private commentsService = inject(CommentsService);
  private fb = inject(FormBuilder);
  private store = inject(Store);

  commentsSection = viewChild<ElementRef<HTMLDivElement>>("commentsSection");

  geoObject = signal<GeoObject | null>(null);
  persons = signal<PersonBrief[]>([]);
  comments = signal<CommentDto[]>([]);
  loading = signal(false);
  isAuthenticated = this.store.selectSignal(AuthState.isAuthenticated);
  isAdmin = this.store.selectSignal(AuthState.isAdmin);
  currentUser = this.store.selectSignal(AuthState.currentUser);
  currentUserId = signal<number | null>(null);

  imagePreview = viewChild.required<ImagePreviewComponent>("imagePreview");

  commentForm = this.fb.group({
    text: ["", Validators.required],
  });

  oknFieldLabels: Record<string, string> = {
    okn_full_name: "Наименование ОКН",
    regulatory_legal_info: "Наименование и реквизиты нпа органа гос. власти о постановке ОКН на гос. охрану",
    location_description: "Местонахождение ОКН",
    cadastral_address: "Адрес ОКН",
    egrokn_status: "АИС ЕГРОКН (статус)",
    object_type: "вид ОКН",
    date: "Датировка",
    status: "Категории историко-культурного значения",
  };

  oknFields = computed<GeoObjectCustomFields | null>(() => {
    const obj = this.geoObject();
    if (!obj?.customFields) return null;
    const cf = obj.customFields;
    if (typeof cf === "object" && cf !== null) return cf as GeoObjectCustomFields;
    return null;
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.loadGeoObject(+id);
    }
  }

  ngAfterViewInit(): void {
    this.route.fragment.subscribe((fragment) => {
      if (fragment === "comments") {
        setTimeout(() => {
          this.commentsSection()?.nativeElement.scrollIntoView({ behavior: "smooth" });
        }, 300);
      }
    });
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

  canDeleteComment(comment: CommentDto): boolean {
    if (this.isAdmin()) return true;
    return comment.userId === this.currentUser()?.id;
  }

  imageUrl(name: string): string {
    return `${environment.apiUrl}/Images/thumbnail/${name}`;
  }

  getGeoObjectImageFilenames(): ImagePreviewItem[] {
    return this.geoObject()?.images?.map((img: ImageInfo) => ({
      filename: img.filename,
      caption: img.caption ?? null,
    })) ?? [];
  }

  openImagePreview(filename: string): void {
    const images = this.getGeoObjectImageFilenames();
    const index = images.findIndex((img) => img.filename === filename);
    this.imagePreview().open(images, index);
  }

  fullImageUrl(name: string): string {
    return `${environment.apiUrl}/Images/filename/${name}`;
  }

  fullName(person: PersonBrief): string {
    return [person.firstName, person.surname].filter(Boolean).join(" ");
  }

  personImageUrl(photo: string): string {
    return `${environment.apiUrl}/Images/thumbnail/${photo}`;
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

  getCommentInitials(comment: CommentDto): string {
    const name = comment.user?.name?.trim();
    const surname = comment.user?.surname?.trim();
    if (name || surname) {
      return `${name?.[0] ?? ""}${surname?.[0] ?? ""}`.toUpperCase();
    }
    return (comment.user?.email?.[0] ?? "?").toUpperCase();
  }

  commentUserAvatar(comment: CommentDto): string {
    const avatar = comment.user?.avatar;
    if (!avatar) return "";
    return `${environment.apiUrl}/Images/avatar/${avatar}`;
  }

  goBack(): void {
    this.router.navigate(["/home"]);
  }
}
