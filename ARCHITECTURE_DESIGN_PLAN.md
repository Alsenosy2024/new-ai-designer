# خطة التصميم المعماري الشاملة للوكلاء الذكية
# Comprehensive AI Design Agents Architecture Plan

## المشكلة الحالية / Current Problem

النظام الحالي يستخدم وظائف إجرائية بسيطة تُحاكي عمل الوكلاء بدلاً من وكلاء حقيقيين مستقلين. لا يوجد:
- تواصل حقيقي بين الوكلاء
- تصميم معماري حقيقي (فقط صناديق بسيطة)
- تحليل هيكلي حقيقي
- تصميم MEP تفصيلي
- حلقات تكرار وتحسين

---

## الحل المقترح / Proposed Solution

### 1. إطار عمل الوكلاء الجديد (New Agent Framework)

```
backend/app/agents/
├── __init__.py
├── base_agent.py          # الوكيل الأساسي
├── architectural_agent.py  # وكيل التصميم المعماري
├── structural_agent.py     # وكيل الهيكل الإنشائي
├── mep_agent.py           # وكيل الأنظمة الميكانيكية
├── interior_agent.py      # وكيل التصميم الداخلي
├── landscape_agent.py     # وكيل التنسيق الخارجي
├── sustainability_agent.py # وكيل الاستدامة
├── coordination.py        # منسق الوكلاء
└── conflict_resolver.py   # حل التعارضات
```

### 2. قدرات كل وكيل / Agent Capabilities

#### A. وكيل التصميم المعماري (Architectural Agent)
- **توليد المساقط الأرضية** باستخدام خوارزميات procedural generation
- **تحديد الفراغات والعلاقات** بينها
- **تطبيق معايير الكود** المحلية
- **توليد واجهات** ذكية

#### B. وكيل الهيكل الإنشائي (Structural Agent)
- **تصميم الشبكة الإنشائية** المثلى
- **حساب الأحمال** والقوى
- **تحليل الانحراف** والاهتزازات
- **اختيار النظام الإنشائي** المناسب

#### C. وكيل MEP
- **توزيع المناطق الحرارية**
- **مسارات التكييف والتهوية**
- **شبكات الكهرباء والإضاءة**
- **أنظمة السباكة والصرف**

#### D. وكيل التصميم الداخلي
- **تخطيط الأثاث**
- **اختيار المواد والتشطيبات**
- **تصميم الإضاءة الداخلية**

---

## 3. المكتبات المطلوبة / Required Libraries

### مكتبات التوليد الهندسي:
```python
# Geometry & CAD
shapely>=2.0.0           # 2D geometry operations
networkx>=3.0            # Graph-based space planning
scipy>=1.11.0            # Optimization algorithms
cadquery>=2.4.0          # Parametric CAD modeling
svgwrite>=1.4.3          # SVG generation

# BIM & IFC
ifcopenshell>=0.7.0      # IFC generation (existing)
compas>=2.0.0            # Computational architecture
compas_ifc>=0.5.0        # IFC via COMPAS

# 3D Modeling
trimesh>=4.4.1           # 3D mesh (existing)
pymesh2>=0.3             # Mesh operations
pyvista>=0.42.0          # 3D visualization

# AI/ML
openai>=1.0.0            # GPT-4 for complex reasoning
anthropic>=0.18.0        # Claude for design decisions
langchain>=0.1.0         # Agent orchestration
```

### مكتبات التحليل:
```python
# Structural Analysis
openseespy>=3.5.0        # Structural analysis (existing)
anastruct>=1.5.0         # Quick structural analysis
sectionproperties>=3.0   # Section properties

# Energy & Sustainability
ladybug-core>=0.42.0     # Environmental analysis
honeybee-energy>=1.106   # Energy modeling
eppy>=0.5.63             # EnergyPlus (existing)

# Optimization
pymoo>=0.6.0             # Multi-objective optimization
optuna>=3.5.0            # Hyperparameter optimization
```

---

## 4. هيكل الوكيل الأساسي / Base Agent Structure

```python
class BaseDesignAgent:
    """الوكيل الأساسي لجميع وكلاء التصميم"""

    def __init__(self, name: str, llm_client, project_context: dict):
        self.name = name
        self.llm = llm_client
        self.context = project_context
        self.decisions = []
        self.outputs = {}
        self.conflicts = []

    async def analyze(self, inputs: dict) -> dict:
        """تحليل المدخلات وفهم المتطلبات"""
        raise NotImplementedError

    async def design(self, constraints: dict) -> dict:
        """توليد التصميم بناءً على القيود"""
        raise NotImplementedError

    async def validate(self, design: dict) -> ValidationResult:
        """التحقق من صحة التصميم"""
        raise NotImplementedError

    async def optimize(self, design: dict, objectives: list) -> dict:
        """تحسين التصميم"""
        raise NotImplementedError

    async def resolve_conflict(self, conflict: Conflict) -> Resolution:
        """حل التعارض مع وكلاء آخرين"""
        raise NotImplementedError

    def log_decision(self, decision: str, reasoning: str):
        """تسجيل القرارات مع التبرير"""
        self.decisions.append({
            "timestamp": datetime.utcnow(),
            "decision": decision,
            "reasoning": reasoning,
            "agent": self.name
        })
```

