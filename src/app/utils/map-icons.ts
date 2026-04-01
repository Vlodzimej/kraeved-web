import * as L from "leaflet";

export const categoryIconMap: Record<string, string> = {
  historical_cultural: "🏛️",
  natural: "🌿",
  archaeological: "🏺",
  toponymic: "📍",
  infrastructure: "🗺️",
};

export function createTypeIcon(
  categoryName: string | undefined,
): L.DivIcon {
  const emoji = categoryName
    ? categoryIconMap[categoryName.toLowerCase()]
    : "📍";

  return L.divIcon({
    html: `<div class="custom-marker">${emoji}</div>`,
    className: "custom-marker-wrapper",
    iconSize: [90, 90],
    iconAnchor: [45, 45],
    tooltipAnchor: [0, -45],
  });
}
