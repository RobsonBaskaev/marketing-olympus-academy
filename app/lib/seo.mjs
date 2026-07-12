export const SITE_URL = "https://robsonbaskaev.github.io/marketing-olympus-academy";
export const canonicalUrl = (path = "") => `${SITE_URL}/${path ? `${path.replace(/^\/+|\/+$/g, "")}/` : ""}`;
export const routeMetadata=(path,title,description,extra={})=>({
  title,description,
  alternates:{canonical:canonicalUrl(path)},
  openGraph:{title,description,url:canonicalUrl(path),siteName:"Маркетинг Олимп",locale:"ru_RU",type:"website"},
  ...extra,
});
