/** @type {import('next').NextConfig} */
const isGitHubPages = process.env.GITHUB_ACTIONS === "true";
const nextConfig = {
  output: "export",
  distDir: "dist",
  basePath: isGitHubPages ? "/marketing-olympus-academy" : "",
  assetPrefix: isGitHubPages ? "/marketing-olympus-academy/" : "",
};
export default nextConfig;
