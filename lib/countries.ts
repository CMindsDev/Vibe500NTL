/**
 * Shared country-code helper.
 * Maps known country names → ISO 3166-1 alpha-2 codes.
 * Returns a flag <img> URL via flagcdn.com (works on all OS including Windows).
 */

export const COUNTRY_CODES: Record<string, string> = {
  chile: "CL",
  colombia: "CO",
  "caquetá y putumayo": "CO",
  panamá: "PA",
  panama: "PA",
  perú: "PE",
  peru: "PE",
  brazil: "BR",
  brasil: "BR",
  ecuador: "EC",
  méxico: "MX",
  mexico: "MX",
  argentina: "AR",
  honduras: "HN",
  guatemala: "GT",
  "costa rica": "CR",
  bolivia: "BO",
  uruguay: "UY",
  paraguay: "PY",
  "república dominicana": "DO",
  "rep. dominicana": "DO",
  "el salvador": "SV",
  nicaragua: "NI",
  venezuela: "VE",
  cuba: "CU",
  haití: "HT",
  haiti: "HT",
  jamaica: "JM",
  "trinidad y tobago": "TT",
  belice: "BZ",
  belize: "BZ",
  guyana: "GY",
  surinam: "SR",
  suriname: "SR",
};

/** Resolve a country name to its ISO alpha-2 code. */
export function getCountryCode(country: string): string {
  const key = country.toLowerCase().trim();
  if (COUNTRY_CODES[key]) return COUNTRY_CODES[key];
  for (const [k, v] of Object.entries(COUNTRY_CODES)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return country.slice(0, 2).toUpperCase();
}

/**
 * Get the flag image URL for a country.
 * Uses flagcdn.com which serves SVG flags that work everywhere.
 * @param country - Country name (e.g. "Chile", "Colombia")
 * @param size - Width in pixels (height auto). Default 20.
 */
export function getFlagUrl(country: string, size = 20): string {
  const code = getCountryCode(country).toLowerCase();
  return `https://flagcdn.com/w${size}/${code}.png`;
}
