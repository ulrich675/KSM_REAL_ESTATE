#!/bin/bash
# ============================================================
# start.sh — KSM Real Estate · Script de démarrage fiable v2
# Author : ulrich675
# Usage  : bash start.sh          → démarrage simple
#          bash start.sh --build  → recompile backend + rebuild images
# ============================================================

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

echo ""
echo "🏠  KSM Real Estate — Démarrage de la plateforme"
echo "=================================================="

# ── Étape 1 : Stopper tout docker-compose en cours ──────────────────────────
echo ""
echo "🛑  Arrêt des processus docker-compose en cours..."
docker-compose down --remove-orphans 2>/dev/null || true
sleep 2

# ── Étape 2 : Purger TOUS les conteneurs liés à ce projet ───────────────────
echo "🧹  Nettoyage complet des conteneurs KSM..."
# Purge par nom exact
docker rm -f ksm_backend ksm_frontend ksm_postgres ksm_redis \
              ksm_elasticsearch ksm_kafka ksm_zookeeper 2>/dev/null || true
# Purge des fantômes avec noms auto-générés liés aux images ksm
docker ps -a --format "{{.ID}} {{.Names}}" | grep -E "ksm_frontend|ksm_backend|ksm_real_estate" | \
    awk '{print $1}' | xargs -r docker rm -f 2>/dev/null || true
echo "  ✓ Nettoyage complet terminé"

# ── Étape 3 : Recompiler le backend si --build demandé ─────────────────────
if [[ "$1" == "--build" ]]; then
    echo ""
    echo "⚙️   Compilation du backend Java (Maven)..."
    cd "$PROJECT_DIR/KSM_REAL_ESTATE_backend"
    mvn clean package -DskipTests -q
    cd "$PROJECT_DIR"
    echo "  ✓ Backend compilé avec succès"
    BUILD_FLAG="--build"
else
    BUILD_FLAG=""
fi

# ── Étape 4 : Lancer tous les conteneurs en arrière-plan ───────────────────
echo ""
echo "🚀  Démarrage de tous les services Docker..."
docker-compose up -d $BUILD_FLAG

# ── Étape 5 : Attendre que le frontend soit réellement prêt ────────────────
echo ""
echo "⏳  Attente du démarrage du frontend..."
MAX=30
COUNT=0
until curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; do
    sleep 2
    COUNT=$((COUNT+1))
    if [ $COUNT -ge $MAX ]; then
        echo "  ⚠️  Le frontend tarde à démarrer. Vérifiez avec: docker logs ksm_frontend"
        break
    fi
done

# ── Étape 6 : Afficher le statut final ────────────────────────────────────
echo ""
echo "📋  État des conteneurs :"
docker ps --format "  {{.Names}} → {{.Status}}" | grep ksm
echo ""
echo "✅  Plateforme prête !"
echo "   ➡️   Ouvrez votre navigateur sur : http://localhost:3000"
echo ""
echo "💡  Pour arrêter : docker-compose down"
echo "💡  Pour voir les logs backend : docker logs -f ksm_backend"
echo ""
