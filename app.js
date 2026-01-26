const animatedItems = document.querySelectorAll("[data-animate]");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

animatedItems.forEach((item) => observer.observe(item));

const STATE_KEY = "aiDesignerState";
const apiBaseMeta = document.querySelector('meta[name="ai-designer-api-base"]');
const apiBaseOverride =
  window.aiDesignerApiBase ||
  (apiBaseMeta ? apiBaseMeta.getAttribute("content") : "");
const API_BASES = [apiBaseOverride, "", "http://localhost:8001"].filter(Boolean);
let activeApiBase = apiBaseOverride || "";

if (apiBaseOverride) {
  window.aiDesignerApiBase = apiBaseOverride;
}

function setActiveApiBase(base) {
  activeApiBase = base;
  window.aiDesignerApiBase = base;
}

const defaultState = {
  project: {
    id: "",
    name: "Riyadh Office Tower",
    region: "Saudi Arabia",
    type: "Office",
    phase: "Schematic",
    gfa: "28,500",
    floors: "32",
    status: "Running",
    nextRun: "Structural grid refinement",
    brief: "",
    coreRatio: "24",
    parking: "420",
    budget: "$40M",
    delivery: "Q4 2026",
    codeLibrary: "Saudi SBC 2018",
    energyTarget: "EUI 75",
    daylight: "3.0%",
    structuralSystem: "RC Frame",
    mepStrategy: "Central plant + VAV",
    siteModel: "",
  },
  run: {
    id: "",
    status: "In progress",
    conflicts: "1 conflict",
    updatedAt: "Updated 2 min ago",
  },
  outputs: {
    id: "",
    clashDensity: "3.4%",
    structuralVariance: "0.8%",
    compliance: "92%",
    energy: "EUI 76",
    clashFree: 96,
    energyScore: 87,
    structuralScore: 90,
    ifcFile: "RiyadhTower_v09.ifc",
    mepScheduleFile: "MEP_Coordination_Schedule.xlsx",
    energyReportFile: "Energy_Report.pdf",
    reviewPackageFile: "Design_Review_Package.zip",
    planSvgFile: "Plan_View.svg",
    gltfFile: "Massing_Model.gltf",
    generatedAt: "Generated 11 minutes ago",
  },
};

