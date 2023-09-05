/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: true,
        serverActionsBodySizeLimit: '10mb',
        serverComponentsExternalPackages: ['bullmq']
    },
}

module.exports = nextConfig
