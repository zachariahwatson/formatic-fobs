/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: false,
        serverActionsBodySizeLimit: '10mb',
        serverComponentsExternalPackages: ['bullmq']
    },
}

module.exports = nextConfig
