import type { NextConfig } from "next";

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true
});

const nextConfig: NextConfig = {
  // Permite probar la app desde tu celular u otros dispositivos en la red local
  allowedDevOrigins: ['192.168.2.56'],
};

export default withPWA(nextConfig);