const LANG_KEY = "aiDesignerLang";
const SUPPORTED_LANGS = ["en", "ar"];
const translations = {
  en: {
    "nav.overview": "Overview",
    "nav.platform": "Platform",
    "nav.console": "Console",
    "nav.agents": "Agents",
    "nav.workflow": "Workflow",
    "nav.market": "Market",
    "nav.proposal": "Full Proposal",
    "action.request_demo": "Request Demo",
    "action.launch_run": "Launch Run",
    "action.launch_prototype": "Launch Prototype",
    "action.view_outputs": "View Outputs",
    "action.full_proposal": "Full Proposal",
    "action.share_client": "Share to Client",
    "sidebar.console": "Console",
    "sidebar.dashboard": "Dashboard",
    "sidebar.project_intake": "Project Intake",
    "sidebar.orchestrator": "Orchestrator",
    "sidebar.outputs": "Outputs",
    "sidebar.proposal": "Proposal",
    "sidebar.marketing_site": "Marketing Site",
    "sidebar.active_project": "Active Project",
    "sidebar.view_outputs": "View Outputs",
    "sidebar.starter_templates": "Starter Templates",
    "sidebar.load_template": "Load Template",
    "sidebar.live_run": "Live Run",
    "sidebar.deliverable_pack": "Deliverable Pack",
    "sidebar.rerun": "Re-run",
    "dashboard.eyebrow": "AI Designer Console",
    "dashboard.title": "Dashboard",
    "dashboard.lead":
      "Monitor live agent performance, project health, and queued orchestration runs across GCC projects.",
    "dashboard.new_project": "New Project",
    "dashboard.open_orchestrator": "Open Orchestrator",
    "dashboard.active_projects": "Active Projects",
    "dashboard.table.project": "Project",
    "dashboard.table.region": "Region",
    "dashboard.table.status": "Status",
    "dashboard.table.next_run": "Next Run",
    "dashboard.agent_health": "Agent Health",
    "dashboard.run_queue": "Run Queue",
    "dashboard.decision_board": "Decision Board",
    "dashboard.library_coverage": "Knowledge Library Coverage",
    "dashboard.update_libraries": "Update Libraries",
    "badge.architectural": "Architectural",
    "badge.structural": "Structural",
    "badge.mep": "MEP",
    "agent.architectural": "Architectural Agent",
    "agent.structural": "Structural Agent",
    "agent.mep": "MEP Agent",
    "agent.simulation": "Simulation Agent",
    "status.in_progress": "In progress",
    "status.queued": "Queued",
    "status.review": "Review",
    "status.needs_review": "Needs review",
    "dashboard.decision_1":
      "Recommend shifting cores 1.8m east to reduce HVAC trunk.",
    "dashboard.decision_2": "Introduce secondary beam at Level 6 to reduce span.",
    "dashboard.decision_3": "Optimize glazing ratio for daylight compliance.",
    "dashboard.decision_4": "Schedule client review for revised massing.",
    "intake.eyebrow": "Project Intake",
    "intake.title": "New Project Setup",
    "intake.lead":
      "Capture site inputs, program requirements, and GCC code libraries before launching AI-driven design generation.",
    "intake.save_draft": "Save Draft",
    "intake.launch_generation": "Launch Generation",
    "intake.site_context": "Site and Context",
    "intake.project_name": "Project Name",
    "intake.region": "Region",
    "intake.building_type": "Building Type",
    "intake.design_phase": "Design Phase",
    "intake.target_gfa": "Target GFA (m2)",
    "intake.floors": "Number of Floors",
    "intake.site_model": "Site Model",
    "intake.site_drop": "Drop IFC, DWG, or GeoJSON here",
    "intake.project_brief": "Design Brief",
    "intake.program_requirements": "Program and Requirements",
    "intake.core_ratio": "Core Ratio (%)",
    "intake.parking": "Parking Count",
    "intake.budget": "Target Budget (USD)",
    "intake.delivery": "Delivery Timeline",
    "intake.code_performance": "Code Libraries and Performance",
    "intake.primary_code": "Primary Code Library",
    "intake.energy_target": "Energy Target (EUI)",
    "intake.daylight": "Daylight Factor",
    "intake.structural_system": "Structural System",
    "intake.mep_strategy": "MEP Strategy",
    "intake.validation_checklist": "Validation Checklist",
    "intake.simulate_now": "Simulate Now",
    "intake.check_1": "Verify egress routes for GCC fire regulations.",
    "intake.check_2": "Confirm structural spans within preferred limits.",
    "intake.check_3": "Ensure MEP riser zoning and service clearances.",
    "intake.check_4": "Run preliminary energy and daylight analysis.",
    "intake.placeholder.project_name": "Riyadh Office Tower",
    "intake.placeholder.gfa": "28,500",
    "intake.placeholder.floors": "32",
    "intake.placeholder.brief":
      "Describe key programmatic needs, adjacency priorities, and special constraints.",
    "intake.placeholder.core_ratio": "24",
    "intake.placeholder.parking": "420",
    "intake.placeholder.budget": "$40M",
    "intake.placeholder.delivery": "Q4 2026",
    "intake.placeholder.energy_target": "EUI 75",
    "intake.placeholder.daylight": "3.0%",
    "intake.option.saudi": "Saudi Arabia",
    "intake.option.uae": "UAE",
    "intake.option.qatar": "Qatar",
    "intake.option.bahrain": "Bahrain",
    "intake.option.oman": "Oman",
    "intake.option.residential": "Residential",
    "intake.option.commercial": "Commercial",
    "intake.option.office": "Office",
    "intake.option.retail": "Retail",
    "intake.option.hospitality": "Hospitality",
    "intake.option.healthcare": "Healthcare",
    "intake.option.mixed": "Mixed-use",
    "intake.option.education": "Education",
    "intake.option.phase_schematic": "Schematic",
    "intake.option.phase_dd": "Design Development",
    "intake.option.phase_cd": "Construction Documents",
    "intake.option.code_saudi": "Saudi SBC 2018",
    "intake.option.code_uae": "UAE Fire and Life Safety",
    "intake.option.code_qatar": "Qatar Construction Specifications",
    "intake.option.structural_rc": "RC Frame",
    "intake.option.structural_steel": "Composite Steel",
    "intake.option.structural_pt": "Post-tensioned Slab",
    "intake.option.mep_central": "Central plant + VAV",
    "intake.option.mep_district": "District cooling",
    "intake.option.mep_hybrid": "Hybrid chilled beam",
    "orchestrator.eyebrow": "Orchestrator",
    "orchestrator.title": "Multi-Agent Run",
    "orchestrator.lead":
      "Coordinate architecture, structure, MEP, and simulation with real-time conflict resolution and rule validation.",
    "orchestrator.edit_inputs": "Edit Inputs",
    "orchestrator.publish_outputs": "Publish Outputs",
    "orchestrator.run_timeline": "Run Timeline",
    "orchestrator.decision_feed": "Decision Feed",
    "orchestrator.live_metrics": "Live Metrics",
    "orchestrator.run_button": "Run Orchestrator",
    "orchestrator.awaiting": "Awaiting orchestration start.",
    "orchestrator.step_1": "Input validation and normalization",
    "orchestrator.step_1_meta": "Codes, zoning, site geometry",
    "orchestrator.step_2": "Architectural generation",
    "orchestrator.step_2_meta": "Massing + adjacency",
    "orchestrator.step_3": "Structural framework synthesis",
    "orchestrator.step_3_meta": "Grid + sizing",
    "orchestrator.step_4": "MEP routing and coordination",
    "orchestrator.step_4_meta": "Clash detection",
    "orchestrator.step_5": "Simulation and compliance",
    "orchestrator.step_5_meta": "Energy + egress",
    "orchestrator.step_6": "BIM packaging and reporting",
    "orchestrator.step_6_meta": "IFC + schedules",
    "orchestrator.decision_1":
      "09:24 - Architectural agent adjusted core offsets for daylight.",
    "orchestrator.decision_2":
      "09:31 - Structural agent flagged 12m span, requested beam depth increase.",
    "orchestrator.decision_3":
      "09:36 - MEP agent rerouted chilled water riser around shear wall.",
    "orchestrator.decision_4":
      "09:44 - Simulation agent raised egress clearance warning on Level 4.",
    "orchestrator.open_conflicts": "Open Conflicts",
    "orchestrator.pending_responses": "2 pending responses",
    "orchestrator.iterations": "Iterations",
    "orchestrator.cycles_completed": "3 cycles completed",
    "orchestrator.next_checkpoint": "Next checkpoint",
    "orchestrator.next_checkpoint_meta": "Simulation rerun in 12 min",
    "outputs.eyebrow": "Outputs",
    "outputs.title": "BIM Deliverables",
    "outputs.lead":
      "Export IFC, drawings, schedules, and performance reports ready for stakeholder review.",
    "outputs.review_files": "Review Files",
    "outputs.review_files_empty": "No review files yet.",
    "outputs.review_run": "Review Run",
    "outputs.share_client": "Share to Client",
    "outputs.delivery_files": "Delivery Files",
    "outputs.plan_preview": "Plan + 3D Preview",
    "outputs.plan_workspace": "Plan Workspace",
    "outputs.plan_subtitle": "Edit and coordinate 2D layout",
    "outputs.plan_undo": "Undo",
    "outputs.plan_redo": "Redo",
    "outputs.plan_snap": "Snap",
    "outputs.plan_grid": "Grid",
    "outputs.plan_save": "Save",
    "outputs.plan_zoom_in": "Zoom in",
    "outputs.plan_zoom_out": "Zoom out",
    "outputs.plan_fit": "Fit",
    "outputs.plan_reset": "Reset",
    "outputs.plan_fullscreen": "Full screen",
    "outputs.plan_loading": "Loading plan...",
    "outputs.plan_hint": "Drag to pan • Scroll to zoom",
    "outputs.properties": "Properties",
    "outputs.layers": "Layers",
    "outputs.property_tool": "Tool",
    "outputs.property_layer": "Layer",
    "outputs.property_snaps": "Snap",
    "outputs.layer_arch": "Architectural",
    "outputs.layer_struct": "Structural",
    "outputs.layer_mep": "MEP",
    "outputs.layer_annotations": "Axes + Dimensions",
    "outputs.review_notes": "Architectural Review Notes",
    "outputs.review_badge": "Architectural",
    "outputs.review_empty": "No review notes yet.",
    "outputs.review_category": "Category",
    "outputs.review_category_default": "Select",
    "outputs.review_category_layout": "Layout",
    "outputs.review_category_core": "Core",
    "outputs.review_category_circulation": "Circulation",
    "outputs.review_category_facade": "Facade",
    "outputs.review_category_code": "Code compliance",
    "outputs.review_category_mep": "MEP coordination",
    "outputs.review_priority": "Priority",
    "outputs.review_priority_default": "Select",
    "outputs.review_priority_low": "Low",
    "outputs.review_priority_medium": "Medium",
    "outputs.review_priority_high": "High",
    "outputs.review_priority_urgent": "Urgent",
    "outputs.review_placeholder": "Add architectural feedback",
    "outputs.review_submit": "Submit Note",
    "outputs.review_approve": "Approve",
    "outputs.review_approve_generate": "Approve & Generate Disciplines",
    "outputs.review_pending": "Awaiting architectural approval. Approve to generate structural + MEP.",
    "outputs.model_health": "Model Health",
    "outputs.quantity_summary": "Quantity Summary",
    "outputs.stakeholder_pack": "Stakeholder Pack",
    "outputs.download": "Download",
    "outputs.publish_pack": "Publish Pack",
    "outputs.send_review": "Send for Review",
    "outputs.preview_plan": "Plan View",
    "outputs.preview_3d": "3D Massing",
    "outputs.clash_free": "Clash-free routing",
    "outputs.code_compliance": "Code compliance",
    "outputs.energy_performance": "Energy performance",
    "outputs.structural_utilization": "Structural utilization",
    "outputs.remaining_issues":
      "Remaining issues: 2 egress clarifications, 1 duct clearance.",
    "outputs.table.discipline": "Discipline",
    "outputs.table.quantity": "Key Quantity",
    "outputs.table.delta": "Delta",
    "outputs.pack_item_1": "Client-ready render set",
    "outputs.pack_item_2": "Code compliance summary",
    "outputs.pack_item_3": "Cost plan and schedule alignment",
    "outputs.pack_item_4": "Risk register and open conflicts",
    "outputs.meta.ifc": "BIM model | 420MB",
    "outputs.meta.mep": "Services + quantities",
    "outputs.meta.energy": "EUI + load analysis",
    "outputs.meta.package": "Drawings + visuals",
    "outputs.meta.plan": "Generated plan drawing",
    "outputs.meta.gltf": "3D massing model",
    "outputs.qty.structure": "Structure",
    "outputs.qty.mep": "MEP",
    "outputs.qty.facade": "Facade",
    "orchestrator.metric_compliance": "Code compliance",
    "orchestrator.metric_structural": "Structural variance",
    "orchestrator.metric_clash": "Clash density",
    "orchestrator.metric_energy": "Energy intensity",
    "log.run_init": "Initializing multi-agent orchestration...",
    "log.run_complete": "Run complete. BIM model ready for review and export.",
    "log.orchestrator_start": "Starting orchestrator run...",
    "log.orchestrator_complete": "Run complete. Deliverables ready for export.",
    "lang.toggle": "AR",
  },
  ar: {
    "nav.overview": "نظرة عامة",
    "nav.platform": "المنصة",
    "nav.console": "لوحة التحكم",
    "nav.agents": "الوكلاء",
    "nav.workflow": "سير العمل",
    "nav.market": "السوق",
    "nav.proposal": "المقترح الكامل",
    "action.request_demo": "طلب عرض",
    "action.launch_run": "تشغيل الآن",
    "action.launch_prototype": "تشغيل النموذج",
    "action.view_outputs": "عرض المخرجات",
    "action.full_proposal": "المقترح الكامل",
    "action.share_client": "مشاركة مع العميل",
    "sidebar.console": "لوحة التحكم",
    "sidebar.dashboard": "لوحة المتابعة",
    "sidebar.project_intake": "استقبال المشروع",
    "sidebar.orchestrator": "المنسق",
    "sidebar.outputs": "المخرجات",
    "sidebar.proposal": "المقترح",
    "sidebar.marketing_site": "الموقع التسويقي",
    "sidebar.active_project": "المشروع الحالي",
    "sidebar.view_outputs": "عرض المخرجات",
    "sidebar.starter_templates": "قوالب البداية",
    "sidebar.load_template": "تحميل القالب",
    "sidebar.live_run": "تشغيل مباشر",
    "sidebar.deliverable_pack": "حزمة التسليم",
    "sidebar.rerun": "إعادة التشغيل",
    "dashboard.eyebrow": "لوحة التحكم AI Designer",
    "dashboard.title": "لوحة المتابعة",
    "dashboard.lead":
      "راقب أداء الوكلاء المباشر، صحة المشروع، وتشغيلات التنسيق القادمة عبر مشاريع الخليج.",
    "dashboard.new_project": "مشروع جديد",
    "dashboard.open_orchestrator": "فتح المنسق",
    "dashboard.active_projects": "المشاريع النشطة",
    "dashboard.table.project": "المشروع",
    "dashboard.table.region": "المنطقة",
    "dashboard.table.status": "الحالة",
    "dashboard.table.next_run": "التشغيل التالي",
    "dashboard.agent_health": "حالة الوكلاء",
    "dashboard.run_queue": "قائمة التشغيل",
    "dashboard.decision_board": "لوحة القرارات",
    "dashboard.library_coverage": "تغطية مكتبة المعرفة",
    "dashboard.update_libraries": "تحديث المكتبات",
    "badge.architectural": "معماري",
    "badge.structural": "إنشائي",
    "badge.mep": "MEP",
    "agent.architectural": "وكيل العمارة",
    "agent.structural": "وكيل الإنشاء",
    "agent.mep": "وكيل MEP",
    "agent.simulation": "وكيل المحاكاة",
    "status.in_progress": "قيد التنفيذ",
    "status.queued": "في الانتظار",
    "status.review": "مراجعة",
    "status.needs_review": "يحتاج مراجعة",
    "dashboard.decision_1": "نوصي بتحريك القلب 1.8م شرقًا لتقليل مجرى التكييف.",
    "dashboard.decision_2": "إضافة كمرة ثانوية في الدور 6 لتقليل البحور.",
    "dashboard.decision_3": "تحسين نسبة الزجاج لتحقيق متطلبات الإضاءة الطبيعية.",
    "dashboard.decision_4": "جدولة مراجعة العميل للتكتل المعدل.",
    "intake.eyebrow": "استقبال المشروع",
    "intake.title": "إعداد مشروع جديد",
    "intake.lead":
      "سجّل بيانات الموقع ومتطلبات البرنامج ومكتبات الأكواد قبل إطلاق التوليد الذكي للتصميم.",
    "intake.save_draft": "حفظ المسودة",
    "intake.launch_generation": "بدء التوليد",
    "intake.site_context": "الموقع والسياق",
    "intake.project_name": "اسم المشروع",
    "intake.region": "المنطقة",
    "intake.building_type": "نوع المبنى",
    "intake.design_phase": "مرحلة التصميم",
    "intake.target_gfa": "إجمالي المساحة (م²)",
    "intake.floors": "عدد الطوابق",
    "intake.site_model": "نموذج الموقع",
    "intake.site_drop": "اسحب ملفات IFC أو DWG أو GeoJSON هنا",
    "intake.project_brief": "ملخص التصميم",
    "intake.program_requirements": "البرنامج والمتطلبات",
    "intake.core_ratio": "نسبة القلب (%)",
    "intake.parking": "عدد مواقف السيارات",
    "intake.budget": "الميزانية المستهدفة (دولار)",
    "intake.delivery": "جدول التسليم",
    "intake.code_performance": "مكتبات الأكواد والأداء",
    "intake.primary_code": "مكتبة الأكواد الأساسية",
    "intake.energy_target": "هدف الطاقة (EUI)",
    "intake.daylight": "عامل الإضاءة الطبيعية",
    "intake.structural_system": "النظام الإنشائي",
    "intake.mep_strategy": "استراتيجية MEP",
    "intake.validation_checklist": "قائمة التحقق",
    "intake.simulate_now": "تشغيل المحاكاة",
    "intake.check_1": "التحقق من مسارات الإخلاء وفق لوائح الحريق.",
    "intake.check_2": "تأكيد البحور ضمن الحدود المفضلة.",
    "intake.check_3": "التأكد من مسارات الرايزر وخلو المسارات الخدمية.",
    "intake.check_4": "تشغيل تحليل أولي للطاقة والإضاءة.",
    "intake.placeholder.project_name": "برج مكاتب الرياض",
    "intake.placeholder.gfa": "28,500",
    "intake.placeholder.floors": "32",
    "intake.placeholder.brief":
      "صف المتطلبات الوظيفية الأساسية وأولوية المجاورة وأي قيود خاصة.",
    "intake.placeholder.core_ratio": "24",
    "intake.placeholder.parking": "420",
    "intake.placeholder.budget": "$40M",
    "intake.placeholder.delivery": "الربع الرابع 2026",
    "intake.placeholder.energy_target": "EUI 75",
    "intake.placeholder.daylight": "3.0%",
    "intake.option.saudi": "السعودية",
    "intake.option.uae": "الإمارات",
    "intake.option.qatar": "قطر",
    "intake.option.bahrain": "البحرين",
    "intake.option.oman": "عمان",
    "intake.option.residential": "سكني",
    "intake.option.commercial": "تجاري",
    "intake.option.office": "مكاتب",
    "intake.option.retail": "تجزئة",
    "intake.option.hospitality": "ضيافة",
    "intake.option.healthcare": "رعاية صحية",
    "intake.option.mixed": "متعدد الاستخدامات",
    "intake.option.education": "تعليمي",
    "intake.option.phase_schematic": "تصميم مبدئي",
    "intake.option.phase_dd": "تطوير التصميم",
    "intake.option.phase_cd": "وثائق التنفيذ",
    "intake.option.code_saudi": "كود البناء السعودي 2018",
    "intake.option.code_uae": "كود الحريق والسلامة الإماراتي",
    "intake.option.code_qatar": "مواصفات البناء القطرية",
    "intake.option.structural_rc": "هيكل خرسانة مسلحة",
    "intake.option.structural_steel": "فولاذ مركب",
    "intake.option.structural_pt": "بلاطة مشدودة بعد الصب",
    "intake.option.mep_central": "محطة مركزية + VAV",
    "intake.option.mep_district": "تبريد مركزي",
    "intake.option.mep_hybrid": "عوارض تبريد هجينة",
    "orchestrator.eyebrow": "المنسق",
    "orchestrator.title": "تشغيل متعدد الوكلاء",
    "orchestrator.lead":
      "تنسيق المعماري والإنشائي وMEP والمحاكاة مع حل التعارضات والتحقق اللحظي.",
    "orchestrator.edit_inputs": "تعديل البيانات",
    "orchestrator.publish_outputs": "نشر المخرجات",
    "orchestrator.run_timeline": "خط سير التشغيل",
    "orchestrator.decision_feed": "سجل القرارات",
    "orchestrator.live_metrics": "المؤشرات الحية",
    "orchestrator.run_button": "تشغيل المنسق",
    "orchestrator.awaiting": "بانتظار بدء التشغيل.",
    "orchestrator.step_1": "التحقق من المدخلات والتطبيع",
    "orchestrator.step_1_meta": "الأكواد، التنظيم، هندسة الموقع",
    "orchestrator.step_2": "التوليد المعماري",
    "orchestrator.step_2_meta": "الكتلة + العلاقات",
    "orchestrator.step_3": "بناء الهيكل الإنشائي",
    "orchestrator.step_3_meta": "الشبكة + المقاسات",
    "orchestrator.step_4": "تنسيق مسارات MEP",
    "orchestrator.step_4_meta": "كشف التعارضات",
    "orchestrator.step_5": "المحاكاة والامتثال",
    "orchestrator.step_5_meta": "الطاقة + الإخلاء",
    "orchestrator.step_6": "تجهيز حزمة BIM والتقارير",
    "orchestrator.step_6_meta": "IFC + الجداول",
    "orchestrator.decision_1": "09:24 - تعديل إزاحات القلب لتحسين الإضاءة.",
    "orchestrator.decision_2": "09:31 - تحذير من بحر 12م وطلب زيادة عمق الكمرة.",
    "orchestrator.decision_3": "09:36 - إعادة توجيه الرايزر حول جدار القص.",
    "orchestrator.decision_4": "09:44 - تنبيه مسافة الإخلاء في الدور الرابع.",
    "orchestrator.open_conflicts": "تعارضات مفتوحة",
    "orchestrator.pending_responses": "2 ردود معلقة",
    "orchestrator.iterations": "عدد التكرارات",
    "orchestrator.cycles_completed": "3 دورات مكتملة",
    "orchestrator.next_checkpoint": "النقطة التالية",
    "orchestrator.next_checkpoint_meta": "إعادة المحاكاة خلال 12 دقيقة",
    "outputs.eyebrow": "المخرجات",
    "outputs.title": "مخرجات BIM",
    "outputs.lead": "تصدير IFC والرسومات والجداول وتقارير الأداء للعرض.",
    "outputs.review_files": "ملفات المراجعة",
    "outputs.review_files_empty": "لا توجد ملفات مراجعة بعد.",
    "outputs.review_run": "مراجعة التشغيل",
    "outputs.share_client": "مشاركة مع العميل",
    "outputs.delivery_files": "ملفات التسليم",
    "outputs.plan_preview": "معاينة المخطط و3D",
    "outputs.plan_workspace": "مساحة المخطط",
    "outputs.plan_subtitle": "تحرير وتنسيق المخطط ثنائي الأبعاد",
    "outputs.plan_undo": "تراجع",
    "outputs.plan_redo": "إعادة",
    "outputs.plan_snap": "تطابق",
    "outputs.plan_grid": "شبكة",
    "outputs.plan_save": "حفظ",
    "outputs.plan_zoom_in": "تكبير",
    "outputs.plan_zoom_out": "تصغير",
    "outputs.plan_fit": "ملاءمة",
    "outputs.plan_reset": "إعادة ضبط",
    "outputs.plan_fullscreen": "شاشة كاملة",
    "outputs.plan_loading": "جاري تحميل المخطط...",
    "outputs.plan_hint": "اسحب للتحريك • عجلة الفأرة للتكبير",
    "outputs.properties": "الخصائص",
    "outputs.layers": "الطبقات",
    "outputs.property_tool": "الأداة",
    "outputs.property_layer": "الطبقة",
    "outputs.property_snaps": "التطابق",
    "outputs.layer_arch": "معماري",
    "outputs.layer_struct": "إنشائي",
    "outputs.layer_mep": "كهروميكانيك",
    "outputs.layer_annotations": "محاور + أبعاد",
    "outputs.review_notes": "ملاحظات المراجعة المعمارية",
    "outputs.review_badge": "معماري",
    "outputs.review_empty": "لا توجد ملاحظات بعد.",
    "outputs.review_category": "التصنيف",
    "outputs.review_category_default": "اختر",
    "outputs.review_category_layout": "التوزيع",
    "outputs.review_category_core": "النواة",
    "outputs.review_category_circulation": "الحركة",
    "outputs.review_category_facade": "الواجهة",
    "outputs.review_category_code": "التوافق مع الأكواد",
    "outputs.review_category_mep": "تنسيق MEP",
    "outputs.review_priority": "الأولوية",
    "outputs.review_priority_default": "اختر",
    "outputs.review_priority_low": "منخفضة",
    "outputs.review_priority_medium": "متوسطة",
    "outputs.review_priority_high": "عالية",
    "outputs.review_priority_urgent": "عاجلة",
    "outputs.review_placeholder": "اكتب ملاحظاتك المعمارية هنا",
    "outputs.review_submit": "إضافة ملاحظة",
    "outputs.review_approve": "اعتماد",
    "outputs.review_approve_generate": "اعتماد وتوليد التخصصات",
    "outputs.review_pending": "بانتظار اعتماد التصميم المعماري. اعتمد لبدء الإنشائي وMEP.",
    "outputs.model_health": "صحة النموذج",
    "outputs.quantity_summary": "ملخص الكميات",
    "outputs.stakeholder_pack": "حزمة أصحاب المصلحة",
    "outputs.download": "تحميل",
    "outputs.publish_pack": "نشر الحزمة",
    "outputs.send_review": "إرسال للمراجعة",
    "outputs.preview_plan": "عرض المخطط",
    "outputs.preview_3d": "كتلة ثلاثية الأبعاد",
    "outputs.clash_free": "مسارات خالية من التعارض",
    "outputs.code_compliance": "الامتثال للكود",
    "outputs.energy_performance": "أداء الطاقة",
    "outputs.structural_utilization": "كفاءة الهيكل",
    "outputs.remaining_issues": "مشكلات متبقية: توضيحا إخلاء، وتعارض مجرى واحد.",
    "outputs.table.discipline": "التخصص",
    "outputs.table.quantity": "الكمية الرئيسية",
    "outputs.table.delta": "التغيير",
    "outputs.pack_item_1": "مجموعة رندرات جاهزة للعميل",
    "outputs.pack_item_2": "ملخص الامتثال للكود",
    "outputs.pack_item_3": "مواءمة التكلفة والبرنامج الزمني",
    "outputs.pack_item_4": "سجل المخاطر والتعارضات",
    "outputs.meta.ifc": "نموذج BIM | 420MB",
    "outputs.meta.mep": "الخدمات والكميات",
    "outputs.meta.energy": "EUI + تحليل الأحمال",
    "outputs.meta.package": "رسومات + مرئيات",
    "outputs.meta.plan": "مخطط تم توليده",
    "outputs.meta.gltf": "نموذج كتلي ثلاثي الأبعاد",
    "outputs.qty.structure": "الهيكل",
    "outputs.qty.mep": "MEP",
    "outputs.qty.facade": "الواجهة",
    "orchestrator.metric_compliance": "الامتثال للكود",
    "orchestrator.metric_structural": "تباين إنشائي",
    "orchestrator.metric_clash": "كثافة التعارض",
    "orchestrator.metric_energy": "شدة الطاقة",
    "log.run_init": "تهيئة تنسيق متعدد الوكلاء...",
    "log.run_complete": "اكتمل التشغيل. نموذج BIM جاهز للمراجعة والتنزيل.",
    "log.orchestrator_start": "بدء تشغيل المنسق...",
    "log.orchestrator_complete": "اكتمل التشغيل. المخرجات جاهزة للتصدير.",
    "lang.toggle": "EN",
  },
};

