"""
Architectural Design Agent
==========================
Autonomous agent for architectural design generation.
Generates floor plans, massing, facades, and spatial layouts.
"""

import logging
import math
import uuid
from typing import Any, Dict, List, Optional, Tuple
from dataclasses import dataclass, field

try:
    from shapely.geometry import Polygon, Point, box, LineString
    from shapely.ops import unary_union
    from shapely.affinity import translate, rotate
    SHAPELY_AVAILABLE = True
except ImportError:
    SHAPELY_AVAILABLE = False

try:
    import networkx as nx
    NETWORKX_AVAILABLE = True
except ImportError:
    NETWORKX_AVAILABLE = False

import numpy as np

from .base_agent import (
    BaseDesignAgent, AgentOutput, AgentStatus,
    Conflict, ConflictType, ConflictPriority
)

logger = logging.getLogger(__name__)


# ============================================================================
# Data Structures
# ============================================================================

@dataclass
class Space:
    """Represents an architectural space"""
    id: str
    name: str
    type: str  # office, meeting, lobby, service, circulation, etc.
    area: float  # m²
    min_dimension: float = 3.0  # minimum width/depth
    requires_daylight: bool = False
    requires_adjacency: List[str] = field(default_factory=list)
    avoid_adjacency: List[str] = field(default_factory=list)
    floor_level: int = 0
    is_core: bool = False
    bounds: Optional[Dict[str, float]] = None
    polygon: Any = None  # Shapely polygon


@dataclass
class BuildingCore:
    """Building core (elevators, stairs, services)"""
    id: str
    position: Tuple[float, float]
    width: float
    depth: float
    elevators: int = 2
    stairs: int = 2
    services: List[str] = field(default_factory=list)


@dataclass
class FloorPlan:
    """Complete floor plan representation"""
    floor_level: int
    width: float
    depth: float
    height: float = 3.6  # floor-to-floor
    core: BuildingCore = None
    spaces: List[Space] = field(default_factory=list)
    circulation: List[Dict[str, Any]] = field(default_factory=list)
    grid_x: List[float] = field(default_factory=list)
    grid_y: List[float] = field(default_factory=list)
    perimeter: Any = None  # Shapely polygon


@dataclass
class BuildingMassing:
    """3D building massing"""
    width: float
    depth: float
    height: float
    floors: int
    floor_height: float = 3.6
    setbacks: List[Dict[str, Any]] = field(default_factory=list)
    orientation: float = 0  # degrees from north
    form_type: str = "rectangular"  # rectangular, L-shape, U-shape, tower


# ============================================================================
# Space Programs
# ============================================================================

SPACE_PROGRAMS = {
    "office": {
        "typical_floor": [
            {"type": "open_office", "ratio": 0.55, "daylight": True},
            {"type": "private_office", "ratio": 0.10, "daylight": True},
            {"type": "meeting_room", "ratio": 0.10, "daylight": False},
            {"type": "support", "ratio": 0.05, "daylight": False},
            {"type": "circulation", "ratio": 0.15, "daylight": False},
            {"type": "core", "ratio": 0.05, "daylight": False},
        ],
        "ground_floor": [
            {"type": "lobby", "ratio": 0.30, "daylight": True},
            {"type": "retail", "ratio": 0.20, "daylight": True},
            {"type": "service", "ratio": 0.15, "daylight": False},
            {"type": "circulation", "ratio": 0.20, "daylight": False},
            {"type": "core", "ratio": 0.15, "daylight": False},
        ]
    },
    "residential": {
        "typical_floor": [
            {"type": "apartment", "ratio": 0.75, "daylight": True},
            {"type": "corridor", "ratio": 0.10, "daylight": False},
            {"type": "core", "ratio": 0.10, "daylight": False},
            {"type": "service", "ratio": 0.05, "daylight": False},
        ]
    },
    "mixed_use": {
        "ground_floor": [
            {"type": "retail", "ratio": 0.50, "daylight": True},
            {"type": "lobby", "ratio": 0.20, "daylight": True},
            {"type": "service", "ratio": 0.15, "daylight": False},
            {"type": "core", "ratio": 0.15, "daylight": False},
        ],
        "typical_floor": [
            {"type": "office", "ratio": 0.60, "daylight": True},
            {"type": "meeting", "ratio": 0.10, "daylight": False},
            {"type": "circulation", "ratio": 0.15, "daylight": False},
            {"type": "core", "ratio": 0.10, "daylight": False},
            {"type": "service", "ratio": 0.05, "daylight": False},
        ]
    },
    "hotel": {
        "ground_floor": [
            {"type": "lobby", "ratio": 0.35, "daylight": True},
            {"type": "restaurant", "ratio": 0.25, "daylight": True},
            {"type": "service", "ratio": 0.20, "daylight": False},
            {"type": "core", "ratio": 0.20, "daylight": False},
        ],
        "typical_floor": [
            {"type": "guest_room", "ratio": 0.70, "daylight": True},
            {"type": "corridor", "ratio": 0.15, "daylight": False},
            {"type": "core", "ratio": 0.10, "daylight": False},
            {"type": "service", "ratio": 0.05, "daylight": False},
        ]
    }
}

