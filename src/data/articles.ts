export interface Article {
  id: string;
  location: string; // e.g., "Aisle A, Rack 12"
  floor: string;    // e.g., "Floor 3"
}

export const warehouseArticles: Article[] = [
  { id: "ART-001", location: "Aisle A, Rack 01", floor: "Floor 1" },
  { id: "ART-002", location: "Aisle A, Rack 02", floor: "Floor 1" },
  { id: "ART-003", location: "Aisle B, Rack 05", floor: "Floor 2" },
  { id: "ART-004", location: "Aisle C, Rack 10", floor: "Floor 3" },
  { id: "ART-005", location: "Aisle D, Rack 03", floor: "Floor 1" },
  { id: "ART-006", location: "Aisle E, Rack 07", floor: "Floor 2" },
  { id: "ART-007", location: "Aisle F, Rack 15", floor: "Floor 3" },
  { id: "ART-008", location: "Aisle G, Rack 08", floor: "Floor 1" },
  { id: "ART-009", location: "Aisle H, Rack 04", floor: "Floor 2" },
  { id: "ART-010", location: "Aisle I, Rack 11", floor: "Floor 3" },
];