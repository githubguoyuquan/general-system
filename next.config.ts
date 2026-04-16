import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["@prisma/client", "prisma", "bcryptjs", "pino", "thread-stream"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "picsum.photos", pathname: "/**" }],
  },
};

export default nextConfig;