# ============================================================================
# Building Code Requirements
# ============================================================================

BUILDING_CODES = {
    "saudi": {
        "min_corridor_width": 1.5,  # meters
        "max_travel_distance": 30,  # meters to exit
        "min_ceiling_height": 2.7,
        "min_window_area_ratio": 0.10,
        "max_floor_area_ratio": 3.5,
        "setback_front": 5.0,
        "setback_side": 3.0,
    },
    "uae": {
        "min_corridor_width": 1.8,
        "max_travel_distance": 35,
        "min_ceiling_height": 2.8,
        "min_window_area_ratio": 0.12,
        "max_floor_area_ratio": 4.0,
        "setback_front": 6.0,
        "setback_side": 3.0,
    },
    "qatar": {
        "min_corridor_width": 1.5,
        "max_travel_distance": 30,
        "min_ceiling_height": 2.7,
        "min_window_area_ratio": 0.10,
        "max_floor_area_ratio": 3.0,
        "setback_front": 5.0,
        "setback_side": 2.5,
    },
    "international": {
        "min_corridor_width": 1.2,
        "max_travel_distance": 45,
        "min_ceiling_height": 2.4,
        "min_window_area_ratio": 0.08,
        "max_floor_area_ratio": 5.0,
        "setback_front": 3.0,
        "setback_side": 2.0,
    }
}


# ============================================================================
# Floor Plan Generator
# ============================================================================