function getCurrentLang() {
  const stored = localStorage.getItem(LANG_KEY);
  if (stored && SUPPORTED_LANGS.includes(stored)) {
    return stored;
  }
  const defaultLang = document.documentElement.getAttribute("data-default-lang");
  if (defaultLang && SUPPORTED_LANGS.includes(defaultLang)) {
    return defaultLang;
  }
  return "en";
}

function setCurrentLang(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) return;
  localStorage.setItem(LANG_KEY, lang);
  document.documentElement.setAttribute("lang", lang);
  document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
}

function translate(key) {
  const lang = getCurrentLang();
  return translations[lang]?.[key] || translations.en[key] || key;
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = translate(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = translate(el.dataset.i18nPlaceholder);
  });
  document.querySelectorAll("[data-i18n-value]").forEach((el) => {
    el.value = translate(el.dataset.i18nValue);
  });
  const langToggle = document.querySelector("[data-lang-toggle]");
  if (langToggle) {
    langToggle.textContent = translate("lang.toggle");
  }
}

function translatePhase(phase, lang) {
  const map = {
    Schematic: { ar: "تصميم مبدئي", en: "Schematic" },
    "Design Development": { ar: "تطوير التصميم", en: "Design Development" },
    "Construction Documents": { ar: "وثائق التنفيذ", en: "Construction Documents" },
  };
  if (!phase) return phase;
  return map[phase]?.[lang] || phase;
}

