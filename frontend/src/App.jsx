import React, { useState } from 'react';
import './App.css';
import geminiDesignMCP from './services/geminiDesignMCP';

function App() {
  const [projectData, setProjectData] = useState({
    name: 'مبنى مكاتب تجريبي',
    building_type: 'office',
    region: 'saudi',
    gfa: 5000,
    floors: 5
  });
  const [loading, setLoading] = useState(false);
  const [design, setDesign] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const floorPlan = await geminiDesignMCP.generateFloorPlan(projectData);
      setDesign(floorPlan);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1 className="gradient-text">🏗️ AI Designer</h1>
        <p>مصمم معماري ذكي بتقنية Gemini</p>
      </header>

      <div className="container">
        <div className="sidebar">
          <div className="card">
            <h2>معلومات المشروع</h2>
            <div className="form-group">
              <label>اسم المشروع</label>
              <input
                type="text"
                value={projectData.name}
                onChange={(e) => setProjectData({...projectData, name: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>نوع المبنى</label>
              <select
                value={projectData.building_type}
                onChange={(e) => setProjectData({...projectData, building_type: e.target.value})}
              >
                <option value="office">مكاتب</option>
                <option value="residential">سكني</option>
                <option value="mixed_use">متعدد الاستخدامات</option>
              </select>
            </div>
            <div className="form-group">
              <label>المساحة (م²)</label>
              <input
                type="number"
                value={projectData.gfa}
                onChange={(e) => setProjectData({...projectData, gfa: Number(e.target.value)})}
              />
            </div>
            <div className="form-group">
              <label>عدد الطوابق</label>
              <input
                type="number"
                value={projectData.floors}
                onChange={(e) => setProjectData({...projectData, floors: Number(e.target.value)})}
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? '⏳ جاري التوليد...' : '✨ توليد التصميم'}
            </button>
          </div>
        </div>

        <div className="main-content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>جاري توليد التصميم باستخدام Gemini AI...</p>
            </div>
          ) : design ? (
            <div className="design-result glass">
              <h2>✅ تم توليد التصميم بنجاح</h2>
              <pre>{JSON.stringify(design, null, 2)}</pre>
            </div>
          ) : (
            <div className="empty-state">
              <h2>ابدأ بإنشاء تصميمك المعماري</h2>
              <p>استخدم النموذج على اليمين لإدخال معلومات المشروع</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