class FloorPlanGenerator:
    """Generates optimized floor plans using graph-based space planning"""

    def __init__(self, building_program: Dict[str, Any], constraints: Dict[str, Any]):
        self.program = building_program
        self.constraints = constraints
        self.code = BUILDING_CODES.get(
            constraints.get("region", "international"),
            BUILDING_CODES["international"]
        )

    def generate(self, floor_area: float, floor_level: int = 0) -> FloorPlan:
        """
        Generate an optimized floor plan.

        Args:
            floor_area: Total floor area in m²
            floor_level: Floor level (0 = ground)

        Returns:
            Generated FloorPlan
        """
        # Determine floor dimensions
        aspect_ratio = self.constraints.get("aspect_ratio", 1.3)
        width = math.sqrt(floor_area * aspect_ratio)
        depth = floor_area / width

        # Create structural grid
        grid_module = self.constraints.get("grid_module", 8.4)
        grid_x = self._create_grid(width, grid_module)
        grid_y = self._create_grid(depth, grid_module)

        # Create floor plan
        plan = FloorPlan(
            floor_level=floor_level,
            width=width,
            depth=depth,
            grid_x=grid_x,
            grid_y=grid_y
        )

        # Create perimeter
        if SHAPELY_AVAILABLE:
            plan.perimeter = box(0, 0, width, depth)

        # Place core
        plan.core = self._place_core(plan)

        # Generate spaces
        plan.spaces = self._distribute_spaces(plan, floor_level)

        # Create circulation
        plan.circulation = self._create_circulation(plan)

        return plan

    def _create_grid(self, dimension: float, module: float) -> List[float]:
        """Create structural grid lines"""
        num_bays = max(2, int(dimension / module))
        actual_module = dimension / num_bays
        return [i * actual_module for i in range(num_bays + 1)]

    def _place_core(self, plan: FloorPlan) -> BuildingCore:
        """Place building core optimally"""
        # Core typically 10-15% of floor area
        core_ratio = self.constraints.get("core_ratio", 0.12)
        core_area = plan.width * plan.depth * core_ratio

        # Core dimensions (roughly square)
        core_width = math.sqrt(core_area * 0.8)  # slightly wider
        core_depth = core_area / core_width

        # Position core (center or offset based on building type)
        building_type = self.program.get("type", "office")

        if building_type in ["residential", "hotel"]:
            # Center core for residential
            pos_x = (plan.width - core_width) / 2
            pos_y = (plan.depth - core_depth) / 2
        else:
            # Offset core for offices (better daylight)
            pos_x = (plan.width - core_width) / 2
            pos_y = plan.depth * 0.4  # offset towards back

        # Calculate elevator and stair count based on floor area
        floors = self.constraints.get("floors", 10)
        elevators = max(2, int(plan.width * plan.depth * floors / 10000))
        stairs = max(2, int(plan.width * plan.depth / 500))  # 1 per 500m²

        return BuildingCore(
            id=f"core_{plan.floor_level}",
            position=(pos_x, pos_y),
            width=core_width,
            depth=core_depth,
            elevators=elevators,
            stairs=stairs,
            services=["electrical", "plumbing", "hvac_shaft"]
        )

    def _distribute_spaces(self, plan: FloorPlan, floor_level: int) -> List[Space]:
        """Distribute spaces on floor plan using optimization"""
        spaces = []
        building_type = self.program.get("type", "office")

        # Get space program for this floor type
        program_key = "ground_floor" if floor_level == 0 else "typical_floor"
        space_program = SPACE_PROGRAMS.get(building_type, SPACE_PROGRAMS["office"])
        floor_program = space_program.get(program_key, space_program.get("typical_floor", []))

        # Calculate available area (excluding core)
        total_area = plan.width * plan.depth
        core_area = plan.core.width * plan.core.depth if plan.core else 0
        available_area = total_area - core_area

        # Create available region
        if SHAPELY_AVAILABLE and plan.perimeter:
            core_box = box(
                plan.core.position[0],
                plan.core.position[1],
                plan.core.position[0] + plan.core.width,
                plan.core.position[1] + plan.core.depth
            )
            available_region = plan.perimeter.difference(core_box)
        else:
            available_region = None

        # Distribute spaces
        current_x = 0
        current_y = 0
        row_height = 0

        for i, space_def in enumerate(floor_program):
            space_type = space_def["type"]
            space_ratio = space_def["ratio"]
            space_area = available_area * space_ratio
            requires_daylight = space_def.get("daylight", False)

            # Calculate space dimensions
            if requires_daylight:
                # Daylight spaces need perimeter access
                space_depth = min(12.0, math.sqrt(space_area))  # max 12m from facade
                space_width = space_area / space_depth
            else:
                # Interior spaces can be deeper
                space_width = math.sqrt(space_area * 1.2)
                space_depth = space_area / space_width

            # Position space
            if requires_daylight:
                # Place on perimeter
                if current_x + space_width > plan.width:
                    current_x = 0
                    current_y += row_height
                    row_height = 0

                pos_x = current_x
                pos_y = 0 if i % 2 == 0 else plan.depth - space_depth
            else:
                # Place interior
                pos_x = plan.core.position[0] + plan.core.width + 2
                pos_y = current_y

            # Create space
            space = Space(
                id=f"space_{floor_level}_{i}",
                name=f"{space_type}_{i}",
                type=space_type,
                area=space_area,
                requires_daylight=requires_daylight,
                floor_level=floor_level,
                bounds={
                    "min_x": pos_x,
                    "max_x": pos_x + space_width,
                    "min_y": pos_y,
                    "max_y": pos_y + space_depth
                }
            )

            if SHAPELY_AVAILABLE:
                space.polygon = box(pos_x, pos_y, pos_x + space_width, pos_y + space_depth)

            spaces.append(space)

            # Update position
            current_x += space_width
            row_height = max(row_height, space_depth)

        return spaces

    def _create_circulation(self, plan: FloorPlan) -> List[Dict[str, Any]]:
        """Create circulation paths"""
        circulation = []
        corridor_width = self.code["min_corridor_width"]

        # Main corridor along core
        if plan.core:
            main_corridor = {
                "id": f"corridor_main_{plan.floor_level}",
                "type": "main_corridor",
                "width": corridor_width,
                "path": [
                    {"x": 0, "y": plan.core.position[1] + plan.core.depth / 2},
                    {"x": plan.width, "y": plan.core.position[1] + plan.core.depth / 2}
                ],
                "length": plan.width
            }
            circulation.append(main_corridor)

        # Secondary corridors to perimeter
        for i, grid_x in enumerate(plan.grid_x[1:-1], 1):
            secondary = {
                "id": f"corridor_secondary_{plan.floor_level}_{i}",
                "type": "secondary_corridor",
                "width": corridor_width * 0.8,
                "path": [
                    {"x": grid_x, "y": 0},
                    {"x": grid_x, "y": plan.depth}
                ],
                "length": plan.depth
            }
            circulation.append(secondary)

        return circulation