function translateStatus(status, lang) {
  const normalized = String(status || "").toLowerCase();
  const map = {
    running: "قيد التشغيل",
    queued: "في الانتظار",
    review: "مراجعة",
    complete: "مكتمل",
    "in progress": "قيد التنفيذ",
    pending: "معلق",
    "needs review": "يحتاج مراجعة",
  };
  if (lang !== "ar") return status;
  return map[normalized] || status;
}

function ensureValue(value, fallback) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  return value;
}

function toNumber(value) {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const match = String(value).match(/[\d.]+/);
  return match ? Number(match[0]) : 0;
}

function getValueByPath(obj, path) {
  return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

function setValueByPath(obj, path, value) {
  const keys = path.split(".");
  const lastKey = keys.pop();
  const target = keys.reduce((acc, key) => {
    if (!acc[key]) {
      acc[key] = {};
    }
    return acc[key];
  }, obj);
  target[lastKey] = value;
}

function mergeState(stored) {
  return {
    project: { ...defaultState.project, ...(stored?.project || {}) },
    run: { ...defaultState.run, ...(stored?.run || {}) },
    outputs: { ...defaultState.outputs, ...(stored?.outputs || {}) },
  };
}

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STATE_KEY) || "{}");
    return mergeState(stored);
  } catch (error) {
    return mergeState({});
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch (error) {
    return;
  }
}

