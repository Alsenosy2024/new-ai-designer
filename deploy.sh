#!/bin/bash

echo "=================================="
echo "🚀 AI Designer Deployment Script"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if GitHub repo exists
echo -e "${BLUE}📦 Step 1: GitHub Repository${NC}"
cd "/Users/senos/Library/CloudStorage/GoogleDrive-ahmed0ibrahim@gmail.com/My Drive/2023 files/Development/new new ai designer/new-ai-designer"

if git remote -v | grep -q "origin"; then
    echo -e "${GREEN}✅ GitHub repository connected${NC}"
    REPO_URL=$(git remote get-url origin)
    echo "Repository: $REPO_URL"
else
    echo -e "${RED}❌ No GitHub repository found${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}📦 Step 2: Vercel Deployment${NC}"
echo ""
echo "Opening Vercel Dashboard in browser..."
echo ""
open "https://vercel.com/new"

echo -e "${YELLOW}Please follow these steps in the browser:${NC}"
echo ""
echo "1. ✅ Click 'Import Project'"
echo "2. ✅ Select 'Import Git Repository'"
echo "3. ✅ Choose: Alsenosy2024/new-ai-designer"
echo "4. ✅ Configure Frontend:"
echo "     Root Directory: frontend"
echo "     Framework: Vite"
echo "     Build Command: npm run build"
echo "     Output Directory: dist"
echo "     Install Command: npm install --legacy-peer-deps"
echo ""
echo "5. ✅ Add Environment Variables:"
echo "     VITE_API_BASE_URL=http://localhost:8001"
echo "     VITE_GEMINI_DESIGN_API_KEY=gd_H-xso1nO5IgOfVvTDknD_XCmQfxmsJXi"
echo "     VITE_GEMINI_DESIGN_MCP_URL=https://gemini-design-mcp-server-production.up.railway.app/mcp"
echo ""
echo "6. ✅ Click 'Deploy'"
echo ""
echo -e "${GREEN}⏳ Wait for deployment to complete...${NC}"
echo ""

read -p "Press Enter when Frontend deployment is done..."

echo ""
echo -e "${BLUE}📦 Step 3: Backend Deployment (Railway)${NC}"
echo ""
echo "Opening Railway Dashboard..."
open "https://railway.app/new"

echo ""
echo -e "${YELLOW}Please follow these steps in Railway:${NC}"
echo ""
echo "1. ✅ Click 'Deploy from GitHub repo'"
echo "2. ✅ Select: Alsenosy2024/new-ai-designer"
echo "3. ✅ Root Directory: backend"
echo "4. ✅ Add Environment Variables:"
echo "     GEMINI_API_KEY=AIzaSyDXIWzufJ7c5FAgX6qbqh9qxHMdEdMDwz0"
echo "     GEMINI_MODEL=gemini-1.5-pro"
echo "     CORS_ORIGINS=*"
echo ""
echo "5. ✅ Deploy"
echo ""

read -p "Press Enter when Backend deployment is done..."

echo ""
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo ""
echo "Your app should be live at:"
echo "🌐 Frontend: https://new-ai-designer.vercel.app"
echo "🌐 Backend: https://new-ai-designer.up.railway.app"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "1. Update VITE_API_BASE_URL in Vercel to point to your Railway backend URL"
echo "2. Redeploy Frontend from Vercel dashboard"
echo "3. Test your live application!"
echo ""
echo "=================================="

