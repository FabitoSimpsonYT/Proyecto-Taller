#!/bin/sh
set -eu

cat > /usr/share/nginx/html/runtime-config.js <<EOF
window.__APP_CONFIG__ = {
  API_URL: "${API_URL:-http://backend:5000}"
};
EOF

exec nginx -g 'daemon off;'
