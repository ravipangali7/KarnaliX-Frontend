/** Allowed country codes for register (and login) dropdown. */
export const REGISTER_COUNTRY_CODES = ["977", "91", "880", "95", "971", "61"] as const;

/** Flag emoji by country code (Nepal, India, Bangladesh, Myanmar, UAE, Australia). */
export const COUNTRY_FLAG_EMOJI: Record<string, string> = {
  "977": "🇳🇵",
  "91": "🇮🇳",
  "880": "🇧🇩",
  "95": "🇲🇲",
  "971": "🇦🇪",
  "61": "🇦🇺",
};

/** Country code options for Register (and Login) with "Flag (+code)" label. */
export const COUNTRY_CODES = [
  { value: "977", label: "🇳🇵 (+977)" },
  { value: "91", label: "🇮🇳 (+91)" },
  { value: "880", label: "🇧🇩 (+880)" },
  { value: "95", label: "🇲🇲 (+95)" },
  { value: "971", label: "🇦🇪 (+971)" },
  { value: "61", label: "🇦🇺 (+61)" },
] as const;

export type CountryCodeValue = (typeof COUNTRY_CODES)[number]["value"];
