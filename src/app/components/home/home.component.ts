import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
  viewChild,
  ElementRef,
} from "@angular/core";
import { Router } from "@angular/router";
import { Store } from "@ngxs/store";
import { AuthState } from "../../store/auth/auth.state";
import { Logout } from "../../store/auth/auth.actions";
import { GeoObjectsService } from "../../services/geo-objects.service";
import { GeoObject, GeoObjectBrief } from "../../models/admin/entities.model";
import { createTypeIcon } from "../../utils/map-icons";
import { GeoObjectSearchComponent } from "./geo-object-search/geo-object-search.component";
import * as L from "leaflet";

interface MarkerData {
  obj: GeoObjectBrief;
  marker: L.Marker;
  lat: number;
  lng: number;
}

@Component({
  selector: "app-home",
  standalone: true,
  imports: [GeoObjectSearchComponent],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  private store = inject(Store);
  private router = inject(Router);
  private geoObjectsService = inject(GeoObjectsService);

  isAdmin = this.store.selectSignal(AuthState.isAdmin);
  isAuthenticated = this.store.selectSignal(AuthState.isAuthenticated);
  mapContainer = viewChild<ElementRef<HTMLDivElement>>("mapContainer");

  geoObjects = signal<GeoObjectBrief[]>([]);
  selectedObject = signal<GeoObject | null>(null);

  private map: L.Map | null = null;
  private markersLayer: L.LayerGroup | null = null;
  private allMarkers: MarkerData[] = [];
  private highlightedMarker: MarkerData | null = null;

  ngOnInit(): void {
    this.geoObjectsService.getAll().subscribe({
      next: (objects) => {
        this.geoObjects.set(objects);
        setTimeout(() => this.initMap(), 0);
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

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 20,
    }).addTo(this.map);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png", {
      maxZoom: 20,
    }).addTo(this.map);

    this.markersLayer = L.layerGroup().addTo(this.map);
    this.createMarkers();
    this.updateVisibleMarkers();

    this.map.on("zoomend moveend", () => {
      setTimeout(() => this.updateVisibleMarkers(), 50);
    });

    setTimeout(() => {
      this.map?.invalidateSize();
    }, 200);
  }

  private createMarkers(): void {
    this.allMarkers = [];
    const objects = this.geoObjects();
    for (const obj of objects) {
      if (obj.latitude == null || obj.longitude == null) continue;

      const icon = createTypeIcon(obj.typeName ?? undefined);
      const marker = L.marker([obj.latitude, obj.longitude], { icon });
      marker.bindTooltip(obj.name, {
        permanent: false,
        direction: "top",
        offset: [0, -10],
      });
      marker.on("click", () => {
        this.loadObjectDetails(obj.id!);
      });
      this.allMarkers.push({
        obj,
        marker,
        lat: obj.latitude,
        lng: obj.longitude,
      });
    }
  }

  private updateVisibleMarkers(): void {
    if (!this.map || !this.markersLayer) return;
    this.markersLayer.clearLayers();

    const zoom = this.map.getZoom();
    const cellSize = this.getCellSize(zoom);
    const grid = new Map<string, MarkerData>();

    for (const md of this.allMarkers) {
      const cellKey = this.getCellKey(md.lat, md.lng, cellSize);
      if (!grid.has(cellKey)) {
        grid.set(cellKey, md);
      }
    }

    for (const md of grid.values()) {
      md.marker.setLatLng([md.lat, md.lng]);
      this.markersLayer!.addLayer(md.marker);
    }

    this.resolveOverlaps();
  }

  private getCellSize(zoom: number): number {
    if (zoom >= 18) return 0.00005;
    if (zoom >= 17) return 0.0001;
    if (zoom >= 16) return 0.0003;
    if (zoom >= 15) return 0.0008;
    if (zoom >= 14) return 0.002;
    if (zoom >= 13) return 0.005;
    if (zoom >= 12) return 0.01;
    return 0.02;
  }

  private getCellKey(lat: number, lng: number, cellSize: number): string {
    const cellX = Math.floor(lat / cellSize);
    const cellY = Math.floor(lng / cellSize);
    return `${cellX},${cellY}`;
  }

  private resolveOverlaps(): void {
    if (!this.map) return;

    const minPx = 52;
    const map = this.map;
    const visible = this.allMarkers.filter((md) =>
      this.markersLayer!.hasLayer(md.marker),
    );

    for (const md of visible) {
      md.marker.setLatLng([md.lat, md.lng]);
    }

    let changed = true;
    let iterations = 0;
    const maxIterations = 10;

    while (changed && iterations < maxIterations) {
      changed = false;
      iterations++;

      for (let i = 0; i < visible.length; i++) {
        const a = visible[i];
        const pA = map.latLngToContainerPoint(a.marker.getLatLng());

        for (let j = i + 1; j < visible.length; j++) {
          const b = visible[j];
          const pB = map.latLngToContainerPoint(b.marker.getLatLng());

          const dx = pB.x - pA.x;
          const dy = pB.y - pA.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < minPx && dist > 0) {
            changed = true;
            const push = (minPx - dist) / 2 + 2;
            const nx = dx / dist;
            const ny = dy / dist;

            const newA = map.containerPointToLatLng(
              L.point(pA.x - nx * push, pA.y - ny * push),
            );
            const newB = map.containerPointToLatLng(
              L.point(pB.x + nx * push, pB.y + ny * push),
            );

            a.marker.setLatLng(newA);
            b.marker.setLatLng(newB);
          } else if (dist === 0) {
            changed = true;
            const angle = (i * 137.5 * Math.PI) / 180;
            const r = 30 + iterations * 5;
            const newA = map.containerPointToLatLng(
              L.point(pA.x + Math.cos(angle) * r, pA.y + Math.sin(angle) * r),
            );
            const newB = map.containerPointToLatLng(
              L.point(pB.x - Math.cos(angle) * r, pB.y - Math.sin(angle) * r),
            );
            a.marker.setLatLng(newA);
            b.marker.setLatLng(newB);
          }
        }
      }
    }
  }

  private loadObjectDetails(id: number): void {
    this.geoObjectsService.getById(id).subscribe({
      next: (obj) => {
        this.selectedObject.set(obj);
      },
    });
  }

  closeObjectModal(): void {
    this.selectedObject.set(null);
  }

  onLogout(): void {
    this.store.dispatch(new Logout());
    this.router.navigate(["/login"]);
  }

  goToAdmin(): void {
    this.router.navigate(["/admin"]);
  }

  goToLogin(): void {
    this.router.navigate(["/login"]);
  }

  onSearchSelectObject(obj: GeoObjectBrief): void {
    if (obj.latitude == null || obj.longitude == null || !this.map) return;
    this.map.setView([obj.latitude, obj.longitude], 16, { animate: true });
    this.highlightMarker(obj);
  }

  onSearchOpenDetails(obj: GeoObjectBrief): void {
    if (obj.id != null) {
      this.loadObjectDetails(obj.id);
    }
  }

  onSearchPanelClosed(): void {
    this.clearHighlight();
  }

  private highlightMarker(obj: GeoObjectBrief): void {
    this.clearHighlight();
    const md = this.allMarkers.find((m) => m.obj.id === obj.id);
    if (!md) return;

    const el = (md.marker as any)._icon as HTMLElement | undefined;
    if (el) {
      el.classList.add("marker-highlight");
    }
    this.highlightedMarker = md;
  }

  private clearHighlight(): void {
    if (this.highlightedMarker) {
      const el = (this.highlightedMarker.marker as any)._icon as HTMLElement | undefined;
      if (el) {
        el.classList.remove("marker-highlight");
      }
      this.highlightedMarker = null;
    }
  }
}