function updateDerivedState(state) {
  const lang = getCurrentLang();
  state.project.name = ensureValue(state.project.name, defaultState.project.name);
  state.project.region = ensureValue(
    state.project.region,
    defaultState.project.region
  );
  state.project.phase = ensureValue(state.project.phase, defaultState.project.phase);
  state.project.status = ensureValue(
    state.project.status,
    defaultState.project.status
  );
  state.project.nextRun = ensureValue(
    state.project.nextRun,
    defaultState.project.nextRun
  );

  const gfa = ensureValue(state.project.gfa, defaultState.project.gfa);
  const phase = translatePhase(state.project.phase, lang);
  const unitLabel = lang === "ar" ? "م²" : "m2";
  const phaseLabel = lang === "ar" ? "المرحلة" : "Phase";
  state.project.meta = `${gfa} ${unitLabel} | ${phaseLabel}: ${phase}`;
  state.project.runMeta = `${state.project.name} | ${phase}`;

  state.run.id = ensureValue(state.run.id, defaultState.run.id);
  state.run.status = ensureValue(state.run.status, defaultState.run.status);
  state.run.updatedAt = ensureValue(state.run.updatedAt, defaultState.run.updatedAt);

  if (typeof state.run.conflicts === "number") {
    const count = state.run.conflicts;
    state.run.conflicts = `${count} conflict${count === 1 ? "" : "s"}`;
  }

  state.outputs.energy = ensureValue(state.outputs.energy, defaultState.outputs.energy);
  state.outputs.compliance = ensureValue(
    state.outputs.compliance,
    defaultState.outputs.compliance
  );

  const complianceValue = toNumber(state.outputs.compliance);
  state.outputs.complianceValue =
    complianceValue || state.outputs.complianceValue || 0;
  state.outputs.clashFree = toNumber(
    ensureValue(state.outputs.clashFree, defaultState.outputs.clashFree)
  );
  state.outputs.energyScore = toNumber(
    ensureValue(state.outputs.energyScore, defaultState.outputs.energyScore)
  );
  state.outputs.structuralScore = toNumber(
    ensureValue(state.outputs.structuralScore, defaultState.outputs.structuralScore)
  );
  state.outputs.clashFreeLabel = `${state.outputs.clashFree}%`;
  state.outputs.energyScoreLabel = `${state.outputs.energyScore}%`;
  state.outputs.structuralScoreLabel = `${state.outputs.structuralScore}%`;

  state.outputs.ifcFile = ensureValue(
    state.outputs.ifcFile,
    defaultState.outputs.ifcFile
  );
  state.outputs.mepScheduleFile = ensureValue(
    state.outputs.mepScheduleFile,
    defaultState.outputs.mepScheduleFile
  );
  state.outputs.energyReportFile = ensureValue(
    state.outputs.energyReportFile,
    defaultState.outputs.energyReportFile
  );
  state.outputs.reviewPackageFile = ensureValue(
    state.outputs.reviewPackageFile,
    defaultState.outputs.reviewPackageFile
  );
  state.outputs.planSvgFile = ensureValue(
    state.outputs.planSvgFile,
    defaultState.outputs.planSvgFile
  );
  state.outputs.gltfFile = ensureValue(
    state.outputs.gltfFile,
    defaultState.outputs.gltfFile
  );

  if (!state.outputs.generatedAt) {
    state.outputs.generatedAt = defaultState.outputs.generatedAt;
  }
}

function updateStatusBadge(element, status) {
  const raw = element.dataset.statusRaw || status;
  const value = raw.toLowerCase();
  element.classList.remove("warning", "muted");
  if (
    value.includes("queued") ||
    value.includes("pending") ||
    value.includes("idle")
  ) {
    element.classList.add("muted");
  }
  if (value.includes("review") || value.includes("warning")) {
    element.classList.add("warning");
  }
}

function updateProgressBars() {
  document.querySelectorAll("[data-progress]").forEach((bar) => {
    const value = Number(bar.dataset.progress || 0);
    bar.style.width = `${value}%`;
  });
}

function applyBindings(state) {
  const lang = getCurrentLang();
  document.querySelectorAll("[data-bind]").forEach((element) => {
    const value = getValueByPath(state, element.dataset.bind);
    if (value !== undefined && value !== null && value !== "") {
      if (element.dataset.bind.includes("status")) {
        element.dataset.statusRaw = value;
        element.textContent = translateStatus(value, lang);
      } else {
        element.textContent = value;
      }
    }
  });

  document.querySelectorAll("[data-status-badge]").forEach((element) => {
    updateStatusBadge(element, element.textContent.trim());
  });
}

function applyFieldValues(state) {
  document.querySelectorAll("[data-field]").forEach((element) => {
    const value = getValueByPath(state, element.dataset.field);
    if (value !== undefined && value !== null && value !== "") {
      element.value = value;
    }
  });
}

function applyProgressBindings(state) {
  document.querySelectorAll("[data-progress-bind]").forEach((element) => {
    const value = getValueByPath(state, element.dataset.progressBind);
    const numeric = toNumber(value);
    if (!Number.isNaN(numeric)) {
      element.dataset.progress = numeric;
    }
  });
  updateProgressBars();
}

function applyFileDrop(state) {
  const drop = document.querySelector("[data-file-drop]");
  if (!drop) return;
  if (state.project.siteModel) {
    drop.textContent = `Attached: ${state.project.siteModel}`;
  }
}

function buildFileUrl(state, fileName) {
  if (!fileName || !state.project.id || !state.run.id) return null;
  const base =
    activeApiBase ||
    (window.location.origin === "null" ? "" : window.location.origin);
  if (!base) return null;
  return `${base}/files/${state.project.id}/${state.run.id}/${fileName}`;
}

function applyFileLinks(state) {
  document.querySelectorAll("[data-file-link]").forEach((link) => {
    const key = link.dataset.fileKey;
    const fileName = state.outputs?.[key];
    const fileUrl = buildFileUrl(state, fileName);
    if (fileUrl) {
      link.setAttribute("href", fileUrl);
      link.setAttribute("download", fileName || "");
      link.classList.remove("is-disabled");
    } else {
      link.removeAttribute("href");
      link.classList.add("is-disabled");
    }
  });
}

function updateReviewApproveLabel(state) {
  if (!reviewApprove) return;
  const key = isArchitectureOnly(state)
    ? "outputs.review_approve_generate"
    : "outputs.review_approve";
  reviewApprove.dataset.i18n = key;
}

function broadcastState(state) {
  window.aiDesignerState = state;
  window.aiDesignerFilesBase =
    activeApiBase || (window.location.origin === "null" ? "" : window.location.origin);
  window.dispatchEvent(new CustomEvent("ai-designer:state", { detail: state }));
}

function applyState(state) {
  updateDerivedState(state);
  applyBindings(state);
  applyFieldValues(state);
  applyProgressBindings(state);
  applyFileDrop(state);
  applyFileLinks(state);
  updateReviewApproveLabel(state);
  broadcastState(state);
  applyTranslations();
  refreshRunEvents();
  refreshReviewNotes();
  refreshRunArtifacts();
}

