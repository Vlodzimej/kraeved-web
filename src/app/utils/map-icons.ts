import * as L from "leaflet";

const baseIconPath = "assets/markers";

const typeToIcon: Record<string, string> = {
  military_memorial: "map_icon_monument.svg",
  person_monument: "map_icon_monument.svg",
  event_monument: "map_icon_monument.svg",
  memorial_plaque: "map_icon_monument.svg",
  technical_monument: "map_icon_industrial.svg",
  sculpture: "map_icon_monument.svg",
  orthodox_church: "map_icon_church.svg",
  monastery: "map_icon_church.svg",
  chapel: "map_icon_church.svg",
  holy_spring: "map_icon_water.svg",
  manor: "map_icon_manor.svg",
  manor_park: "map_icon_park.svg",
  historical_building: "map_icon_historical_building.svg",
  merchant_house: "map_icon_historical_building.svg",
  industrial_object: "map_icon_industrial.svg",
  water_tower: "map_icon_industrial.svg",
  bridge: "map_icon_bridge.svg",
  railway_station: "map_icon_railway.svg",
  river: "map_icon_water.svg",
  lake: "map_icon_water.svg",
  pond: "map_icon_water.svg",
  spring: "map_icon_water.svg",
  ravine: "map_icon_landscape.svg",
  hill: "map_icon_landscape.svg",
  valley: "map_icon_landscape.svg",
  quarry: "map_icon_quarry.svg",
  cave: "map_icon_landscape.svg",
  old_tree: "map_icon_tree.svg",
  grove: "map_icon_tree.svg",
  alley: "map_icon_park.svg",
  park: "map_icon_park.svg",
  national_park: "map_icon_park.svg",
  nature_reserve: "map_icon_park.svg",
  natural_monument: "map_icon_landscape.svg",
  ancient_settlement: "map_icon_archaeology.svg",
  hillfort: "map_icon_archaeology.svg",
  burial_mound: "map_icon_archaeology.svg",
  ancient_settlement_site: "map_icon_archaeology.svg",
  city: "map_icon_settlement.svg",
  village: "map_icon_settlement.svg",
  tract: "map_icon_settlement.svg",
  viewpoint: "map_icon_viewpoint.svg",
  tourist_route: "map_icon_route.svg",
  tourist_camp: "map_icon_camp.svg",
  museum: "map_icon_museum.svg",
  visitor_center: "map_icon_visitor_center.svg",
  ecological_trail: "map_icon_route.svg",
};

export function createTypeIcon(typeName: string | undefined): L.DivIcon {
  const iconFile = typeName
    ? typeToIcon[typeName.toLowerCase()] ?? "map_icon_unknown.svg"
    : "map_icon_unknown.svg";

  return L.divIcon({
    html: `<img src="${baseIconPath}/${iconFile}" class="marker-icon" alt="${typeName ?? "unknown"}" />`,
    className: "custom-marker-wrapper",
    iconSize: [64, 64],
    iconAnchor: [32, 64],
    tooltipAnchor: [0, -64],
  });
}
