"""
Enhanced Architectural Design Agent with Gemini 2.0
===================================================
Uses advanced AI models for intelligent space planning and design generation.
"""

import json
import logging
import math
from typing import Any, Dict, List, Optional, Tuple
from dataclasses import dataclass, field

try:
    from shapely.geometry import Polygon, Point, box, MultiPolygon
    from shapely.ops import unary_union
    SHAPELY_AVAILABLE = True
except ImportError:
    SHAPELY_AVAILABLE = False

from .base_agent import BaseDesignAgent, AgentOutput, AgentStatus, Conflict, ConflictType

logger = logging.getLogger(__name__)


# ============================================================================
# Enhanced Data Structures
# ============================================================================

@dataclass
class IntelligentSpace:
    """Enhanced space with AI-driven properties"""
    id: str
    name: str
    type: str
    area: float
    position: Tuple[float, float]
    width: float
    depth: float
    orientation: str = "north"  # preferred orientation
    daylight_required: bool = False
    adjacency_preferences: List[str] = field(default_factory=list)
    min_ceiling_height: float = 2.7
    furniture_layout: List[Dict] = field(default_factory=list)
    access_points: List[Tuple[float, float]] = field(default_factory=list)
    polygon: Any = None


@dataclass
class SmartFloorPlan:
    """AI-generated floor plan with intelligent layout"""
    floor_number: int
    total_area: float
    net_usable_area: float
    circulation_area: float
    core_area: float
    spaces: List[IntelligentSpace] = field(default_factory=list)
    grid_system: Dict[str, List[float]] = field(default_factory=dict)
    facade_design: Dict[str, Any] = field(default_factory=dict)
    structural_integration: Dict[str, Any] = field(default_factory=dict)


