import type { NextConfig } from "next";

// Made some modifications so this gets wrapped into the Electron application!
const nextConfig: NextConfig = {
  output: "export",
  assetPrefix: "./",
  distDir: "dist/renderer/out",
};

export default nextConfig;
