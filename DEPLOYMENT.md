# دليل النشر على Vercel

## الخطوة 1: تسجيل الدخول لـ Vercel

```bash
vercel login
```

## الخطوة 2: نشر Frontend

```bash
cd frontend
vercel --prod
```

عند السؤال:
- Project name: `ai-designer-frontend`
- Directory: `.` (current)
- Build command: `npm run build`
- Output directory: `dist`

### Environment Variables للـ Frontend:
أضف في Vercel Dashboard:
```
VITE_API_BASE_URL=https://ai-designer-backend.vercel.app
VITE_GEMINI_DESIGN_API_KEY=gd_H-xso1nO5IgOfVvTDknD_XCmQfxmsJXi
VITE_GEMINI_DESIGN_MCP_URL=https://gemini-design-mcp-server-production.up.railway.app/mcp
```

## الخطوة 3: نشر Backend

```bash
cd ../backend
vercel --prod
```

عند السؤال:
- Project name: `ai-designer-backend`
- Directory: `.` (current)

### Environment Variables للـ Backend:
أضف في Vercel Dashboard:
```
GEMINI_API_KEY=AIzaSyDXIWzufJ7c5FAgX6qbqh9qxHMdEdMDwz0
GEMINI_MODEL=gemini-1.5-pro
CORS_ORIGINS=*
```

## الخطوة 4: تحديث Frontend URL

بعد نشر الـ Backend، احصل على الـ URL وحدّث الـ Frontend:

1. اذهب إلى Vercel Dashboard → ai-designer-frontend → Settings → Environment Variables
2. حدّث `VITE_API_BASE_URL` بالـ URL الجديد للـ Backend
3. أعد النشر: `vercel --prod`

## الخطوة 5: الاختبار

افتح رابط Frontend المنشور واختبر:
- إنشاء مشروع جديد
- توليد التصميم
- عرض النتائج

## البدائل (إذا واجهت مشاكل):

### نشر Frontend فقط (استخدام Backend محلي):
```bash
cd frontend
vercel --prod
```
وأبقِ الـ Backend يعمل محلياً

### نشر Backend على Railway بدلاً من Vercel:
Railway أفضل لـ Python backends مع dependencies كبيرة

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
cd backend
railway init
railway up
```

## ملاحظات مهمة:

1. **حجم Lambda**: Backend قد يتجاوز حد Vercel (50MB). في هذه الحالة استخدم Railway
2. **Database**: SQLite لا تعمل على Vercel. استخدم PostgreSQL أو Supabase
3. **File Storage**: استخدم Vercel Blob أو AWS S3 بدلاً من local storage
4. **API Rate Limits**: راقب استخدام Gemini API

## الروابط النهائية:

بعد النشر ستحصل على:
- Frontend: https://ai-designer-frontend.vercel.app
- Backend: https://ai-designer-backend.vercel.app

---

## نشر سريع (One-Click):

يمكنك استخدام GitHub integration:

1. ارفع الكود على GitHub
2. اذهب إلى vercel.com
3. Import Project من GitHub
4. Vercel سيكتشف التكوين تلقائياً
5. أضف Environment Variables
6. Deploy!

