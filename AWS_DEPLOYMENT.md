# دليل النشر على AWS

## المتطلبات

1. حساب AWS مع Free Tier مفعّل
2. AWS CLI مثبت (اختياري للنشر من Terminal)
3. حساب GitHub متصل

---

## الجزء الأول: نشر Backend على AWS Elastic Beanstalk

### الخطوة 1: إنشاء Elastic Beanstalk Application

1. **افتح AWS Console**: https://console.aws.amazon.com
2. **ابحث عن "Elastic Beanstalk"** في شريط البحث
3. **اضغط على "Create Application"**

### الخطوة 2: تكوين التطبيق

**Application Information:**
- Application name: `ai-designer-backend`
- Platform: `Python`
- Platform branch: `Python 3.11`
- Platform version: (اختر الأحدث)

**Application code:**
- اختر `Upload your code`
- Source code origin: `Local file`
- اضغط `Choose file` وارفع ملف zip للمجلد `backend/`

### الخطوة 3: تحضير ملف ZIP

قبل الرفع، أنشئ ملف zip من مجلد backend:

```bash
cd backend
zip -r ../backend-deploy.zip . -x "*.pyc" -x "__pycache__/*" -x "*.db"
```

### الخطوة 4: إضافة Environment Variables

بعد إنشاء التطبيق:
1. اذهب إلى **Configuration** > **Software**
2. اضغط **Edit**
3. أضف المتغيرات التالية في قسم **Environment properties**:

```
GEMINI_API_KEY=<your-gemini-api-key>
GEMINI_MODEL=gemini-1.5-pro
CORS_ORIGINS=*
DATABASE_URL=sqlite:///app.db
STORAGE_DIR=/var/app/current/storage
```

4. احفظ التغييرات

### الخطوة 5: احصل على URL

بعد انتهاء Deployment:
- ستجد URL مثل: `http://ai-designer-backend.us-east-1.elasticbeanstalk.com`
- احفظ هذا الـ URL للاستخدام في Frontend

---

## الجزء الثاني: نشر Frontend على AWS Amplify

### الخطوة 1: فتح AWS Amplify

1. **افتح AWS Console**: https://console.aws.amazon.com
2. **ابحث عن "AWS Amplify"** في شريط البحث
3. **اضغط على "Get Started"** في قسم Amplify Hosting

### الخطوة 2: ربط GitHub Repository

1. اختر **GitHub** كمصدر
2. **أذن لـ AWS Amplify** بالوصول إلى GitHub account
3. **اختر Repository**: `Alsenosy2024/new-ai-designer`
4. **اختر Branch**: `main`

### الخطوة 3: تكوين Build Settings

**App name:** `ai-designer-frontend`

**Build settings:**
- Root directory: `frontend`
- Build command: سيتم اكتشافه تلقائياً من `amplify.yml`

تأكد من أن Amplify اكتشف ملف `amplify.yml`:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
```

### الخطوة 4: إضافة Environment Variables

**مهم جداً!** قبل الضغط على Deploy، أضف المتغيرات التالية:

```
VITE_GEMINI_DESIGN_API_KEY=gd_H-xso1nO5IgOfVvTDknD_XCmQfxmsJXi
VITE_GEMINI_DESIGN_MCP_URL=https://gemini-design-mcp-server-production.up.railway.app/mcp
VITE_API_BASE_URL=<Elastic Beanstalk URL من الخطوة السابقة>
```

### الخطوة 5: Deploy

1. اضغط **Save and deploy**
2. انتظر اكتمال Build (3-5 دقائق)
3. ستحصل على URL مثل: `https://main.d1a2b3c4d5e6f7.amplifyapp.com`

---

## الجزء الثالث: تحديث CORS في Backend

بعد نشر Frontend، حدّث Environment Variables في Elastic Beanstalk:

1. ارجع إلى Elastic Beanstalk Console
2. Configuration > Software > Edit
3. عدّل `CORS_ORIGINS`:
   ```
   CORS_ORIGINS=https://main.d1a2b3c4d5e6f7.amplifyapp.com,http://localhost:3000
   ```
4. احفظ وانتظر إعادة التشغيل

---

## الاختبار النهائي

### 1. اختبار Backend:
```bash
curl https://ai-designer-backend.us-east-1.elasticbeanstalk.com/health
```

يجب أن يعيد:
```json
{"status":"healthy","service":"AI Designer API"}
```

### 2. اختبار Frontend:
1. افتح Frontend URL في المتصفح
2. أدخل بيانات مشروع جديد
3. اضغط "توليد التصميم"
4. تحقق من أن API requests تعمل

---

## التكاليف (AWS Free Tier)

### Elastic Beanstalk (Backend):
- ✅ **مجاني** لأول 12 شهر
- يشمل: 750 ساعة/شهر من EC2 t2.micro
- يشمل: 5 GB تخزين

### AWS Amplify (Frontend):
- ✅ **مجاني** لأول 12 شهر
- يشمل: 1000 build minutes/شهر
- يشمل: 15 GB تخزين
- يشمل: 5 GB data transfer

**ملاحظة:** بعد انتهاء Free Tier، التكلفة تقريباً $15-25/شهر.

---

## Troubleshooting

### إذا فشل Backend Deployment:
1. تحقق من Logs في Elastic Beanstalk Console
2. تأكد من أن `requirements.txt` يحتوي على جميع dependencies
3. تأكد من أن Procfile موجود وصحيح

### إذا فشل Frontend Build:
1. تحقق من Build logs في Amplify Console
2. تأكد من Environment Variables مضافة بشكل صحيح
3. تأكد من أن `package.json` يحتوي على `build` script

### إذا ظهر CORS Error:
1. تحقق من `CORS_ORIGINS` في Backend Environment Variables
2. تأكد من إضافة Frontend URL بشكل صحيح
3. أعد تشغيل Backend Environment

---

## الخلاصة

✅ **Backend**: AWS Elastic Beanstalk (Python)  
✅ **Frontend**: AWS Amplify (Vite/React)  
✅ **Database**: SQLite (مدمج)  
✅ **Storage**: Local filesystem  
✅ **التكلفة**: مجاني لمدة 12 شهر

🎉 **الموقع جاهز للاستخدام!**
