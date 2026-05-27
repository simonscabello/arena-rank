#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Erro: '$1' não encontrado. Instale antes de continuar."
    exit 1
  fi
}

echo "Verificando pré-requisitos..."
require_command docker
require_command node
require_command npm

if ! docker compose version >/dev/null 2>&1; then
  echo "Erro: 'docker compose' não encontrado. Instale o Docker Compose v2."
  exit 1
fi

NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
if [ "$NODE_MAJOR" -lt 24 ]; then
  echo "Aviso: este projeto requer Node.js >= 24 (atual: $(node -v))."
fi

echo "Subindo MySQL..."
docker compose up -d

echo "Aguardando MySQL..."
MYSQL_CONTAINER="$(docker compose ps -q mysql)"
for _ in $(seq 1 60); do
  HEALTH_STATUS="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{end}}' "$MYSQL_CONTAINER" 2>/dev/null || true)"
  if [ "$HEALTH_STATUS" = "healthy" ]; then
    echo "MySQL pronto."
    break
  fi
  sleep 1
done

if [ "${HEALTH_STATUS:-}" != "healthy" ]; then
  echo "Erro: MySQL não ficou disponível a tempo."
  exit 1
fi

if [ ! -f .env ]; then
  echo "Criando .env a partir de .env.example..."
  cp .env.example .env
fi

if [ ! -d node_modules ]; then
  echo "Instalando dependências..."
  npm install
fi

if ! grep -q '^APP_KEY=.\+' .env; then
  echo "Gerando APP_KEY..."
  node ace generate:key
fi

echo "Rodando migrations..."
node ace migration:run

echo "Iniciando servidor em http://localhost:3333 ..."
npm run dev
