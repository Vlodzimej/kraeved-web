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
import * as L from "leaflet";

interface MarkerData {
  obj: GeoObjectBrief;
  marker: L.Marker;
}

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

  geoObjects = signal<GeoObjectBrief[]>([]);
  selectedObject = signal<GeoObject | null>(null);

  private map: L.Map | null = null;
  private markersLayer: L.LayerGroup | null = null;
  private allMarkers: MarkerData[] = [];

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

    this.map.on("zoomend", () => this.updateVisibleMarkers());
    this.updateVisibleMarkers();

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
      this.allMarkers.push({ obj, marker });
    }
  }

  private updateVisibleMarkers(): void {
    if (!this.markersLayer || !this.map) return;
    this.markersLayer.clearLayers();

    const zoom = this.map.getZoom();
    const cellSize = this.getCellSize(zoom);
    const grid = new Map<string, MarkerData>();

    for (const md of this.allMarkers) {
      const cellKey = this.getCellKey(md.obj.latitude!, md.obj.longitude!, cellSize);
      if (!grid.has(cellKey)) {
        grid.set(cellKey, md);
      }
    }

    for (const md of grid.values()) {
      this.markersLayer!.addLayer(md.marker);
    }
  }

  private getCellSize(zoom: number): number {
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
}
