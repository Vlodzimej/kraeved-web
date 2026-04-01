import * as L from "leaflet";

export const typeIconMap: Record<string, string> = {
  museum: "🏛️",
  monument: "🗿",
  church: "⛪",
  park: "🌳",
  theater: "🎭",
  library: "📚",
  school: "🏫",
  hospital: "🏥",
  station: "🚉",
  bridge: "🌉",
  building: "🏢",
  square: "🏙️",
  memorial: "🕯️",
  house: "🏠",
  factory: "🏭",
  fortress: "🏰",
  cemetery: "🪦",
  fountain: "⛲",
  market: "🏪",
  stadium: "🏟️",
};

export function createTypeIcon(typeName: string | undefined): L.DivIcon {
  const emoji = typeName ? typeIconMap[typeName.toLowerCase()] : "📍";

  return L.divIcon({
    html: `<div class="custom-marker">${emoji}</div>`,
    className: "custom-marker-wrapper",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    tooltipAnchor: [0, -15],
  });
}
