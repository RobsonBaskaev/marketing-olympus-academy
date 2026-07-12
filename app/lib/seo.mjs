export const SITE_URL = "https://robsonbaskaev.github.io/marketing-olympus-academy";
export const canonicalUrl = (path = "") => `${SITE_URL}/${path ? `${path.replace(/^\/+|\/+$/g, "")}/` : ""}`;
