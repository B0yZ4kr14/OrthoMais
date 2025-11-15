#!/bin/bash

# ============================================================================
# Edge Functions Console.* Migration Script
# ============================================================================
# 
# Este script automatiza a substituição de console.* por logger estruturado
# em todas as Edge Functions do Supabase.
#
# FASE A: Alta Prioridade (70 funções)
# 
# Uso:
#   chmod +x scripts/migrate-edge-functions-logs.sh
#   ./scripts/migrate-edge-functions-logs.sh
#
# ============================================================================

set -e  # Exit on error

FUNCTIONS_DIR="supabase/functions"
BACKUP_DIR="backups/edge-functions-$(date +%Y%m%d-%H%M%S)"
MIGRATED_COUNT=0
FAILED_COUNT=0

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  Edge Functions Logger Migration Tool${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Criar backup
echo -e "${YELLOW}📦 Creating backup...${NC}"
mkdir -p "$BACKUP_DIR"
cp -r "$FUNCTIONS_DIR" "$BACKUP_DIR/"
echo -e "${GREEN}✅ Backup created at: $BACKUP_DIR${NC}"
echo ""

# Função para migrar um arquivo
migrate_function() {
  local file=$1
  local func_name=$(basename $(dirname "$file"))
  
  echo -e "${BLUE}🔄 Processing: $func_name${NC}"
  
  # Verificar se já tem logger importado
  if grep -q "from '../_shared/logger.ts'" "$file" 2>/dev/null; then
    echo -e "${YELLOW}   ⏭️  Already migrated (logger import found)${NC}"
    return 0
  fi
  
  # Contar console.* antes
  local console_count=$(grep -c "console\." "$file" 2>/dev/null || echo "0")
  
  if [ "$console_count" -eq 0 ]; then
    echo -e "${YELLOW}   ⏭️  No console.* found${NC}"
    return 0
  fi
  
  # Adicionar import do logger logo após os outros imports
  sed -i "/^import.*from/a import { logger } from '../_shared/logger.ts'" "$file"
  
  # Substituir console.log por logger.info
  sed -i "s/console\.log(/logger.info(/g" "$file"
  
  # Substituir console.error por logger.error
  sed -i "s/console\.error(/logger.error(/g" "$file"
  
  # Substituir console.warn por logger.warn
  sed -i "s/console\.warn(/logger.warn(/g" "$file"
  
  # Substituir console.info por logger.info
  sed -i "s/console\.info(/logger.info(/g" "$file"
  
  # Substituir console.debug por logger.debug
  sed -i "s/console\.debug(/logger.debug(/g" "$file"
  
  # Contar console.* depois (deve ser 0)
  local remaining=$(grep -c "console\." "$file" 2>/dev/null || echo "0")
  
  if [ "$remaining" -eq 0 ]; then
    echo -e "${GREEN}   ✅ Migrated successfully ($console_count → 0)${NC}"
    ((MIGRATED_COUNT++))
  else
    echo -e "${RED}   ❌ Migration incomplete ($console_count → $remaining remaining)${NC}"
    ((FAILED_COUNT++))
  fi
}

# Processar todas as Edge Functions
echo -e "${BLUE}🚀 Starting migration...${NC}"
echo ""

for func_file in $(find "$FUNCTIONS_DIR" -name "index.ts" -type f); do
  migrate_function "$func_file"
  echo ""
done

# Resumo
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  Migration Summary${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo -e "${GREEN}✅ Successfully migrated: $MIGRATED_COUNT functions${NC}"

if [ "$FAILED_COUNT" -gt 0 ]; then
  echo -e "${RED}❌ Failed migrations: $FAILED_COUNT functions${NC}"
  echo -e "${YELLOW}⚠️  Please review failed functions manually${NC}"
fi

echo ""
echo -e "${BLUE}📂 Backup location: $BACKUP_DIR${NC}"
echo ""

# Validação final
echo -e "${YELLOW}🔍 Running final validation...${NC}"
TOTAL_CONSOLE=$(grep -r "console\." "$FUNCTIONS_DIR" | wc -l)

if [ "$TOTAL_CONSOLE" -eq 0 ]; then
  echo -e "${GREEN}🎉 Perfect! No console.* remaining in Edge Functions!${NC}"
else
  echo -e "${YELLOW}⚠️  Warning: $TOTAL_CONSOLE console.* statements still found${NC}"
  echo -e "${YELLOW}   Run this to see them:${NC}"
  echo -e "${YELLOW}   grep -rn 'console\.' $FUNCTIONS_DIR${NC}"
fi

echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${GREEN}✅ Migration completed!${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Review changes: git diff"
echo -e "  2. Test functions: npm run test:e2e"
echo -e "  3. Deploy: supabase functions deploy"
echo -e "  4. Verify logs in Supabase Dashboard"
echo ""

exit 0