# ============================================================================
# Facade Generator
# ============================================================================

class FacadeGenerator:
    """Generates facade designs based on orientation and climate"""

    def __init__(self, climate: str, building_type: str):
        self.climate = climate
        self.building_type = building_type

    def generate(self, massing: BuildingMassing) -> Dict[str, Any]:
        """Generate facade design for all orientations"""
        facades = {}

        # Define facade properties for each orientation
        orientations = ["north", "south", "east", "west"]

        for orientation in orientations:
            facades[orientation] = self._design_facade(
                massing, orientation
            )

        return {
            "facades": facades,
            "materials": self._select_materials(),
            "openings": self._calculate_openings(massing),
            "shading": self._design_shading(massing)
        }

    def _design_facade(self, massing: BuildingMassing, orientation: str) -> Dict[str, Any]:
        """Design facade for specific orientation"""
        # Window-to-wall ratio based on orientation and climate
        wwr_map = {
            "hot_arid": {"north": 0.40, "south": 0.25, "east": 0.20, "west": 0.20},
            "hot_humid": {"north": 0.35, "south": 0.30, "east": 0.25, "west": 0.25},
            "temperate": {"north": 0.45, "south": 0.50, "east": 0.35, "west": 0.35},
        }

        climate_type = self._get_climate_type()
        wwr = wwr_map.get(climate_type, wwr_map["temperate"])[orientation]

        # Calculate facade dimensions
        if orientation in ["north", "south"]:
            facade_width = massing.width
        else:
            facade_width = massing.depth

        facade_height = massing.height

        return {
            "orientation": orientation,
            "width": facade_width,
            "height": facade_height,
            "window_wall_ratio": wwr,
            "grid_module": 1.5,  # curtain wall module
            "spandrel_height": 0.9,
            "vision_glass_height": massing.floor_height - 0.9 - 0.3,
            "mullion_width": 0.05
        }

    def _get_climate_type(self) -> str:
        """Map region to climate type"""
        climate_map = {
            "saudi": "hot_arid",
            "uae": "hot_arid",
            "qatar": "hot_arid",
            "egypt": "hot_arid",
            "jordan": "hot_arid",
            "international": "temperate"
        }
        return climate_map.get(self.climate.lower(), "temperate")

    def _select_materials(self) -> Dict[str, Any]:
        """Select facade materials"""
        climate_type = self._get_climate_type()

        if climate_type == "hot_arid":
            return {
                "primary": "high_performance_glass",
                "secondary": "aluminum_composite",
                "accent": "stone_cladding",
                "glass_type": "double_glazed_low_e",
                "u_value": 1.8,
                "shgc": 0.25
            }
        else:
            return {
                "primary": "curtain_wall_glass",
                "secondary": "metal_panel",
                "accent": "fiber_cement",
                "glass_type": "double_glazed",
                "u_value": 2.2,
                "shgc": 0.35
            }

    def _calculate_openings(self, massing: BuildingMassing) -> List[Dict[str, Any]]:
        """Calculate window openings"""
        openings = []

        for floor in range(massing.floors):
            floor_z = floor * massing.floor_height

            # Create openings on each facade
            for orientation in ["north", "south", "east", "west"]:
                if orientation in ["north", "south"]:
                    num_openings = int(massing.width / 1.5)  # 1.5m module
                else:
                    num_openings = int(massing.depth / 1.5)

                for i in range(num_openings):
                    openings.append({
                        "id": f"opening_{floor}_{orientation}_{i}",
                        "floor": floor,
                        "orientation": orientation,
                        "position_z": floor_z + 0.9,  # sill height
                        "width": 1.4,
                        "height": 2.1,
                        "type": "vision_glass"
                    })

        return openings

    def _design_shading(self, massing: BuildingMassing) -> Dict[str, Any]:
        """Design shading devices"""
        climate_type = self._get_climate_type()

        if climate_type == "hot_arid":
            return {
                "type": "external_louvers",
                "material": "aluminum",
                "south": {"projection": 1.2, "spacing": 0.3, "angle": 45},
                "east": {"projection": 0.8, "spacing": 0.3, "angle": 30},
                "west": {"projection": 0.8, "spacing": 0.3, "angle": 30},
                "north": None  # No shading needed
            }
        else:
            return {
                "type": "internal_blinds",
                "south": {"type": "roller_blind"},
                "east": {"type": "roller_blind"},
                "west": {"type": "roller_blind"},
                "north": None
            }


