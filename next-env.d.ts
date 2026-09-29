[build]
  command = "npx prisma generate && npm run build"
  publish = ".next"
[build.environment]
  NODE_VERSION = "22"   # antes 18 (sin actualizaciones de seguridad desde 2025)
[[plugins]]
  package = "@netlify/plugin-nextjs"
[[headers]]
  for = "/*"
  [headers.values]
    Strict-Transport-Security = "max-age=31536000; includeSubDomains; preload"
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