---

## 5. خوارزمية التنسيق / Coordination Algorithm

```
┌─────────────────────────────────────────────────────────────┐
│                    COORDINATOR                               │
│                                                              │
│  1. Initialize all agents with project context               │
│  2. Run Architectural Agent first (base design)              │
│  3. Parallel: Structural + MEP analyze architecture          │
│  4. Collect conflicts from all agents                        │
│  5. If conflicts exist:                                      │
│     - Run Conflict Resolver                                  │
│     - Update designs                                         │
│     - Go to step 3 (max 5 iterations)                        │
│  6. Run Interior + Landscape agents                          │
│  7. Final integration and validation                         │
│  8. Generate outputs (IFC, drawings, reports)                │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. نظام حل التعارضات / Conflict Resolution System

### أنواع التعارضات:
1. **تعارض مكاني**: عمود في مسار HVAC
2. **تعارض هيكلي**: فتحة كبيرة تضعف الكمرة
3. **تعارض وظيفي**: غرفة بدون تهوية كافية
4. **تعارض اقتصادي**: تجاوز الميزانية

### آلية الحل:
```python
class ConflictResolver:
    """حل التعارضات بين الوكلاء"""

    PRIORITY = {
        "safety": 100,      # السلامة أولاً
        "code": 90,         # متطلبات الكود
        "function": 70,     # الوظيفة
        "cost": 50,         # التكلفة
        "aesthetic": 30     # الجمالية
    }

    async def resolve(self, conflicts: List[Conflict]) -> List[Resolution]:
        # ترتيب حسب الأولوية
        sorted_conflicts = sorted(conflicts,
                                  key=lambda c: self.PRIORITY[c.type],
                                  reverse=True)

        resolutions = []
        for conflict in sorted_conflicts:
            # استخدام LLM للتفاوض
            resolution = await self._negotiate(conflict)
            resolutions.append(resolution)

        return resolutions
```

---

## 7. توليد التصميم المعماري الحقيقي / Real Architectural Generation

### A. توليد المساقط (Floor Plan Generation)

```python
class FloorPlanGenerator:
    """توليد مساقط أرضية حقيقية"""

    def __init__(self, building_program: dict, constraints: dict):
        self.program = building_program  # الفراغات المطلوبة
        self.constraints = constraints    # الشكل، الاتجاه، الكود

    def generate(self) -> FloorPlan:
        # 1. إنشاء الشبكة الأساسية
        grid = self._create_grid()

        # 2. وضع النواة (Core)
        core = self._place_core(grid)

        # 3. توزيع الفراغات باستخدام Graph
        spaces = self._distribute_spaces(grid, core)

        # 4. إنشاء الممرات
        circulation = self._create_circulation(spaces)

        # 5. التحقق من الكود
        self._validate_code_compliance(spaces)

        return FloorPlan(grid, core, spaces, circulation)
```

### B. توليد الواجهات (Facade Generation)

```python
class FacadeGenerator:
    """توليد واجهات معمارية"""

    def generate(self, building_form: dict, climate: str) -> Facade:
        # تحليل الاتجاه والمناخ
        orientation_analysis = self._analyze_orientation()

        # اختيار نمط الواجهة
        pattern = self._select_pattern(climate, orientation_analysis)

        # توزيع الفتحات
        openings = self._distribute_openings(pattern)

        # إضافة التظليل
        shading = self._add_shading_devices(climate)

        return Facade(pattern, openings, shading)
```

---

## 8. التحليل الإنشائي الحقيقي / Real Structural Analysis

```python
class StructuralDesigner:
    """تصميم إنشائي حقيقي"""

    def design_frame(self, building: Building) -> StructuralSystem:
        # 1. تحديد النظام الإنشائي
        system = self._select_system(building.height, building.span)

        # 2. تصميم الشبكة الإنشائية
        grid = self._design_grid(building.plan, system)

        # 3. تحليل الأحمال
        loads = self._calculate_loads(building)

        # 4. تصميم العناصر
        columns = self._design_columns(loads, grid)
        beams = self._design_beams(loads, grid)
        slabs = self._design_slabs(loads)

        # 5. تحليل الانحراف
        drift = self._analyze_drift(columns, beams, loads)

        # 6. التحقق من الكود
        self._verify_code(columns, beams, slabs, drift)

        return StructuralSystem(grid, columns, beams, slabs, drift)
