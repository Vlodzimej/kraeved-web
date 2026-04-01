import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
  viewChild,
  ElementRef,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
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
  lat: number;
  lng: number;
}

const categoryTitles: Record<string, string> = {
  historical_cultural: "Историко-культурное наследие",
  natural: "Природные объекты",
  archaeological: "Археологические объекты",
  toponymic: "Топонимические ориентиры",
  infrastructure: "Инфраструктура и туризм",
};

@Component({
  selector: "app-home",
  standalone: true,
  imports: [FormsModule],
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

  searchQuery = signal("");
  selectedCategory = signal<string | null>(null);
  selectedType = signal<string | null>(null);

  categories = computed(() => {
    const objects = this.geoObjects();
    const cats = new Set<string>();
    for (const obj of objects) {
      if (obj.typeCategoryName) cats.add(obj.typeCategoryName);
    }
    return Array.from(cats).sort();
  });

  types = computed(() => {
    const objects = this.geoObjects();
    const cat = this.selectedCategory();
    const types = new Map<string, string>();
    for (const obj of objects) {
      if (cat && obj.typeCategoryName !== cat) continue;
      if (obj.typeName && obj.typeTitle) {
        if (!types.has(obj.typeName)) {
          types.set(obj.typeName, obj.typeTitle);
        }
      }
    }
    return Array.from(types.entries()).sort((a, b) => a[1].localeCompare(b[1], "ru"));
  });

  filteredObjects = computed(() => {
    const objects = this.geoObjects();
    const query = this.searchQuery().toLowerCase().trim();
    const category = this.selectedCategory();
    const type = this.selectedType();

    return objects.filter((obj) => {
      if (category && obj.typeCategoryName !== category) return false;
      if (type && obj.typeName !== type) return false;
      if (query) {
        const searchable = [obj.name, obj.shortDescription, obj.typeTitle]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!searchable.includes(query)) return false;
      }
      return true;
    });
  });

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
    this.applyFilters();

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

  applyFilters(): void {
    if (!this.map || !this.markersLayer) return;
    this.markersLayer.clearLayers();

    const filtered = this.filteredObjects();
    const filteredIds = new Set(filtered.map((o) => o.id));
    const visibleMarkers = this.allMarkers.filter((md) =>
      filteredIds.has(md.obj.id),
    );

    for (const md of visibleMarkers) {
      md.marker.setLatLng([md.lat, md.lng]);
      this.markersLayer!.addLayer(md.marker);
    }

    this.fitMapToMarkers(visibleMarkers);
    if (visibleMarkers.length > 0) {
      setTimeout(() => this.resolveOverlaps(visibleMarkers), 100);
    }
  }

  private fitMapToMarkers(markers: MarkerData[]): void {
    if (!this.map) return;

    if (markers.length === 0) {
      this.map.setView([54.5293, 36.2754], 13);
      return;
    }

    if (markers.length === 1) {
      this.map.setView([markers[0].lat, markers[0].lng], 18);
      return;
    }

    const bounds = L.latLngBounds(
      markers.map((md) => [md.lat, md.lng]),
    );
    this.map.fitBounds(bounds, { padding: [60, 60], maxZoom: 17 });
  }

  private resolveOverlaps(visible: MarkerData[]): void {
    if (!this.map) return;

    const minPx = 52;
    const map = this.map;

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

  clearFilters(): void {
    this.searchQuery.set("");
    this.selectedCategory.set(null);
    this.selectedType.set(null);
    this.applyFilters();
  }

  onCategoryChange(): void {
    this.selectedType.set(null);
    this.applyFilters();
  }

  getCategoryTitle(key: string): string {
    return categoryTitles[key] || key;
  }
}