function mapApiToState(payload) {
  const project = payload?.project || {};
  const run = payload?.run || {};
  const outputs = payload?.outputs || {};

  return mergeState({
    project: {
      id: project.id || "",
      name: project.name || defaultState.project.name,
      region: project.region || defaultState.project.region,
      type: project.building_type || project.type || defaultState.project.type,
      phase: project.phase || defaultState.project.phase,
      gfa: project.gfa || defaultState.project.gfa,
      floors: project.floors || defaultState.project.floors,
      status: project.status || defaultState.project.status,
      nextRun: project.next_run || project.nextRun || defaultState.project.nextRun,
      brief: project.brief || "",
      coreRatio: project.core_ratio || "",
      parking: project.parking || "",
      budget: project.budget || "",
      delivery: project.delivery || "",
      codeLibrary: project.code_library || "",
      energyTarget: project.energy_target || "",
      daylight: project.daylight || "",
      structuralSystem: project.structural_system || "",
      mepStrategy: project.mep_strategy || "",
      siteModel: project.site_model || "",
    },
    run: {
      id: run.id || "",
      status: run.status || defaultState.run.status,
      conflicts: run.conflicts || defaultState.run.conflicts,
      updatedAt: run.updated_at || run.updatedAt || defaultState.run.updatedAt,
    },
    outputs: {
      id: outputs.id || "",
      clashDensity: outputs.clash_density || defaultState.outputs.clashDensity,
      structuralVariance:
        outputs.structural_variance || defaultState.outputs.structuralVariance,
      compliance: outputs.compliance || defaultState.outputs.compliance,
      energy: outputs.energy || defaultState.outputs.energy,
      clashFree: outputs.clash_free || defaultState.outputs.clashFree,
      energyScore: outputs.energy_score || defaultState.outputs.energyScore,
      structuralScore: outputs.structural_score || defaultState.outputs.structuralScore,
      ifcFile: outputs.ifc_file || defaultState.outputs.ifcFile,
      mepScheduleFile:
        outputs.mep_schedule_file || defaultState.outputs.mepScheduleFile,
      energyReportFile:
        outputs.energy_report_file || defaultState.outputs.energyReportFile,
      reviewPackageFile:
        outputs.review_package_file || defaultState.outputs.reviewPackageFile,
      planSvgFile: outputs.plan_svg_file || defaultState.outputs.planSvgFile,
      gltfFile: outputs.gltf_file || defaultState.outputs.gltfFile,
      generatedAt: outputs.generated_at || defaultState.outputs.generatedAt,
    },
  });
}

function mapStateToApi(state) {
  return {
    project: {
      id: state.project.id || undefined,
      name: state.project.name,
      region: state.project.region,
      type: state.project.type,
      phase: state.project.phase,
      gfa: state.project.gfa,
      floors: state.project.floors,
      status: state.project.status,
      next_run: state.project.nextRun,
      brief: state.project.brief,
      core_ratio: state.project.coreRatio,
      parking: state.project.parking,
      budget: state.project.budget,
      delivery: state.project.delivery,
      code_library: state.project.codeLibrary,
      energy_target: state.project.energyTarget,
      daylight: state.project.daylight,
      structural_system: state.project.structuralSystem,
      mep_strategy: state.project.mepStrategy,
      site_model: state.project.siteModel,
    },
    run: {
      id: state.run.id || undefined,
      status: state.run.status,
      conflicts: state.run.conflicts,
      updated_at: state.run.updatedAt,
    },
    outputs: {
      id: state.outputs.id || undefined,
      clash_density: state.outputs.clashDensity,
      structural_variance: state.outputs.structuralVariance,
      compliance: state.outputs.compliance,
      energy: state.outputs.energy,
      clash_free: state.outputs.clashFree,
      energy_score: state.outputs.energyScore,
      structural_score: state.outputs.structuralScore,
      ifc_file: state.outputs.ifcFile,
      mep_schedule_file: state.outputs.mepScheduleFile,
      energy_report_file: state.outputs.energyReportFile,
      review_package_file: state.outputs.reviewPackageFile,
      plan_svg_file: state.outputs.planSvgFile,
      gltf_file: state.outputs.gltfFile,
      generated_at: state.outputs.generatedAt,
    },
  };
}

