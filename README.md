# AI Designer - مصمم معماري ذكي

## نظام تصميم معماري متكامل باستخدام الذكاء الاصطناعي

### المميزات:
- 🏗️ تصميم معماري ذكي باستخدام Gemini 2.0
- 📐 توليد مخططات معمارية دقيقة
- 🎨 واجهة React احترافية
- 🔄 تكامل مع Gemini Design MCP
- 📊 تحليل وإحصائيات متقدمة

### التقنيات المستخدمة:
- **Frontend**: React + Vite
- **Backend**: FastAPI + Python
- **AI**: Gemini 2.0 Flash + MCP
- **3D**: Three.js + React Three Fiber

### النشر على Vercel:

#### Frontend:
```bash
cd frontend
vercel --prod
```

#### Backend:
```bash
cd backend
vercel --prod
```

### Environment Variables:

#### Frontend:
- `VITE_API_BASE_URL`: Backend API URL
- `VITE_GEMINI_DESIGN_API_KEY`: Gemini Design API Key
- `VITE_GEMINI_DESIGN_MCP_URL`: MCP Server URL

#### Backend:
- `GEMINI_API_KEY`: Google Gemini API Key
- `CORS_ORIGINS`: Allowed origins

### التطوير المحلي:

```bash
# Frontend
cd frontend
npm install --legacy-peer-deps
npm run dev

# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

### الرابط المباشر:
- Frontend: https://ai-designer-frontend.vercel.app
- Backend: https://ai-designer-backend.vercel.app

---
Made with ❤️ using Gemini AI
