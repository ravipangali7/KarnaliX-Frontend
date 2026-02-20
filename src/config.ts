/**
 * Home page variant: which layout and content to show at "/".
 * Override with VITE_HOME_PAGE=first | second in .env
 */
// export const HOME_PAGE_VARIANT =
//   (import.meta.env.VITE_HOME_PAGE as string)?.trim()?.toLowerCase() === "second"
//     ? "second"
//     : "first";
export const HOME_PAGE_VARIANT = "first";

export type HomePageVariant = "first" | "second";
