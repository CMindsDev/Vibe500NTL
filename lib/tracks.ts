const R2_ASSETS =
  "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/Assets";

export interface TrackInfo {
  color: string;
  icon: string;
}

export const TRACK_CONFIG: Record<string, TrackInfo> = {
  "Bosques y selvas": {
    color: "#4ADE80",
    icon: `${R2_ASSETS}/BosquesySelvas.svg`,
  },
  "Agricultura sustentable": {
    color: "#A3E635",
    icon: `${R2_ASSETS}/Agriculturasustentable.svg`,
  },
  "Foodtech": {
    color: "#FB923C",
    icon: `${R2_ASSETS}/FoodTech.svg`,
  },
  "Aquacultura": {
    color: "#22D3EE",
    icon: `${R2_ASSETS}/Aquacultura.svg`,
  },
  "Economía azul": {
    color: "#60A5FA",
    icon: `${R2_ASSETS}/Econom%C3%ADaAzul.svg`,
  },
  "Ciudades positivas para la naturaleza": {
    color: "#F59E0B",
    icon: `${R2_ASSETS}/CiudadesPositivas.svg`,
  },
};

const DEFAULT_TRACK: TrackInfo = {
  color: "#FFFBE2",
  icon: "",
};

export function getTrackInfo(trackName: string): TrackInfo {
  const trimmed = trackName.trim();
  return TRACK_CONFIG[trimmed] ?? DEFAULT_TRACK;
}

/** Parse a comma-separated tracks string into an array of { name, info } */
export function parseTracks(tracks: string | null | undefined) {
  if (!tracks) return [];
  return tracks
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .map((name) => ({ name, ...getTrackInfo(name) }));
}
