import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";

const withMDX = createMDX();

const nextConfig: NextConfig = {
    output: "standalone", //Reduces the size of the output
    reactStrictMode: true, // Enables React's Strict Mode

    // Disable ESLint during production builds
    eslint: {
        ignoreDuringBuilds: process.env.NODE_ENV === "production", // Disable ESLint in production
    },
};

export default withMDX(nextConfig);