```

---

## 9. تصميم MEP الحقيقي / Real MEP Design

```python
class MEPDesigner:
    """تصميم أنظمة MEP حقيقي"""

    def design_hvac(self, building: Building, zones: List[Zone]) -> HVACSystem:
        # 1. حساب الأحمال الحرارية
        cooling_loads = self._calculate_cooling_loads(zones)

        # 2. تحديد نظام التكييف
        system_type = self._select_hvac_system(building, cooling_loads)

        # 3. تصميم مجاري الهواء
        ductwork = self._design_ductwork(zones, system_type)

        # 4. موقع المعدات
        equipment = self._locate_equipment(building)

        # 5. التحقق من المسارات
        self._verify_clearances(ductwork, equipment)

        return HVACSystem(system_type, ductwork, equipment, cooling_loads)
```

---

## 10. تسلسل التنفيذ / Implementation Sequence

### المرحلة 1: البنية التحتية (Week 1)
- [x] إنشاء هيكل مجلد الوكلاء
- [ ] تنفيذ BaseDesignAgent
- [ ] تنفيذ Coordinator
- [ ] تنفيذ ConflictResolver
- [ ] تحديث requirements.txt

### المرحلة 2: الوكيل المعماري (Week 2)
- [ ] FloorPlanGenerator
- [ ] SpaceDistributor
- [ ] FacadeGenerator
- [ ] CodeValidator

### المرحلة 3: الوكيل الإنشائي (Week 3)
- [ ] GridDesigner
- [ ] LoadCalculator
- [ ] MemberDesigner
- [ ] DriftAnalyzer

### المرحلة 4: وكيل MEP (Week 4)
- [ ] LoadCalculator (HVAC)
- [ ] DuctworkDesigner
- [ ] PipingDesigner
- [ ] ClashDetector

### المرحلة 5: التكامل (Week 5)
- [ ] دمج جميع الوكلاء
- [ ] اختبار التعارضات
- [ ] تحسين الأداء
- [ ] توثيق API

---

## 11. مخرجات النظام الجديد / New System Outputs

### الملفات المولدة:
1. **IFC كامل** مع جميع العناصر المعمارية والإنشائية
2. **مساقط DWG/PDF** تفصيلية
3. **مقاطع ومناظير**
4. **جداول كميات** تفصيلية
5. **تقارير تحليل** (إنشائي، طاقة، استدامة)
6. **نموذج 3D** تفاعلي

### المقاييس:
- نسبة الكفاءة المساحية
- تقدير التكلفة
- استهلاك الطاقة المتوقع
- درجة الامتثال للكود
- درجة الاستدامة

---

## 12. مثال على سير العمل / Workflow Example

```
المستخدم يدخل: مبنى مكتبي 10,000م² في الرياض

↓

1. [Architectural Agent]
   - يحلل البرنامج المعماري
   - يولد 3 خيارات للمسقط
   - يختار الأفضل بناءً على الكفاءة
   Output: مسقط أرضي + شكل المبنى

↓

2. [Structural Agent] (متوازي مع MEP)
   - يحلل الشكل المعماري
   - يصمم الشبكة الإنشائية
   - يحدد أبعاد العناصر
   Output: نظام إنشائي + تفاصيل

↓

3. [MEP Agent] (متوازي مع Structural)
   - يحسب الأحمال الحرارية
   - يصمم مسارات التكييف
   - يحدد غرف المعدات
   Output: مخطط MEP

↓

4. [Conflict Resolver]
   - يكتشف: عمود يتعارض مع مجرى هواء رئيسي
   - يتفاوض: نقل العمود 50سم أم تحويل المجرى؟
   - يقرر: تحويل المجرى (أقل تكلفة)

↓

5. [Interior Agent]
   - يوزع الأثاث
   - يحدد التشطيبات
   Output: تصميم داخلي

↓

6. [Output Generator]
   - IFC كامل
   - PDF مساقط ومقاطع
   - Excel جداول كميات
   - تقرير شامل
```

---

## خلاصة / Summary

هذه الخطة تحول النظام من:
- **محاكاة بسيطة** → **وكلاء ذكية حقيقية**
- **توليد صناديق** → **تصميم معماري حقيقي**
- **تحليل تقريبي** → **تحليل هندسي دقيق**
- **خط أنابيب خطي** → **تكرار وتحسين**

النتيجة: نظام تصميم AI قادر على إنتاج تصاميم معمارية حقيقية وقابلة للتنفيذ.
