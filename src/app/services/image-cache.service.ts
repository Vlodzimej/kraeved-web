import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, from, of } from "rxjs";
import { environment } from "../../environments/environment";

@Injectable({ providedIn: "root" })
export class ImageCacheService {
  private http = inject(HttpClient);
  private cache = new Map<string, string>();
  private pending = new Map<string, Observable<string>>();

  getImageUrl(filename: string): Observable<string> {
    if (this.cache.has(filename)) {
      return of(this.cache.get(filename)!);
    }

    if (this.pending.has(filename)) {
      return this.pending.get(filename)!;
    }

    const url = `${environment.apiUrl}/Images/filename/${filename}`;
    const request = this.http.get(url, { responseType: "blob" }).pipe(
    );

    this.pending.set(filename, new Observable<string>((subscriber) => {
      request.subscribe({
        next: (blob) => {
          const blobUrl = URL.createObjectURL(blob);
          this.cache.set(filename, blobUrl);
          this.pending.delete(filename);
          subscriber.next(blobUrl);
          subscriber.complete();
        },
        error: (err) => {
          this.pending.delete(filename);
          subscriber.error(err);
        },
      });
    }));

    return this.pending.get(filename)!;
  }

  preloadImage(filename: string): void {
    if (!this.cache.has(filename) && !this.pending.has(filename)) {
      this.getImageUrl(filename).subscribe();
    }
  }

  clearCache(): void {
    this.cache.forEach((blobUrl) => URL.revokeObjectURL(blobUrl));
    this.cache.clear();
  }
}
