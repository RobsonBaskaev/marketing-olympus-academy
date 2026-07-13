export const SITE_URL = "https://robsonbaskaev.github.io/marketing-olympus-academy";
export const canonicalUrl = (path = "") => `${SITE_URL}/${path ? `${path.replace(/^\/+|\/+$/g, "")}/` : ""}`;
export const OG_IMAGE = { url: `${SITE_URL}/og.png`, width: 1200, height: 630, alt: "Маркетинг Олимп — тренажёр системного маркетинга" };
export const routeMetadata=(path,title,description,extra={})=>({
  title,description,
  alternates:{canonical:canonicalUrl(path)},
  openGraph:{title,description,url:canonicalUrl(path),siteName:"Маркетинг Олимп",locale:"ru_RU",type:"website",images:[OG_IMAGE]},
  twitter:{card:"summary_large_image",title,description,images:[OG_IMAGE.url]},
  ...extra,
});