# ============================================================================
# Architectural Agent
# ============================================================================

class ArchitecturalAgent(BaseDesignAgent):
    """
    Autonomous agent for architectural design.

    Capabilities:
    - Floor plan generation
    - Building massing
    - Facade design
    - Space optimization
    - Code compliance checking
    """

    @property
    def domain(self) -> str:
        return "architectural"

    @property
    def dependencies(self) -> List[str]:
        return []  # Architectural agent has no dependencies

    def __init__(self, llm_client: Any, project_context: Dict[str, Any], config: Dict[str, Any] = None):
        super().__init__("architectural", llm_client, project_context, config)

        self.floor_plan_generator = None
        self.facade_generator = None

    async def analyze(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze project requirements and constraints"""
        logger.info("[Architectural] Analyzing project requirements...")

        # Extract key parameters
        gfa = self.context.get("gfa", 10000)
        floors = self.context.get("floors", 10)
        building_type = self.context.get("building_type", "office")
        region = self.context.get("region", "international")

        # Calculate derived parameters
        floor_area = gfa / floors
        aspect_ratio = self._calculate_optimal_aspect_ratio(building_type, floor_area)

        # Determine code requirements
        code = BUILDING_CODES.get(region.lower(), BUILDING_CODES["international"])

        # Use LLM for design recommendations
        llm_analysis = await self._get_llm_analysis(inputs)

        analysis = {
            "requirements": {
                "total_gfa": gfa,
                "floors": floors,
                "floor_area": floor_area,
                "building_type": building_type,
                "region": region
            },
            "constraints": {
                "aspect_ratio": aspect_ratio,
                "core_ratio": self.context.get("core_ratio", 0.12),
                "grid_module": self._calculate_grid_module(building_type, floor_area),
                "floor_height": 3.6 if floors <= 20 else 3.3,
                "code": code
            },
            "opportunities": {
                "daylight_optimization": True,
                "view_maximization": region in ["uae", "qatar"],
                "flexibility": building_type == "office"
            },
            "llm_recommendations": llm_analysis
        }

        self.log_decision(
            "analysis_complete",
            f"Analyzed {building_type} building with {gfa}m² GFA",
            confidence=0.9
        )

        return analysis

    async def design(self, analysis: Dict[str, Any], constraints: Dict[str, Any]) -> Dict[str, Any]:
        """Generate architectural design"""
        logger.info("[Architectural] Generating design...")

        requirements = analysis["requirements"]
        design_constraints = {**analysis["constraints"], **constraints}

        # Initialize generators
        self.floor_plan_generator = FloorPlanGenerator(
            {"type": requirements["building_type"]},
            design_constraints
        )
        self.facade_generator = FacadeGenerator(
            requirements["region"],
            requirements["building_type"]
        )

        # Generate building massing
        massing = self._generate_massing(requirements, design_constraints)

        # Generate floor plans
        floor_plans = []
        for floor in range(requirements["floors"]):
            plan = self.floor_plan_generator.generate(
                requirements["floor_area"],
                floor
            )
            floor_plans.append(self._serialize_floor_plan(plan))

        # Generate facades
        facade_design = self.facade_generator.generate(massing)

        # Compile design output
        design = {
            "massing": {
                "width": massing.width,
                "depth": massing.depth,
                "height": massing.height,
                "floors": massing.floors,
                "floor_height": massing.floor_height,
                "form_type": massing.form_type,
                "orientation": massing.orientation
            },
            "floor_plans": floor_plans,
            "facades": facade_design,
            "spaces": self._aggregate_spaces(floor_plans),
            "circulation": self._aggregate_circulation(floor_plans),
            "geometry": self._generate_geometry(massing, floor_plans),
            "metrics": self._calculate_metrics(massing, floor_plans)
        }

        self.log_decision(
            "design_generated",
            f"Generated {len(floor_plans)} floor plans with {massing.form_type} massing",
            confidence=0.85
        )

        return design

    async def validate(self, design: Dict[str, Any]) -> Tuple[bool, List[str]]:
        """Validate design against requirements and codes"""
        logger.info("[Architectural] Validating design...")
        issues = []

        region = self.context.get("region", "international").lower()
        code = BUILDING_CODES.get(region, BUILDING_CODES["international"])

        # Check floor area ratio
        massing = design.get("massing", {})
        site_area = self.context.get("site_area", massing["width"] * massing["depth"] * 2)
        far = (massing["width"] * massing["depth"] * massing["floors"]) / site_area

        if far > code["max_floor_area_ratio"]:
            issues.append(f"Floor Area Ratio ({far:.2f}) exceeds maximum ({code['max_floor_area_ratio']})")

        # Check circulation widths
        for floor_plan in design.get("floor_plans", []):
            for corridor in floor_plan.get("circulation", []):
                if corridor.get("width", 0) < code["min_corridor_width"]:
                    issues.append(
                        f"Corridor {corridor.get('id')} width ({corridor.get('width')}m) "
                        f"below minimum ({code['min_corridor_width']}m)"
                    )

        # Check travel distance
        max_travel = design.get("metrics", {}).get("max_travel_distance", 0)
        if max_travel > code["max_travel_distance"]:
            issues.append(
                f"Max travel distance ({max_travel:.1f}m) exceeds code ({code['max_travel_distance']}m)"
            )

        # Check daylight
        for space in design.get("spaces", []):
            if space.get("requires_daylight") and not space.get("has_window"):
                issues.append(f"Space {space.get('id')} requires daylight but has no window access")

        is_valid = len(issues) == 0
        self.log_decision(
            "validation_complete",
            f"Validation {'passed' if is_valid else 'failed'} with {len(issues)} issues",
            confidence=0.9 if is_valid else 0.7
        )

        return is_valid, issues

    async def optimize(self, design: Dict[str, Any], objectives: List[str]) -> Dict[str, Any]:
        """Optimize design for given objectives"""
        logger.info(f"[Architectural] Optimizing for: {objectives}")

        optimized = design.copy()

        for objective in objectives:
            if objective == "efficiency":
                optimized = self._optimize_efficiency(optimized)
            elif objective == "daylight":
                optimized = self._optimize_daylight(optimized)
            elif objective == "cost":
                optimized = self._optimize_cost(optimized)
            elif objective == "flexibility":
                optimized = self._optimize_flexibility(optimized)

        # Recalculate metrics
        optimized["metrics"] = self._calculate_metrics(
            BuildingMassing(**design["massing"]) if isinstance(design["massing"], dict)
            else design["massing"],
            optimized["floor_plans"]
        )

        self.log_decision(
            "optimization_complete",
            f"Optimized design for {', '.join(objectives)}",
            confidence=0.8
        )

        return optimized

    # ========================================================================
    # Helper Methods
    # ========================================================================

    def _calculate_optimal_aspect_ratio(self, building_type: str, floor_area: float) -> float:
        """Calculate optimal aspect ratio based on building type"""
        base_ratios = {
            "office": 1.3,
            "residential": 1.5,
            "hotel": 1.4,
            "mixed_use": 1.35,
            "retail": 1.8
        }
        base = base_ratios.get(building_type, 1.3)

        # Adjust for floor area (larger floors tend to be more square)
        if floor_area > 2000:
            base *= 0.9
        elif floor_area < 500:
            base *= 1.1

        return base

    def _calculate_grid_module(self, building_type: str, floor_area: float) -> float:
        """Calculate optimal structural grid module"""
        base_modules = {
            "office": 8.4,
            "residential": 6.0,
            "hotel": 7.2,
            "mixed_use": 8.0,
            "retail": 9.0
        }
        return base_modules.get(building_type, 8.0)

    def _generate_massing(self, requirements: Dict, constraints: Dict) -> BuildingMassing:
        """Generate building massing"""
        floor_area = requirements["floor_area"]
        aspect_ratio = constraints["aspect_ratio"]

        width = math.sqrt(floor_area * aspect_ratio)
        depth = floor_area / width
        height = requirements["floors"] * constraints["floor_height"]

        return BuildingMassing(
            width=width,
            depth=depth,
            height=height,
            floors=requirements["floors"],
            floor_height=constraints["floor_height"],
            form_type="rectangular",
            orientation=0
        )

    def _serialize_floor_plan(self, plan: FloorPlan) -> Dict[str, Any]:
        """Serialize floor plan to dictionary"""
        return {
            "floor_level": plan.floor_level,
            "width": plan.width,
            "depth": plan.depth,
            "height": plan.height,
            "core": {
                "id": plan.core.id,
                "position": plan.core.position,
                "width": plan.core.width,
                "depth": plan.core.depth,
                "elevators": plan.core.elevators,
                "stairs": plan.core.stairs
            } if plan.core else None,
            "spaces": [
                {
                    "id": s.id,
                    "name": s.name,
                    "type": s.type,
                    "area": s.area,
                    "requires_daylight": s.requires_daylight,
                    "bounds": s.bounds
                }
                for s in plan.spaces
            ],
            "circulation": plan.circulation,
            "grid_x": plan.grid_x,
            "grid_y": plan.grid_y
        }

    def _aggregate_spaces(self, floor_plans: List[Dict]) -> List[Dict]:
        """Aggregate all spaces from floor plans"""
        all_spaces = []
        for plan in floor_plans:
            all_spaces.extend(plan.get("spaces", []))
        return all_spaces

    def _aggregate_circulation(self, floor_plans: List[Dict]) -> List[Dict]:
        """Aggregate circulation from floor plans"""
        all_circulation = []
        for plan in floor_plans:
            all_circulation.extend(plan.get("circulation", []))
        return all_circulation

    def _generate_geometry(self, massing: BuildingMassing, floor_plans: List[Dict]) -> Dict[str, Any]:
        """Generate 3D geometry data"""
        vertices = []
        faces = []

        # Building envelope vertices
        w, d, h = massing.width, massing.depth, massing.height

        # 8 corners of the building
        corners = [
            [0, 0, 0], [w, 0, 0], [w, d, 0], [0, d, 0],  # bottom
            [0, 0, h], [w, 0, h], [w, d, h], [0, d, h]   # top
        ]
        vertices.extend(corners)

        # 6 faces
        faces.extend([
            [0, 1, 2, 3],  # bottom
            [4, 5, 6, 7],  # top
            [0, 1, 5, 4],  # front
            [2, 3, 7, 6],  # back
            [0, 3, 7, 4],  # left
            [1, 2, 6, 5]   # right
        ])

        return {
            "type": "mesh",
            "vertices": vertices,
            "faces": faces,
            "bounds": {
                "min": [0, 0, 0],
                "max": [w, d, h]
            }
        }

    def _calculate_metrics(self, massing: BuildingMassing, floor_plans: List[Dict]) -> Dict[str, float]:
        """Calculate design metrics"""
        total_area = massing.width * massing.depth * massing.floors
        core_area = sum(
            p.get("core", {}).get("width", 0) * p.get("core", {}).get("depth", 0)
            for p in floor_plans
        )
        net_area = total_area - core_area

        # Calculate efficiency
        efficiency = (net_area / total_area) * 100 if total_area > 0 else 0

        # Estimate travel distance
        max_travel = max(massing.width, massing.depth) / 2

        # Facade area
        facade_area = 2 * (massing.width + massing.depth) * massing.height

        return {
            "gross_floor_area": total_area,
            "net_floor_area": net_area,
            "core_area": core_area,
            "efficiency_ratio": efficiency,
            "max_travel_distance": max_travel,
            "facade_area": facade_area,
            "floor_plate_area": massing.width * massing.depth,
            "building_volume": total_area * massing.floor_height
        }

    async def _get_llm_analysis(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """Get LLM recommendations for design"""
        if not self.llm:
            return {}

        prompt = f"""
        Analyze this architectural project and provide design recommendations:

        Project: {self.context.get('name', 'Untitled')}
        Building Type: {self.context.get('building_type', 'office')}
        GFA: {self.context.get('gfa', 10000)} m²
        Floors: {self.context.get('floors', 10)}
        Region: {self.context.get('region', 'international')}

        Provide recommendations in JSON:
        {{
            "form_recommendation": "rectangular|L-shape|U-shape|tower",
            "core_position": "center|offset|corner",
            "facade_strategy": "description",
            "special_considerations": ["list of considerations"],
            "estimated_efficiency": 0.0-1.0
        }}
        """

        try:
            response = await self.llm.generate(prompt)
            return {"llm_analysis": response}
        except Exception as e:
            logger.warning(f"LLM analysis failed: {e}")
            return {}

    def _optimize_efficiency(self, design: Dict) -> Dict:
        """Optimize for space efficiency"""
        # Reduce corridor widths to minimum
        for plan in design.get("floor_plans", []):
            for corridor in plan.get("circulation", []):
                if corridor.get("type") == "secondary_corridor":
                    corridor["width"] = 1.2  # minimum
        return design

    def _optimize_daylight(self, design: Dict) -> Dict:
        """Optimize for daylight access"""
        # Move daylight-requiring spaces to perimeter
        for plan in design.get("floor_plans", []):
            for space in plan.get("spaces", []):
                if space.get("requires_daylight"):
                    space["priority"] = "perimeter"
        return design

    def _optimize_cost(self, design: Dict) -> Dict:
        """Optimize for cost"""
        # Simplify facade
        if "facades" in design:
            design["facades"]["materials"]["primary"] = "standard_glass"
        return design

    def _optimize_flexibility(self, design: Dict) -> Dict:
        """Optimize for flexibility"""
        # Increase grid module for fewer columns
        for plan in design.get("floor_plans", []):
            if "grid_x" in plan:
                plan["grid_module_note"] = "Consider 9m grid for flexibility"
        return design
