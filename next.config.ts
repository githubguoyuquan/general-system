import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "prisma", "bcryptjs", "pino", "thread-stream"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "picsum.photos", pathname: "/**" }],
  },
};

export default nextConfig;