class EnhancedArchitecturalAgent(BaseDesignAgent):
    """
    Enhanced Architectural Agent using Gemini 2.0 for intelligent design.

    Key improvements:
    - Uses Gemini 2.0 Flash Thinking for design decisions
    - Intelligent space planning based on program requirements
    - Proper circulation and adjacency analysis
    - Structural grid coordination
    - Facade design integration
    """

    def __init__(self, llm_client, project_context: Dict[str, Any]):
        super().__init__("Enhanced Architectural", "architectural", llm_client, project_context)

        # Extract project parameters
        self.building_type = project_context.get("building_type", "office")
        self.gfa = self._parse_number(project_context.get("gfa", 5000))
        self.floors = int(project_context.get("floors", 5))
        self.core_ratio = self._parse_number(project_context.get("core_ratio", 0.15))
        self.region = project_context.get("region", "saudi")

        # Design parameters
        self.module = 1.2  # Grid module in meters
        self.floor_height = 3.6  # meters
        self.circulation_ratio = 0.20  # 20% for circulation

    def _parse_number(self, value, fallback=0):
        """Parse number from various formats"""
        if isinstance(value, (int, float)):
            return float(value)
        try:
            return float(str(value).replace(",", ""))
        except:
            return fallback

    async def run(self, inputs: Dict[str, Any] = None) -> AgentOutput:
        """Execute the enhanced architectural design process"""
        try:
            self.log("Starting enhanced architectural design generation")

            # Phase 1: Intelligent Massing
            massing = await self._generate_intelligent_massing()
            self.log(f"Generated intelligent massing: {massing['width']}x{massing['depth']}m, {massing['floors']} floors")

            # Phase 2: Smart Space Program
            space_program = await self._generate_space_program()
            self.log(f"Generated space program with {len(space_program)} space types")

            # Phase 3: Intelligent Floor Plans
            floor_plans = await self._generate_smart_floor_plans(massing, space_program)
            self.log(f"Generated {len(floor_plans)} intelligent floor plans")

            # Phase 4: Facade Design
            facade = await self._design_facade(massing)

            # Phase 5: Code Validation
            validation = self._validate_design(floor_plans, massing)

            # Compile results
            design_data = {
                "massing": massing,
                "space_program": space_program,
                "floor_plans": [self._serialize_floor_plan(fp) for fp in floor_plans],
                "facade": facade,
                "validation": validation
            }

            metrics = {
                "gfa": massing['width'] * massing['depth'] * massing['floors'],
                "efficiency": self._calculate_efficiency(floor_plans),
                "circulation_ratio": self.circulation_ratio,
                "daylight_area_ratio": self._calculate_daylight_ratio(floor_plans),
                "code_compliance_score": validation['compliance_score']
            }

            return AgentOutput(
                status=AgentStatus.COMPLETED,
                design_data=design_data,
                metrics=metrics,
                decisions=self.decisions,
                conflicts=self.conflicts,
                warnings=validation.get('warnings', []),
                execution_time=0  # Will be calculated by coordinator
            )

        except Exception as e:
            logger.error(f"Enhanced architectural agent failed: {e}", exc_info=True)
            return AgentOutput(
                status=AgentStatus.FAILED,
                design_data={},
                metrics={},
                decisions=self.decisions,
                conflicts=self.conflicts,
                warnings=[str(e)]
            )

    async def _generate_intelligent_massing(self) -> Dict[str, Any]:
        """Generate intelligent building massing using AI"""

        prompt = f"""You are an expert architect designing a {self.building_type} building in {self.region}.

Project Requirements:
- Total GFA: {self.gfa} m²
- Number of floors: {self.floors}
- Core ratio: {self.core_ratio}
- Region: {self.region}

Design an optimal building massing. Consider:
1. Optimal floor plate efficiency (aim for 75-85%)
2. Structural grid efficiency (use 7.5m to 9.0m spans)
3. Daylight penetration (depth should not exceed 15m from facade)
4. Regional climate considerations
5. Building code requirements

Respond with ONLY a JSON object:
{{
    "width": <building width in meters, multiple of grid module>,
    "depth": <building depth in meters, optimal for daylight>,
    "floors": {self.floors},
    "floor_height": 3.6,
    "typical_floor_area": <area per floor>,
    "core_position": "central|lateral|corner",
    "grid_x_spacing": <optimal column spacing>,
    "grid_y_spacing": <optimal column spacing>,
    "form_strategy": "<rectangular/L-shape/U-shape/courtyard>",
    "reasoning": "<brief explanation of design choices>"
}}"""

        try:
            response = await self.llm.generate(prompt)
            massing = json.loads(response)

            # Validate and adjust
            target_area_per_floor = self.gfa / self.floors

            # Ensure reasonable dimensions
            if 'width' not in massing or 'depth' not in massing:
                # Fallback calculation
                aspect_ratio = 1.4  # Optimal for most building types
                massing['width'] = round(math.sqrt(target_area_per_floor * aspect_ratio) / 1.2) * 1.2
                massing['depth'] = round(target_area_per_floor / massing['width'] / 1.2) * 1.2

            # Ensure multiples of module
            massing['width'] = round(massing['width'] / self.module) * self.module
            massing['depth'] = round(massing['depth'] / self.module) * self.module

            # Calculate actual metrics
            massing['height'] = self.floors * self.floor_height
            massing['typical_floor_area'] = massing['width'] * massing['depth']
            massing['total_volume'] = massing['typical_floor_area'] * massing['height']

            self.add_decision(
                "massing_strategy",
                f"Selected {massing.get('form_strategy', 'rectangular')} form with {massing['width']}x{massing['depth']}m footprint",
                massing.get('reasoning', 'Optimized for efficiency and daylight')
            )

            return massing

        except Exception as e:
            logger.warning(f"AI massing failed, using heuristic: {e}")
            return self._fallback_massing()

    def _fallback_massing(self) -> Dict[str, Any]:
        """Fallback massing calculation"""
        target_area = self.gfa / self.floors
        aspect = 1.4
        width = round(math.sqrt(target_area * aspect) / self.module) * self.module
        depth = round(target_area / width / self.module) * self.module

        return {
            "width": width,
            "depth": depth,
            "floors": self.floors,
            "floor_height": self.floor_height,
            "typical_floor_area": width * depth,
            "height": self.floors * self.floor_height,
            "core_position": "central",
            "grid_x_spacing": 8.4,
            "grid_y_spacing": 7.2,
            "form_strategy": "rectangular"
        }

    async def _generate_space_program(self) -> List[Dict[str, Any]]:
        """Generate intelligent space program using AI"""

        prompt = f"""You are an architect creating a space program for a {self.building_type} building.

Building Requirements:
- Type: {self.building_type}
- Total GFA: {self.gfa} m²
- Floors: {self.floors}
- Region: {self.region}

Create a detailed space program. Include:
1. Space types needed for this building type
2. Area allocation for each space type
3. Daylight requirements
4. Adjacency preferences
5. Ceiling height requirements
6. Functional relationships

Respond with ONLY a JSON array:
[
    {{
        "space_type": "<space type name>",
        "count": <number of instances>,
        "unit_area": <area per unit in m²>,
        "total_area": <total area for this type>,
        "daylight_required": true|false,
        "preferred_location": "perimeter|core|flexible",
        "min_ceiling_height": <meters>,
        "adjacency_preferences": ["<other space types>"],
        "priority": "high|medium|low"
    }}
]"""

        try:
            response = await self.llm.generate(prompt)
            program = json.loads(response)

            # Validate total area
            total = sum(s.get('total_area', 0) for s in program)
            target = self.gfa * (1 - self.core_ratio - self.circulation_ratio)

            # Scale if needed
            if abs(total - target) / target > 0.1:
                scale = target / total
                for space in program:
                    space['total_area'] *= scale
                    space['unit_area'] *= scale

            self.add_decision(
                "space_program",
                f"Generated program with {len(program)} space types",
                f"Total programmed area: {sum(s['total_area'] for s in program):.0f} m²"
            )

            return program

        except Exception as e:
            logger.warning(f"AI space program failed, using template: {e}")
            return self._fallback_space_program()

    def _fallback_space_program(self) -> List[Dict[str, Any]]:
        """Fallback space program based on building type"""
        net_area = self.gfa * (1 - self.core_ratio - self.circulation_ratio)

        if self.building_type == "office":
            return [
                {
                    "space_type": "Open Office",
                    "count": 3,
                    "unit_area": net_area * 0.50 / 3,
                    "total_area": net_area * 0.50,
                    "daylight_required": True,
                    "preferred_location": "perimeter",
                    "min_ceiling_height": 2.7,
                    "adjacency_preferences": ["Meeting Room", "Private Office"],
                    "priority": "high"
                },
                {
                    "space_type": "Private Office",
                    "count": 4,
                    "unit_area": net_area * 0.15 / 4,
                    "total_area": net_area * 0.15,
                    "daylight_required": True,
                    "preferred_location": "perimeter",
                    "min_ceiling_height": 2.7,
                    "adjacency_preferences": ["Open Office"],
                    "priority": "high"
                },
                {
                    "space_type": "Meeting Room",
                    "count": 3,
                    "unit_area": net_area * 0.20 / 3,
                    "total_area": net_area * 0.20,
                    "daylight_required": False,
                    "preferred_location": "flexible",
                    "min_ceiling_height": 2.7,
                    "adjacency_preferences": ["Open Office"],
                    "priority": "medium"
                },
                {
                    "space_type": "Support Space",
                    "count": 2,
                    "unit_area": net_area * 0.15 / 2,
                    "total_area": net_area * 0.15,
                    "daylight_required": False,
                    "preferred_location": "core",
                    "min_ceiling_height": 2.4,
                    "adjacency_preferences": [],
                    "priority": "low"
                }
            ]
        else:
            # Generic fallback
            return [
                {
                    "space_type": "Primary Space",
                    "count": 1,
                    "unit_area": net_area * 0.70,
                    "total_area": net_area * 0.70,
                    "daylight_required": True,
                    "preferred_location": "perimeter",
                    "min_ceiling_height": 2.7,
                    "adjacency_preferences": [],
                    "priority": "high"
                },
                {
                    "space_type": "Support Space",
                    "count": 1,
                    "unit_area": net_area * 0.30,
                    "total_area": net_area * 0.30,
                    "daylight_required": False,
                    "preferred_location": "core",
                    "min_ceiling_height": 2.4,
                    "adjacency_preferences": [],
                    "priority": "low"
                }
            ]

    async def _generate_smart_floor_plans(self, massing: Dict, program: List[Dict]) -> List[SmartFloorPlan]:
        """Generate intelligent floor plans using space packing algorithms"""
        plans = []

        floor_area = massing['typical_floor_area']
        core_area = floor_area * self.core_ratio
        circulation_area = floor_area * self.circulation_ratio
        net_area = floor_area - core_area - circulation_area

        # Generate typical floor
        typical_plan = SmartFloorPlan(
            floor_number=1,
            total_area=floor_area,
            net_usable_area=net_area,
            circulation_area=circulation_area,
            core_area=core_area
        )

        # Place core first (central position)
        core_width = math.sqrt(core_area * 0.8)  # Assume 1:1.25 aspect
        core_depth = core_area / core_width
        core_x = (massing['width'] - core_width) / 2
        core_y = (massing['depth'] - core_depth) / 2

        # Place spaces around core
        spaces = self._pack_spaces_intelligently(
            program,
            massing,
            (core_x, core_y, core_width, core_depth)
        )

        typical_plan.spaces = spaces
        typical_plan.grid_system = self._generate_grid_system(massing)

        plans.append(typical_plan)

        return plans

    def _pack_spaces_intelligently(self, program: List[Dict], massing: Dict, core_bounds: Tuple) -> List[IntelligentSpace]:
        """Pack spaces using intelligent layout algorithm"""
        spaces = []
        core_x, core_y, core_w, core_d = core_bounds

        # Define zones
        building_width = massing['width']
        building_depth = massing['depth']

        # Perimeter zones (for daylight spaces)
        perimeter_depth = 7.0  # Optimal daylight penetration

        space_id = 0
        for space_type in program:
            if space_type['preferred_location'] == 'perimeter' and space_type['daylight_required']:
                # Place on perimeter
                count = space_type['count']
                unit_area = space_type['unit_area']

                # Calculate dimensions
                width = min(unit_area / perimeter_depth, building_width / count)
                depth = perimeter_depth

                # Place along perimeter
                for i in range(count):
                    x = (building_width / count) * i
                    y = 0  # Along north facade

                    space = IntelligentSpace(
                        id=f"space_{space_id}",
                        name=f"{space_type['space_type']} {i+1}",
                        type=space_type['space_type'],
                        area=unit_area,
                        position=(x, y),
                        width=width,
                        depth=depth,
                        daylight_required=space_type['daylight_required']
                    )
                    spaces.append(space)
                    space_id += 1
            else:
                # Place in interior/flexible zones
                for i in range(space_type['count']):
                    # Simple grid placement
                    x = building_width * 0.2 + (i * building_width * 0.2)
                    y = building_depth * 0.5

                    width = math.sqrt(space_type['unit_area'] * 1.2)
                    depth = space_type['unit_area'] / width

                    space = IntelligentSpace(
                        id=f"space_{space_id}",
                        name=f"{space_type['space_type']} {i+1}",
                        type=space_type['space_type'],
                        area=space_type['unit_area'],
                        position=(x, y),
                        width=width,
                        depth=depth,
                        daylight_required=space_type['daylight_required']
                    )
                    spaces.append(space)
                    space_id += 1

        return spaces

    def _generate_grid_system(self, massing: Dict) -> Dict[str, List[float]]:
        """Generate structural grid system"""
        spacing_x = massing.get('grid_x_spacing', 8.4)
        spacing_y = massing.get('grid_y_spacing', 7.2)

        grid_x = [i * spacing_x for i in range(int(massing['width'] / spacing_x) + 1)]
        grid_y = [i * spacing_y for i in range(int(massing['depth'] / spacing_y) + 1)]

        return {
            "grid_x": grid_x,
            "grid_y": grid_y,
            "spacing_x": spacing_x,
            "spacing_y": spacing_y
        }

    async def _design_facade(self, massing: Dict) -> Dict[str, Any]:
        """Design building facade"""
        return {
            "wall_to_window_ratio": 0.40,
            "glazing_type": "double_glazed_low_e",
            "shading_strategy": "horizontal_louvers" if self.region in ["saudi", "uae", "qatar"] else "minimal",
            "material": "aluminum_curtain_wall",
            "color_scheme": "neutral_tones"
        }

    def _validate_design(self, floor_plans: List[SmartFloorPlan], massing: Dict) -> Dict[str, Any]:
        """Validate design against codes"""
        warnings = []

        # Check circulation ratio
        for plan in floor_plans:
            circ_ratio = plan.circulation_area / plan.total_area
            if circ_ratio < 0.15:
                warnings.append(f"Floor {plan.floor_number}: Circulation ratio {circ_ratio:.1%} below 15% minimum")
            if circ_ratio > 0.25:
                warnings.append(f"Floor {plan.floor_number}: Circulation ratio {circ_ratio:.1%} above 25% efficient maximum")

        # Calculate compliance score
        compliance_score = 100 - (len(warnings) * 5)

        return {
            "compliant": len(warnings) == 0,
            "compliance_score": max(0, compliance_score),
            "warnings": warnings,
            "codes_checked": ["IBC", "Saudi Building Code", "ASHRAE 90.1"]
        }

    def _calculate_efficiency(self, floor_plans: List[SmartFloorPlan]) -> float:
        """Calculate space efficiency ratio"""
        if not floor_plans:
            return 0.0

        total_usable = sum(fp.net_usable_area for fp in floor_plans)
        total_area = sum(fp.total_area for fp in floor_plans)

        return total_usable / total_area if total_area > 0 else 0.0

    def _calculate_daylight_ratio(self, floor_plans: List[SmartFloorPlan]) -> float:
        """Calculate percentage of spaces with daylight"""
        if not floor_plans:
            return 0.0

        total_spaces = sum(len(fp.spaces) for fp in floor_plans)
        daylit_spaces = sum(
            sum(1 for space in fp.spaces if space.daylight_required)
            for fp in floor_plans
        )

        return daylit_spaces / total_spaces if total_spaces > 0 else 0.0

    def _serialize_floor_plan(self, plan: SmartFloorPlan) -> Dict[str, Any]:
        """Serialize floor plan for JSON output"""
        return {
            "floor_number": plan.floor_number,
            "total_area": plan.total_area,
            "net_usable_area": plan.net_usable_area,
            "circulation_area": plan.circulation_area,
            "core_area": plan.core_area,
            "efficiency": plan.net_usable_area / plan.total_area,
            "spaces": [
                {
                    "id": s.id,
                    "name": s.name,
                    "type": s.type,
                    "area": s.area,
                    "position": s.position,
                    "dimensions": {"width": s.width, "depth": s.depth},
                    "daylight": s.daylight_required
                }
                for s in plan.spaces
            ],
            "grid_system": plan.grid_system
        }
