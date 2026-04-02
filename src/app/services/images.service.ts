import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map } from "rxjs";
import { KraevedResponse } from "../models/kraeved-response";
import { environment } from "../../environments/environment";

@Injectable({ providedIn: "root" })
export class ImagesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Images`;

  upload(files: File[]): Observable<string[]> {
    const formData = new FormData();
    for (const file of files) {
      formData.append("imageFiles", file, file.name);
    }
    return this.http
      .post<{ filenames: string[] }>(this.apiUrl, formData)
      .pipe(map((res) => res.filenames));
  }

  imageUrl(name: string): string {
    return `${environment.apiUrl}/Images/filename/${name}`;
  }

  thumbnailUrl(name: string): string {
    return `${environment.apiUrl}/Images/thumbnail/${name}`;
  }

  previewUrl(name: string): string {
    return `${environment.apiUrl}/Images/preview/${name}`;
  }
}