async function requestApi(base, path, options = {}) {
  const response = await fetch(`${base}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`API ${response.status}`);
  }
  return response.json();
}

async function getApiState() {
  const bases = activeApiBase ? [activeApiBase] : API_BASES;
  for (const base of bases) {
    try {
      const data = await requestApi(base, "/api/state");
      setActiveApiBase(base);
      return data;
    } catch (error) {
      continue;
    }
  }
  return null;
}

async function fetchApiState() {
  for (const base of API_BASES) {
    try {
      const data = await requestApi(base, "/api/state");
      setActiveApiBase(base);
      return data;
    } catch (error) {
      if (String(error).includes("404")) {
        try {
          const data = await requestApi(base, "/api/state", {
            method: "POST",
            body: JSON.stringify(mapStateToApi(defaultState)),
          });
          setActiveApiBase(base);
          return data;
        } catch (innerError) {
          continue;
        }
      }
    }
  }
  return null;
}

async function postApiState(state) {
  const payload = mapStateToApi(state);
  const bases = activeApiBase ? [activeApiBase] : API_BASES;
  for (const base of bases) {
    try {
      const data = await requestApi(base, "/api/state", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setActiveApiBase(base);
      return data;
    } catch (error) {
      continue;
    }
  }
  return null;
}

async function startApiRun(projectId, stage = "") {
  const bases = activeApiBase ? [activeApiBase] : API_BASES;
  for (const base of bases) {
    try {
      const stageParam = stage ? `stage=${encodeURIComponent(stage)}` : "";
      let query = "";
      if (projectId && stageParam) {
        query = `?project_id=${projectId}&${stageParam}`;
      } else if (projectId) {
        query = `?project_id=${projectId}`;
      } else if (stageParam) {
        query = `?${stageParam}`;
      }
      const data = await requestApi(base, `/api/runs/start${query}`, {
        method: "POST",
      });
      setActiveApiBase(base);
      return data;
    } catch (error) {
      continue;
    }
  }
  return null;
}

async function initializeState() {
  const apiState = await fetchApiState();
  if (apiState) {
    const mapped = mapApiToState(apiState);
    saveState(mapped);
    applyState(mapped);
    refreshStateIfRunning();
    return;
  }
  applyState(loadState());
  refreshStateIfRunning();
}

setCurrentLang(getCurrentLang());
initializeState();

const langToggle = document.querySelector("[data-lang-toggle]");
if (langToggle) {
  langToggle.addEventListener("click", () => {
    const nextLang = getCurrentLang() === "en" ? "ar" : "en";
    setCurrentLang(nextLang);
    applyState(loadState());
  });
}

function collectFormState(state) {
  document.querySelectorAll("[data-field]").forEach((element) => {
    if (
      element.tagName === "INPUT" ||
      element.tagName === "TEXTAREA" ||
      element.tagName === "SELECT"
    ) {
      setValueByPath(state, element.dataset.field, element.value.trim());
    }
  });
}

const actionButtons = document.querySelectorAll("[data-action]");
if (actionButtons.length) {
  actionButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const state = loadState();
      collectFormState(state);
      if (button.dataset.action === "launch-generation") {
        state.project.status = "Running";
        state.project.nextRun = "Architectural generation";
        state.run.status = "In progress";
        state.run.updatedAt = "Updated moments ago";
        state.outputs.generatedAt = "Pending generation";
        saveState(state);
        const apiState = await postApiState(state);
        let mapped = apiState ? mapApiToState(apiState) : state;
        if (apiState) {
          saveState(mapped);
          applyState(mapped);
        }
        const runState = await startApiRun(mapped.project.id, "architectural");
        if (runState) {
          mapped = mapApiToState(runState);
          saveState(mapped);
          applyState(mapped);
        }
        window.location.href = "outputs.html";
        return;
      }

      state.project.status = "Queued";
      state.project.nextRun = "Awaiting launch";
      saveState(state);
      const apiState = await postApiState(state);
      if (apiState) {
        const mapped = mapApiToState(apiState);
        saveState(mapped);
        applyState(mapped);
      }
      window.location.href = "app.html";
    });
  });
}

const fileDrop = document.querySelector("[data-file-drop]");
const fileInput = document.querySelector("[data-file-input]");

function handleFileSelection(file) {
  if (!file) return;
  const state = loadState();
  state.project.siteModel = file.name;
  saveState(state);
  applyState(state);
  postApiState(state);
}

if (fileDrop && fileInput) {
  fileDrop.addEventListener("click", () => fileInput.click());
  fileDrop.addEventListener("dragover", (event) => {
    event.preventDefault();
    fileDrop.classList.add("is-dragover");
  });
  fileDrop.addEventListener("dragleave", () => {
    fileDrop.classList.remove("is-dragover");
  });
  fileDrop.addEventListener("drop", (event) => {
    event.preventDefault();
    fileDrop.classList.remove("is-dragover");
    const file = event.dataTransfer.files[0];
    handleFileSelection(file);
  });
  fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    handleFileSelection(file);
  });
}

const runButton = document.querySelector("[data-run-demo]");
const steps = Array.from(document.querySelectorAll(".step"));
const runLog = document.getElementById("run-log");
const metrics = {
  clash: document.querySelector("[data-metric='clash']"),
  energy: document.querySelector("[data-metric='energy']"),
  cost: document.querySelector("[data-metric='cost']"),
};

let isRunning = false;

const statusMessages = {
  en: [
    "Architectural agent generating massing and adjacency layout.",
    "Structural agent sizing beams and columns.",
    "MEP agent routing ducts and risers.",
    "Simulation engine validating energy and code checks.",
    "Outputting BIM package and visualization set.",
  ],
  ar: [
    "الوكيل المعماري يولّد الكتل وعلاقات الفراغات.",
    "الوكيل الإنشائي يحدد مقاسات الأعمدة والكمرات.",
    "وكيل MEP يرسم مسارات الدكت والرايزر.",
    "محرك المحاكاة يتحقق من الطاقة والاشتراطات.",
    "إنتاج حزمة BIM ومجموعة التصوير.",
  ],
};

function resetSteps() {
  steps.forEach((step) => {
    step.classList.remove("is-running", "is-done");
  });
}

function updateMetrics() {
  if (metrics.clash) {
    metrics.clash.textContent = "3%";
  }
  if (metrics.energy) {
    metrics.energy.textContent = "EUI 74";
  }
  if (metrics.cost) {
    metrics.cost.textContent = "$39.8M";
  }
}

function runDemo() {
  if (isRunning) return;
  isRunning = true;
  resetSteps();
  if (runLog) {
    runLog.textContent = translate("log.run_init");
  }

  const messages = statusMessages[getCurrentLang()] || statusMessages.en;
  messages.forEach((message, index) => {
    const delay = index * 900;
    setTimeout(() => {
      steps.forEach((step, stepIndex) => {
        step.classList.toggle("is-running", stepIndex === index);
        step.classList.toggle("is-done", stepIndex < index);
      });

      if (runLog) {
        runLog.textContent = message;
      }

      if (index === statusMessages.length - 1) {
        setTimeout(() => {
          orchestratorSteps.forEach((step) => step.classList.add("is-done"));
          if (runLog) {
            runLog.textContent = translate("log.run_complete");
          }
          updateMetrics();
          isRunning = false;
        }, 900);
      }
    }, delay);
  });
}

if (runButton) {
  runButton.addEventListener("click", runDemo);
}

const orchestratorButton = document.querySelector("[data-run-orchestrator]");
const orchestratorSteps = Array.from(
  document.querySelectorAll("[data-orchestrator-step]")
);
const orchestratorLog = document.getElementById("orchestrator-log");
const decisionFeed = document.querySelector("[data-decision-feed]");
const reviewFeed = document.querySelector("[data-review-feed]");
const reviewForm = document.querySelector("[data-review-form]");
const reviewInput = document.querySelector("[data-review-input]");
const reviewCategory = document.querySelector("[data-review-category]");
const reviewPriority = document.querySelector("[data-review-priority]");
const reviewApprove = document.querySelector("[data-review-approve]");
const artifactList = document.querySelector("[data-artifact-list]");

let isOrchestratorRunning = false;
let isStateRefreshing = false;

const orchestratorMessages = {
  en: [
    "Parsing intake data and code libraries.",
    "Architectural agent generating layout options.",
    "Structural agent aligning grid and sizing members.",
    "MEP agent routing risers and trunks.",
    "Simulation agent validating energy and egress checks.",
    "Packaging IFC, schedules, and visualization set.",
  ],
  ar: [
    "تحليل بيانات الاستقبال ومكتبات الأكواد.",
    "الوكيل المعماري يولّد بدائل المخطط.",
    "الوكيل الإنشائي يضبط الشبكة ويحدد المقاسات.",
    "وكيل MEP ينسّق الرايزر والمسارات الرئيسية.",
    "وكيل المحاكاة يتحقق من الطاقة ومسارات الإخلاء.",
    "تجهيز IFC والجداول وحزمة التصوير.",
  ],
};

function resetOrchestratorSteps() {
  orchestratorSteps.forEach((step) => {
    step.classList.remove("is-running", "is-done");
  });
}

function buildFileBase(projectName) {
  const base = (projectName || "Project")
    .replace(/[^a-zA-Z0-9]+/g, "")
    .slice(0, 20);
  return base || "Project";
}

function isArchitectureOnly(state) {
  const nextRun = String(state?.project?.nextRun || "").toLowerCase();
  const awaiting = nextRun.includes("architectural");
  const outputs = state?.outputs || {};
  const missingDisciplines = !outputs.mepScheduleFile && !outputs.energyReportFile &&
    !outputs.reviewPackageFile;
  return awaiting || missingDisciplines;
}

function finalizeOrchestratorRun() {
  const state = loadState();
  state.run.status = "Complete";
  state.run.updatedAt = "Updated just now";
  state.run.conflicts = "0 conflicts";
  state.project.status = "Review";
  state.project.nextRun = "Client review";
  state.outputs.generatedAt = "Generated moments ago";
  state.outputs.clashDensity = "2.1%";
  state.outputs.structuralVariance = "0.6%";
  state.outputs.compliance = "96%";
  state.outputs.energy = "EUI 74";
  state.outputs.clashFree = 97;
  state.outputs.energyScore = 90;
  state.outputs.structuralScore = 92;
  const base = buildFileBase(state.project.name);
  state.outputs.ifcFile = `${base}_v10.ifc`;
  state.outputs.mepScheduleFile = `${base}_MEP_Schedule.xlsx`;
  state.outputs.energyReportFile = `${base}_Energy_Report.pdf`;
  state.outputs.reviewPackageFile = `${base}_Review_Package.zip`;
  state.outputs.planSvgFile = `${base}_plan.svg`;
  state.outputs.gltfFile = `${base}_massing.gltf`;
  saveState(state);
  applyState(state);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function pollRunCompletion(maxAttempts = 20, intervalMs = 1200) {
  const bases = activeApiBase ? [activeApiBase] : API_BASES;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    for (const base of bases) {
      try {
        const data = await requestApi(base, "/api/state");
        setActiveApiBase(base);
        const status = String(data?.run?.status || "").toLowerCase();
        if (status && !status.includes("progress") && status !== "queued") {
          return data;
        }
      } catch (error) {
        continue;
      }
    }
    await wait(intervalMs);
  }
  return null;
}

async function refreshStateFromApi() {
  if (isStateRefreshing) return;
  isStateRefreshing = true;
  try {
    const apiState = await getApiState();
    if (apiState) {
      const mapped = mapApiToState(apiState);
      saveState(mapped);
      applyState(mapped);
    }
  } finally {
    isStateRefreshing = false;
  }
}

function refreshStateIfRunning() {
  const state = loadState();
  const status = String(state?.run?.status || "").toLowerCase();
  if (status.includes("progress")) {
    refreshStateFromApi();
  }
}

async function runOrchestrator() {
  if (isOrchestratorRunning) return;
  isOrchestratorRunning = true;
  resetOrchestratorSteps();
  if (orchestratorLog) {
    orchestratorLog.textContent = translate("log.orchestrator_start");
  }

  const activeState = loadState();
  activeState.run.status = "In progress";
  activeState.run.updatedAt = "Updated moments ago";
  activeState.project.status = "Running";
  saveState(activeState);
  applyState(activeState);

  const apiState = await startApiRun(activeState.project.id, "architectural");
  if (apiState) {
    const mapped = mapApiToState(apiState);
    saveState(mapped);
    applyState(mapped);
  }
  const completed = await pollRunCompletion();
  if (completed) {
    const refreshed = mapApiToState(completed);
    saveState(refreshed);
    applyState(refreshed);
  } else {
    finalizeOrchestratorRun();
  }
  isOrchestratorRunning = false;
}

if (orchestratorButton) {
  orchestratorButton.addEventListener("click", runOrchestrator);
}

const orchestratorStepMap = {
  start: 0,
  init: 0,
  llm: 0,
  architecture: 1,
  agents: 1,
  structure: 2,
  structural: 2,
  mep: 3,
  energy: 4,
  ifc: 5,
  gltf: 5,
  package: 5,
  summary: 5,
};

function applyOrchestratorProgress(events = [], state = loadState()) {
  if (!orchestratorSteps.length) return;
  const status = String(state?.run?.status || "").toLowerCase();
  const isRunning = status.includes("progress");
  let highest = -1;
  let lastMessage = "";

  events.forEach((event) => {
    const key = String(event.step || "").toLowerCase();
    if (Object.prototype.hasOwnProperty.call(orchestratorStepMap, key)) {
      highest = Math.max(highest, orchestratorStepMap[key]);
    }
    if (event.message) {
      lastMessage = event.message;
    }
  });

  if (status === "review" && isArchitectureOnly(state)) {
    orchestratorSteps.forEach((step, idx) => {
      step.classList.toggle("is-done", idx <= 1);
      step.classList.toggle("is-running", false);
    });
    if (orchestratorLog) {
      orchestratorLog.textContent = translate("outputs.review_pending");
    }
    return;
  }

  const runningIndex = isRunning
    ? Math.min(Math.max(highest + 1, 0), orchestratorSteps.length - 1)
    : -1;

  orchestratorSteps.forEach((step, idx) => {
    step.classList.toggle("is-done", idx <= highest && highest >= 0);
    step.classList.toggle("is-running", idx === runningIndex);
  });

  if (orchestratorLog) {
    if (lastMessage) {
      orchestratorLog.textContent = lastMessage;
    } else if (!isRunning && status === "complete") {
      orchestratorLog.textContent = translate("log.orchestrator_complete");
    }
  }
}

async function refreshRunEvents() {
  if (!decisionFeed) return;
  const state = loadState();
  if (!state?.run?.id) return;
  const bases = activeApiBase ? [activeApiBase] : API_BASES;
  for (const base of bases) {
    try {
      const events = await requestApi(base, `/api/runs/${state.run.id}/events`);
      if (!events) continue;
      setActiveApiBase(base);
      decisionFeed.innerHTML = "";
      if (events.length) {
        events.slice(-8).forEach((event) => {
          const row = document.createElement("p");
          row.textContent = event.message;
          decisionFeed.appendChild(row);
        });
      }
      applyOrchestratorProgress(events, state);
      return;
    } catch (error) {
      continue;
    }
  }
}

async function postRunEvent(runId, message, step = "review", level = "info") {
  if (!runId || !message) return null;
  const bases = activeApiBase ? [activeApiBase] : API_BASES;
  for (const base of bases) {
    try {
      const data = await requestApi(base, `/api/runs/${runId}/events`, {
        method: "POST",
        body: JSON.stringify({ message, step, level }),
      });
      setActiveApiBase(base);
      return data;
    } catch (error) {
      continue;
    }
  }
  return null;
}

async function refreshReviewNotes() {
  if (!reviewFeed) return;
  const state = loadState();
  if (!state?.run?.id) return;
  const bases = activeApiBase ? [activeApiBase] : API_BASES;
  for (const base of bases) {
    try {
      const events = await requestApi(base, `/api/runs/${state.run.id}/events`);
      if (events) {
        setActiveApiBase(base);
        const notes = events.filter(
          (event) => event.step === "review" || event.step === "change_request"
        );
        reviewFeed.innerHTML = "";
        if (!notes.length) {
          const empty = document.createElement("p");
          empty.classList.add("muted");
          empty.textContent = isArchitectureOnly(state)
            ? translate("outputs.review_pending")
            : translate("outputs.review_empty");
          reviewFeed.appendChild(empty);
          return;
        }
        notes.slice(-8).forEach((event) => {
          const row = document.createElement("p");
          row.textContent = event.message;
          reviewFeed.appendChild(row);
        });
        return;
      }
    } catch (error) {
      continue;
    }
  }
}

async function refreshRunArtifacts() {
  if (!artifactList) return;
  const state = loadState();
  if (!state?.run?.id) return;
  const bases = activeApiBase ? [activeApiBase] : API_BASES;
  const allowedKinds = new Set(["structural_plan", "structural", "mep"]);
  for (const base of bases) {
    try {
      const artifacts = await requestApi(base, `/api/runs/${state.run.id}/artifacts`);
      if (!artifacts) continue;
      setActiveApiBase(base);
      artifactList.innerHTML = "";
      const filtered = artifacts.filter((artifact) => allowedKinds.has(artifact.kind));
      if (!filtered.length) {
        const empty = document.createElement("li");
        empty.classList.add("muted");
        empty.textContent = translate("outputs.review_files_empty");
        artifactList.appendChild(empty);
        return;
      }
      filtered.forEach((artifact) => {
        const li = document.createElement("li");
        const meta = document.createElement("div");
        const title = document.createElement("p");
        const subtitle = document.createElement("p");
        title.className = "queue-title";
        title.textContent = artifact.file_name;
        subtitle.className = "queue-meta";
        subtitle.textContent = artifact.description || artifact.kind;
        meta.appendChild(title);
        meta.appendChild(subtitle);

        const link = document.createElement("a");
        link.className = "btn ghost";
        link.textContent = translate("outputs.download");
        const url = buildFileUrl(state, artifact.file_name);
        if (url) {
          link.setAttribute("href", url);
          link.setAttribute("download", artifact.file_name);
        } else {
          link.classList.add("is-disabled");
        }
        li.appendChild(meta);
        li.appendChild(link);
        artifactList.appendChild(li);
      });
      return;
    } catch (error) {
      continue;
    }
  }
}

if (reviewForm && reviewInput) {
  reviewForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const rawMessage = reviewInput.value.trim();
    if (!rawMessage) return;
    const categoryText =
      reviewCategory?.value && reviewCategory.selectedOptions?.[0]
        ? reviewCategory.selectedOptions[0].textContent.trim()
        : "";
    const priorityText =
      reviewPriority?.value && reviewPriority.selectedOptions?.[0]
        ? reviewPriority.selectedOptions[0].textContent.trim()
        : "";
    const tags = [categoryText, priorityText].filter(Boolean);
    const message = tags.length ? `[${tags.join(" | ")}] ${rawMessage}` : rawMessage;
    const state = loadState();
    if (!state?.run?.id) return;
    const step = tags.length ? "change_request" : "review";
    await postRunEvent(state.run.id, message, step, "info");
    reviewInput.value = "";
    if (reviewCategory) reviewCategory.value = "";
    if (reviewPriority) reviewPriority.value = "";
    refreshReviewNotes();
  });
}

if (reviewApprove) {
  reviewApprove.addEventListener("click", async () => {
    const state = loadState();
    if (!state?.run?.id) return;
    await postRunEvent(state.run.id, "Architectural review approved.", "review", "success");
    if (isArchitectureOnly(state)) {
      state.project.status = "Running";
      state.project.nextRun = "Discipline generation";
      state.run.status = "In progress";
      state.run.updatedAt = "Updated moments ago";
      state.outputs.generatedAt = "Pending generation";
      saveState(state);
      applyState(state);
      const runState = await startApiRun(state.project.id, "full");
      if (runState) {
        const mapped = mapApiToState(runState);
        saveState(mapped);
        applyState(mapped);
      }
    }
    refreshReviewNotes();
  });
}

const shouldPoll = decisionFeed || reviewFeed || artifactList;
if (shouldPoll) {
  refreshRunEvents();
  refreshReviewNotes();
  refreshRunArtifacts();
  setInterval(() => {
    const state = loadState();
    if (state?.run?.status && state.run.status.toLowerCase().includes("progress")) {
      refreshStateFromApi();
    }
  }, 5000);
}
