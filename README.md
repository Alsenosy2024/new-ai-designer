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

### 🚀 النشر (Deployment):

#### خيارات النشر المتاحة:

##### 1. AWS (موصى به - Free Tier 12 شهر):
- ✅ **Backend**: AWS Elastic Beanstalk
- ✅ **Frontend**: AWS Amplify
- 📚 **دليل النشر**: اقرأ `QUICK_START_AWS.md` أو `AWS_DEPLOYMENT.md`
- 📦 **ملف جاهز**: `backend-aws-deploy.zip`

##### 2. Netlify + Railway:
- ✅ **Backend**: Railway
- ✅ **Frontend**: Netlify
- 📄 **التكوين**: `netlify.toml`, `railway.json`, `Procfile`

### Environment Variables:

#### Frontend:
- `VITE_API_BASE_URL`: Backend API URL
- `VITE_GEMINI_DESIGN_API_KEY`: Gemini Design API Key
- `VITE_GEMINI_DESIGN_MCP_URL`: MCP Server URL

#### Backend:
- `GEMINI_API_KEY`: Google Gemini API Key
- `GEMINI_MODEL`: gemini-1.5-pro
- `CORS_ORIGINS`: Allowed origins
- `DATABASE_URL`: sqlite:///app.db

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

### 📁 الملفات المهمة:

- `QUICK_START_AWS.md` - دليل نشر سريع على AWS
- `AWS_DEPLOYMENT.md` - دليل تفصيلي للنشر على AWS
- `backend-aws-deploy.zip` - ملف جاهز للرفع على Elastic Beanstalk
- `netlify.toml` - تكوين Netlify
- `backend/railway.json` - تكوين Railway
- `frontend/amplify.yml` - تكوين AWS Amplify

---
Made with ❤️ using Gemini AI
