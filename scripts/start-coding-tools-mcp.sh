#!/usr/bin/env bash
set -euo pipefail

export CODING_TOOLS_MCP_SERVER_URL="https://jacks-macbook-air.tail3e3cfe.ts.net"

tailscale funnel 50990 &
funnel_pid=$!

cleanup() {
  kill "$funnel_pid" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

coding-tools-mcp \
  --host 127.0.0.1 \
  --port 50990 \
  --workspace ./
