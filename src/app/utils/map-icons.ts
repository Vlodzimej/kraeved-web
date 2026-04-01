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
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    tooltipAnchor: [0, -15],
  });
}
