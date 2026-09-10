#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
env_file="$repo_root/.env"

if [[ -z "${CODING_TOOLS_MCP_SERVER_URL:-}" && -f "$env_file" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$env_file"
  set +a
fi

: "${CODING_TOOLS_MCP_SERVER_URL:?Set CODING_TOOLS_MCP_SERVER_URL in .env (see .env.example)}"

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
