# 🚀 دليل النشر السريع على AWS

## ✅ ما تم إنجازه:

1. ✅ إنشاء ملفات تكوين AWS Elastic Beanstalk
2. ✅ إنشاء ملف amplify.yml لـ AWS Amplify
3. ✅ إنشاء ملف ZIP جاهز للرفع (`backend-aws-deploy.zip`)
4. ✅ دفع جميع التغييرات إلى GitHub
5. ✅ إضافة health check endpoint في Backend

---

## 📋 الخطوات التالية (يدوية):

### 1️⃣ نشر Backend على AWS Elastic Beanstalk (10 دقائق)

1. **افتح AWS Console**: https://console.aws.amazon.com
2. **ابحث عن "Elastic Beanstalk"**
3. **اضغط "Create Application"**
4. **املأ البيانات:**
   - Application name: `ai-designer-backend`
   - Platform: `Python 3.11`
   - Application code: `Upload your code`
   - ارفع الملف: `backend-aws-deploy.zip` (موجود في root المشروع)

5. **أضف Environment Variables** (Configuration > Software > Edit):
   ```
   GEMINI_API_KEY=<your-api-key>
   GEMINI_MODEL=gemini-1.5-pro
   CORS_ORIGINS=*
   DATABASE_URL=sqlite:///app.db
   ```

6. **انتظر Deployment** (3-5 دقائق)
7. **احفظ URL** مثل: `http://ai-designer-backend.us-east-1.elasticbeanstalk.com`

### اختبار Backend:
```bash
curl http://ai-designer-backend.us-east-1.elasticbeanstalk.com/health
```

يجب أن يعيد: `{"status":"healthy","service":"AI Designer API"}`

---

### 2️⃣ نشر Frontend على AWS Amplify (10 دقائق)

1. **افتح AWS Console**: https://console.aws.amazon.com
2. **ابحث عن "AWS Amplify"**
3. **اضغط "Get Started" في Amplify Hosting**
4. **اختر GitHub** واربط repository:
   - Repository: `Alsenosy2024/new-ai-designer`
   - Branch: `main`

5. **تكوين Build:**
   - Root directory: `frontend`
   - Build command: سيتم اكتشافه من `amplify.yml`

6. **أضف Environment Variables**:
   ```
   VITE_GEMINI_DESIGN_API_KEY=gd_H-xso1nO5IgOfVvTDknD_XCmQfxmsJXi
   VITE_GEMINI_DESIGN_MCP_URL=https://gemini-design-mcp-server-production.up.railway.app/mcp
   VITE_API_BASE_URL=<Backend URL من الخطوة السابقة>
   ```

7. **اضغط "Save and deploy"**
8. **انتظر Build** (3-5 دقائق)
9. **احصل على URL** مثل: `https://main.d1a2b3c4d5e6f7.amplifyapp.com`

---

### 3️⃣ تحديث CORS

ارجع إلى Elastic Beanstalk وحدّث `CORS_ORIGINS`:
```
CORS_ORIGINS=https://main.d1a2b3c4d5e6f7.amplifyapp.com,http://localhost:3000
```

---

## 🎯 الاختبار النهائي

1. افتح Frontend URL في المتصفح
2. أدخل بيانات مشروع:
   - الاسم: "مبنى تجريبي"
   - النوع: "مكاتب"
   - المساحة: 5000 م²
   - الطوابق: 5
3. اضغط "توليد التصميم"
4. تحقق من النتائج

---

## 💰 التكلفة

- ✅ **AWS Free Tier مجاني لمدة 12 شهر**
- بعد Free Tier: ~$15-25/شهر

---

## 📚 للمزيد من التفاصيل

اقرأ ملف `AWS_DEPLOYMENT.md` للحصول على شرح تفصيلي كامل.

---

## 🆘 مساعدة

إذا واجهت مشكلة:
1. تحقق من Logs في AWS Console
2. راجع Troubleshooting في `AWS_DEPLOYMENT.md`
3. تأكد من Environment Variables

---

🎉 **الموقع جاهز للنشر على AWS!**
