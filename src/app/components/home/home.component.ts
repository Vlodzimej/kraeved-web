import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  OnInit,
  signal,
  untracked,
  viewChild,
  ElementRef,
} from "@angular/core";
import { Router } from "@angular/router";
import { Store } from "@ngxs/store";
import { AuthState } from "../../store/auth/auth.state";
import { Logout } from "../../store/auth/auth.actions";
import { GeoObjectsService } from "../../services/geo-objects.service";
import { GeoObject } from "../../models/admin/entities.model";
import * as L from "leaflet";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  private store = inject(Store);
  private router = inject(Router);
  private geoObjectsService = inject(GeoObjectsService);

  isAdmin = this.store.selectSignal(AuthState.isAdmin);
  mapContainer = viewChild<ElementRef<HTMLDivElement>>("mapContainer");

  geoObjects = signal<GeoObject[]>([]);
  selectedObject = signal<GeoObject | null>(null);
  showObjectModal = signal(false);

  private map: L.Map | null = null;
  private markersLayer: L.LayerGroup | null = null;

  ngOnInit(): void {
    this.geoObjectsService.getAll().subscribe({
      next: (objects) => {
        this.geoObjects.set(objects);
        this.initMap();
      },
      error: () => {
        this.geoObjects.set([]);
      },
    });
  }

  private initMap(): void {
    const container = this.mapContainer();
    if (!container) return;

    if (this.map) {
      this.map.remove();
    }

    this.map = L.map(container.nativeElement, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView([54.5293, 36.2754], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(this.map);

    this.markersLayer = L.layerGroup().addTo(this.map);
    this.addMarkers();

    setTimeout(() => {
      this.map?.invalidateSize();
    }, 100);
  }

  private addMarkers(): void {
    if (!this.markersLayer) return;
    this.markersLayer.clearLayers();

    const objects = this.geoObjects();
    for (const obj of objects) {
      if (obj.latitude == null || obj.longitude == null) continue;

      const marker = L.marker([obj.latitude, obj.longitude]);
      marker.bindTooltip(obj.name, {
        permanent: false,
        direction: "top",
        offset: [0, -10],
      });
      marker.on("click", () => {
        this.openObjectDetails(obj);
      });
      this.markersLayer!.addLayer(marker);
    }
  }

  openObjectDetails(obj: GeoObject): void {
    this.selectedObject.set(obj);
    this.showObjectModal.set(true);
  }

  closeObjectModal(): void {
    this.showObjectModal.set(false);
    this.selectedObject.set(null);
  }

  onLogout(): void {
    this.store.dispatch(new Logout());
    this.router.navigate(["/login"]);
  }

  goToAdmin(): void {
    this.router.navigate(["/admin"]);
  }
}
