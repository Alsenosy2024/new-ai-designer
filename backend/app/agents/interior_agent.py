"""
Interior Design Agent
=====================
Autonomous agent for interior design and space planning.
Designs furniture layouts, finishes, lighting, and FF&E.
"""

import logging
import math
from typing import Any, Dict, List, Optional, Tuple
from dataclasses import dataclass, field
from enum import Enum

import numpy as np

from .base_agent import (
    BaseDesignAgent, AgentOutput, AgentStatus,
    Conflict, ConflictType, ConflictPriority
)

logger = logging.getLogger(__name__)


# ============================================================================
# Enums and Constants
# ============================================================================

class DesignStyle(Enum):
    """Interior design styles"""
    MODERN = "modern"
    CONTEMPORARY = "contemporary"
    TRADITIONAL = "traditional"
    MINIMALIST = "minimalist"
    INDUSTRIAL = "industrial"
    BIOPHILIC = "biophilic"


class FinishGrade(Enum):
    """Finish quality grades"""
    ECONOMY = "economy"
    STANDARD = "standard"
    PREMIUM = "premium"
    LUXURY = "luxury"


# Furniture dimensions (L x W x H in meters)
FURNITURE_CATALOG = {
    "workstation": {
        "dimensions": (1.6, 0.8, 0.75),
        "clearance": (0.5, 1.2, 0),  # Front, sides, top
        "power": True,
        "data": True
    },
    "executive_desk": {
        "dimensions": (2.0, 1.0, 0.75),
        "clearance": (1.0, 1.0, 0),
        "power": True,
        "data": True
    },
    "meeting_table_4": {
        "dimensions": (1.2, 0.8, 0.75),
        "clearance": (1.0, 0.8, 0),
        "power": True,
        "data": False
    },
    "meeting_table_8": {
        "dimensions": (2.4, 1.2, 0.75),
        "clearance": (1.0, 0.8, 0),
        "power": True,
        "data": True
    },
    "meeting_table_12": {
        "dimensions": (3.6, 1.4, 0.75),
        "clearance": (1.0, 1.0, 0),
        "power": True,
        "data": True
    },
    "sofa_2seater": {
        "dimensions": (1.5, 0.8, 0.85),
        "clearance": (0.6, 0.3, 0),
        "power": False,
        "data": False
    },
    "sofa_3seater": {
        "dimensions": (2.2, 0.9, 0.85),
        "clearance": (0.6, 0.3, 0),
        "power": False,
        "data": False
    },
    "armchair": {
        "dimensions": (0.8, 0.8, 0.85),
        "clearance": (0.5, 0.3, 0),
        "power": False,
        "data": False
    },
    "office_chair": {
        "dimensions": (0.6, 0.6, 1.2),
        "clearance": (0.3, 0.3, 0),
        "power": False,
        "data": False
    },
    "filing_cabinet": {
        "dimensions": (0.5, 0.6, 1.3),
        "clearance": (0.8, 0.1, 0),
        "power": False,
        "data": False
    },
    "bookshelf": {
        "dimensions": (0.9, 0.35, 2.0),
        "clearance": (0.6, 0.1, 0.3),
        "power": False,
        "data": False
    },
    "reception_desk": {
        "dimensions": (3.0, 0.8, 1.1),
        "clearance": (1.5, 0.8, 0),
        "power": True,
        "data": True
    },
    "coffee_table": {
        "dimensions": (1.2, 0.6, 0.45),
        "clearance": (0.4, 0.4, 0),
        "power": False,
        "data": False
    },
    "side_table": {
        "dimensions": (0.5, 0.5, 0.55),
        "clearance": (0.2, 0.2, 0),
        "power": False,
        "data": False
    },
    "planter_large": {
        "dimensions": (0.6, 0.6, 1.2),
        "clearance": (0.3, 0.3, 0),
        "power": False,
        "data": False
    }
}

# Space layout templates
SPACE_TEMPLATES = {
    "open_office": {
        "furniture_density": 0.4,  # 40% of area for furniture
        "circulation": 0.25,
        "primary_furniture": ["workstation", "office_chair", "filing_cabinet"],
        "accent_furniture": ["planter_large", "bookshelf"]
    },
    "private_office": {
        "furniture_density": 0.35,
        "circulation": 0.30,
        "primary_furniture": ["executive_desk", "office_chair", "bookshelf"],
        "accent_furniture": ["sofa_2seater", "coffee_table", "planter_large"]
    },
    "meeting_room": {
        "furniture_density": 0.45,
        "circulation": 0.25,
        "primary_furniture": ["meeting_table_8", "office_chair"],
        "accent_furniture": ["credenza", "planter_large"]
    },
    "lobby": {
        "furniture_density": 0.25,
        "circulation": 0.40,
        "primary_furniture": ["reception_desk", "sofa_3seater", "armchair"],
        "accent_furniture": ["coffee_table", "planter_large", "side_table"]
    },
    "lounge": {
        "furniture_density": 0.30,
        "circulation": 0.35,
        "primary_furniture": ["sofa_3seater", "armchair", "coffee_table"],
        "accent_furniture": ["side_table", "planter_large", "bookshelf"]
    }
}

# Material palettes by style
MATERIAL_PALETTES = {
    DesignStyle.MODERN: {
        "flooring": ["porcelain_tile", "polished_concrete", "engineered_wood"],
        "walls": ["painted_drywall", "glass", "stone_cladding"],
        "ceiling": ["acoustic_panel", "exposed_slab", "metal_panel"],
        "accent_colors": ["#2C3E50", "#E74C3C", "#3498DB"],
        "neutral_colors": ["#FFFFFF", "#F5F5F5", "#333333"]
    },
    DesignStyle.MINIMALIST: {
        "flooring": ["light_oak", "white_terrazzo", "light_concrete"],
        "walls": ["white_paint", "light_wood_panel"],
        "ceiling": ["white_plaster", "concealed_grid"],
        "accent_colors": ["#000000", "#C0C0C0"],
        "neutral_colors": ["#FFFFFF", "#FAFAFA", "#F0F0F0"]
    },
    DesignStyle.BIOPHILIC: {
        "flooring": ["natural_wood", "cork", "natural_stone"],
        "walls": ["living_wall", "wood_panel", "natural_paint"],
        "ceiling": ["wood_slat", "exposed_timber"],
        "accent_colors": ["#2ECC71", "#27AE60", "#16A085"],
        "neutral_colors": ["#F5F0E6", "#E8DCC8", "#D4C5A9"]
    },
    DesignStyle.INDUSTRIAL: {
        "flooring": ["polished_concrete", "steel_plate", "reclaimed_wood"],
        "walls": ["exposed_brick", "raw_concrete", "metal_panel"],
        "ceiling": ["exposed_structure", "metal_deck"],
        "accent_colors": ["#E67E22", "#D35400", "#C0392B"],
        "neutral_colors": ["#7F8C8D", "#95A5A6", "#BDC3C7"]
    }
}


# ============================================================================
# Data Structures
# ============================================================================

@dataclass
class FurnitureItem:
    """Furniture placement"""
    id: str
    type: str
    position: Tuple[float, float]  # x, y
    rotation: float  # degrees
    dimensions: Tuple[float, float, float]  # l, w, h
    floor_level: int
    space_id: str


@dataclass
class FinishSchedule:
    """Finish schedule for a space"""
    space_id: str
    floor_finish: str
    wall_finish: str
    ceiling_finish: str
    ceiling_height: float
    skirting: str
    accent_wall: Optional[str] = None


@dataclass
class LightingFixture:
    """Lighting fixture"""
    id: str
    type: str  # recessed, pendant, track, wall
    position: Tuple[float, float, float]
    wattage: float
    lumens: float
    color_temp: int  # Kelvin
    dimming: bool


@dataclass
class InteriorLayout:
    """Complete interior layout for a space"""
    space_id: str
    furniture: List[FurnitureItem]
    finishes: FinishSchedule
    lighting: List[LightingFixture]
    power_points: List[Tuple[float, float]]
    data_points: List[Tuple[float, float]]


# ============================================================================
# Furniture Planner
# ============================================================================

class FurniturePlanner:
    """Plans furniture layouts"""

    def __init__(self, style: DesignStyle, grade: FinishGrade):
        self.style = style
        self.grade = grade

    def plan_layout(
        self,
        space: Dict,
        constraints: Dict = None
    ) -> List[FurnitureItem]:
        """Plan furniture layout for a space"""
        furniture = []
        constraints = constraints or {}

        space_type = space.get("type", "office")
        area = space.get("area", 50)
        bounds = space.get("bounds", {})

        template = SPACE_TEMPLATES.get(space_type, SPACE_TEMPLATES["open_office"])

        # Calculate available area
        furniture_area = area * template["furniture_density"]

        # Get space dimensions
        width = bounds.get("max_x", 10) - bounds.get("min_x", 0)
        depth = bounds.get("max_y", 10) - bounds.get("min_y", 0)
        origin_x = bounds.get("min_x", 0)
        origin_y = bounds.get("min_y", 0)

        # Place primary furniture
        current_x = origin_x + 1.0  # 1m from wall
        current_y = origin_y + 1.0

        for furniture_type in template["primary_furniture"]:
            if furniture_type not in FURNITURE_CATALOG:
                continue

            item_spec = FURNITURE_CATALOG[furniture_type]
            dims = item_spec["dimensions"]
            clearance = item_spec["clearance"]

            # Calculate how many can fit
            if space_type == "open_office" and furniture_type == "workstation":
                count = int(area / 8)  # 8m² per workstation
            else:
                count = 1

            for i in range(count):
                # Check if fits
                if current_x + dims[0] + clearance[1] > origin_x + width:
                    current_x = origin_x + 1.0
                    current_y += dims[1] + clearance[0] + 1.5

                if current_y + dims[1] > origin_y + depth:
                    break

                furniture.append(FurnitureItem(
                    id=f"{space.get('id', 'space')}_{furniture_type}_{i}",
                    type=furniture_type,
                    position=(current_x, current_y),
                    rotation=0,
                    dimensions=dims,
                    floor_level=space.get("floor_level", 0),
                    space_id=space.get("id", "")
                ))

                current_x += dims[0] + clearance[1] + 0.5

        # Add accent furniture
        for furniture_type in template.get("accent_furniture", [])[:2]:
            if furniture_type not in FURNITURE_CATALOG:
                continue

            item_spec = FURNITURE_CATALOG[furniture_type]
            dims = item_spec["dimensions"]

            # Place in corners or edges
            pos_x = origin_x + width - dims[0] - 0.3
            pos_y = origin_y + 0.3

            furniture.append(FurnitureItem(
                id=f"{space.get('id', 'space')}_{furniture_type}_accent",
                type=furniture_type,
                position=(pos_x, pos_y),
                rotation=0,
                dimensions=dims,
                floor_level=space.get("floor_level", 0),
                space_id=space.get("id", "")
            ))

        return furniture


# ============================================================================
# Finish Designer
# ============================================================================

class FinishDesigner:
    """Designs interior finishes"""

    def __init__(self, style: DesignStyle, grade: FinishGrade, region: str):
        self.style = style
        self.grade = grade
        self.region = region
        self.palette = MATERIAL_PALETTES.get(style, MATERIAL_PALETTES[DesignStyle.MODERN])

    def design_finishes(
        self,
        space: Dict,
        ceiling_height: float
    ) -> FinishSchedule:
        """Design finish schedule for a space"""
        space_type = space.get("type", "office")

        # Select finishes based on space type and grade
        floor_finish = self._select_floor_finish(space_type)
        wall_finish = self._select_wall_finish(space_type)
        ceiling_finish = self._select_ceiling_finish(space_type)
        skirting = self._select_skirting()

        # Accent wall for feature spaces
        accent_wall = None
        if space_type in ["lobby", "meeting_room", "executive_office"]:
            accent_wall = self._select_accent_material()

        return FinishSchedule(
            space_id=space.get("id", ""),
            floor_finish=floor_finish,
            wall_finish=wall_finish,
            ceiling_finish=ceiling_finish,
            ceiling_height=self._calculate_ceiling_height(space_type, ceiling_height),
            skirting=skirting,
            accent_wall=accent_wall
        )

    def _select_floor_finish(self, space_type: str) -> str:
        """Select floor finish"""
        flooring_options = self.palette["flooring"]

        if space_type in ["lobby", "corridor"]:
            return flooring_options[0]  # Premium option
        elif space_type in ["open_office", "meeting_room"]:
            return "carpet_tile"  # Acoustic requirement
        else:
            return flooring_options[-1]  # Standard option

    def _select_wall_finish(self, space_type: str) -> str:
        """Select wall finish"""
        wall_options = self.palette["walls"]

        if space_type == "lobby":
            return wall_options[0]  # Feature finish
        else:
            return "painted_drywall"

    def _select_ceiling_finish(self, space_type: str) -> str:
        """Select ceiling finish"""
        ceiling_options = self.palette["ceiling"]

        if space_type in ["open_office", "meeting_room"]:
            return "acoustic_panel"  # Acoustic requirement
        elif space_type == "lobby":
            return ceiling_options[0]
        else:
            return "painted_drywall"

    def _select_skirting(self) -> str:
        """Select skirting type"""
        if self.grade in [FinishGrade.PREMIUM, FinishGrade.LUXURY]:
            return "shadow_gap"
        else:
            return "mdf_painted"

    def _select_accent_material(self) -> str:
        """Select accent wall material"""
        if self.style == DesignStyle.BIOPHILIC:
            return "living_wall"
        elif self.style == DesignStyle.INDUSTRIAL:
            return "exposed_brick"
        else:
            return "wood_panel"

    def _calculate_ceiling_height(self, space_type: str, structural_height: float) -> float:
        """Calculate finished ceiling height"""
        plenum = 0.6  # MEP space

        if space_type == "lobby":
            return structural_height - 0.3  # Higher ceiling
        elif space_type in ["corridor", "service"]:
            return 2.7  # Minimum
        else:
            return structural_height - plenum


# ============================================================================
# Lighting Designer
# ============================================================================

class LightingDesigner:
    """Designs lighting layouts"""

    # Lux requirements by space type
    LUX_REQUIREMENTS = {
        "office": 500,
        "open_office": 500,
        "meeting_room": 400,
        "private_office": 500,
        "lobby": 300,
        "corridor": 150,
        "restroom": 200,
        "parking": 75
    }

    def design_lighting(
        self,
        space: Dict,
        ceiling_height: float
    ) -> List[LightingFixture]:
        """Design lighting for a space"""
        fixtures = []

        space_type = space.get("type", "office")
        area = space.get("area", 50)
        bounds = space.get("bounds", {})

        lux_required = self.LUX_REQUIREMENTS.get(space_type, 300)

        # Calculate total lumens needed
        # Lumens = Lux × Area × (1 / Utilization Factor × Maintenance Factor)
        utilization = 0.6
        maintenance = 0.8
        total_lumens = lux_required * area / (utilization * maintenance)

        # Select fixture type
        fixture_type, lumens_per_fixture, wattage = self._select_fixture_type(space_type)

        # Calculate fixture count
        fixture_count = math.ceil(total_lumens / lumens_per_fixture)

        # Layout fixtures in grid
        width = bounds.get("max_x", 10) - bounds.get("min_x", 0)
        depth = bounds.get("max_y", 10) - bounds.get("min_y", 0)
        origin_x = bounds.get("min_x", 0)
        origin_y = bounds.get("min_y", 0)

        # Grid layout
        cols = max(1, int(math.sqrt(fixture_count * width / depth)))
        rows = max(1, math.ceil(fixture_count / cols))

        spacing_x = width / (cols + 1)
        spacing_y = depth / (rows + 1)

        fixture_id = 0
        for row in range(rows):
            for col in range(cols):
                if fixture_id >= fixture_count:
                    break

                fixtures.append(LightingFixture(
                    id=f"{space.get('id', 'space')}_light_{fixture_id}",
                    type=fixture_type,
                    position=(
                        origin_x + spacing_x * (col + 1),
                        origin_y + spacing_y * (row + 1),
                        ceiling_height
                    ),
                    wattage=wattage,
                    lumens=lumens_per_fixture,
                    color_temp=4000,  # Neutral white
                    dimming=space_type in ["meeting_room", "lobby"]
                ))
                fixture_id += 1

        return fixtures

    def _select_fixture_type(self, space_type: str) -> Tuple[str, float, float]:
        """Select fixture type and specs"""
        if space_type in ["lobby"]:
            return ("pendant", 3000, 35)
        elif space_type in ["corridor"]:
            return ("linear", 2000, 25)
        elif space_type in ["meeting_room"]:
            return ("panel", 4000, 40)
        else:
            return ("recessed", 3500, 35)


# ============================================================================
# Interior Agent
# ============================================================================

class InteriorAgent(BaseDesignAgent):
    """
    Autonomous agent for interior design.

    Capabilities:
    - Furniture layout planning
    - Finish schedule design
    - Lighting design
    - Color and material palette
    - FF&E specification
    """

    @property
    def domain(self) -> str:
        return "interior"

    @property
    def dependencies(self) -> List[str]:
        return ["architectural", "mep"]

    def __init__(self, llm_client: Any, project_context: Dict[str, Any], config: Dict[str, Any] = None):
        super().__init__("interior", llm_client, project_context, config)

        self.furniture_planner = None
        self.finish_designer = None
        self.lighting_designer = None

    async def analyze(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze interior design requirements"""
        logger.info("[Interior] Analyzing requirements...")

        # Get dependencies
        arch_data = inputs.get("dependency_outputs", {}).get("architectural", {})
        mep_data = inputs.get("dependency_outputs", {}).get("mep", {})

        # Extract spaces
        spaces = arch_data.get("spaces", [])
        massing = arch_data.get("massing", {})
        floor_height = massing.get("floor_height", 3.6)

        # Get MEP constraints
        mep_zones = mep_data.get("hvac", {}).get("zones", [])

        # Determine design parameters
        building_type = self.context.get("building_type", "office")
        region = self.context.get("region", "international")
        budget = self.context.get("budget", "standard")

        # Select style and grade
        style = self._select_style(building_type, region)
        grade = self._select_grade(budget)

        # Initialize designers
        self.furniture_planner = FurniturePlanner(style, grade)
        self.finish_designer = FinishDesigner(style, grade, region)
        self.lighting_designer = LightingDesigner()

        analysis = {
            "spaces": spaces,
            "floor_height": floor_height,
            "style": style.value,
            "grade": grade.value,
            "mep_constraints": {
                "ceiling_plenum": 0.6,
                "lighting_zones": mep_zones
            },
            "design_parameters": {
                "building_type": building_type,
                "region": region,
                "palette": MATERIAL_PALETTES.get(style, {})
            }
        }

        self.log_decision(
            "analysis_complete",
            f"Selected {style.value} style with {grade.value} finish grade for {len(spaces)} spaces"
        )

        return analysis

    async def design(self, analysis: Dict[str, Any], constraints: Dict[str, Any]) -> Dict[str, Any]:
        """Generate interior design"""
        logger.info("[Interior] Designing interiors...")

        spaces = analysis["spaces"]
        floor_height = analysis["floor_height"]
        style = DesignStyle(analysis["style"])
        grade = FinishGrade(analysis["grade"])

        # Re-initialize designers with correct parameters
        region = analysis["design_parameters"]["region"]
        self.furniture_planner = FurniturePlanner(style, grade)
        self.finish_designer = FinishDesigner(style, grade, region)
        self.lighting_designer = LightingDesigner()

        layouts = []
        all_furniture = []
        all_finishes = []
        all_lighting = []

        for space in spaces:
            # Plan furniture
            furniture = self.furniture_planner.plan_layout(space)
            all_furniture.extend(furniture)

            # Design finishes
            finish_height = floor_height - analysis["mep_constraints"]["ceiling_plenum"]
            finishes = self.finish_designer.design_finishes(space, finish_height)
            all_finishes.append(finishes)

            # Design lighting
            lighting = self.lighting_designer.design_lighting(space, finishes.ceiling_height)
            all_lighting.extend(lighting)

            # Calculate power/data requirements
            power_points = self._calculate_power_points(furniture)
            data_points = self._calculate_data_points(furniture)

            layouts.append(InteriorLayout(
                space_id=space.get("id", ""),
                furniture=furniture,
                finishes=finishes,
                lighting=lighting,
                power_points=power_points,
                data_points=data_points
            ))

        design = {
            "style": style.value,
            "grade": grade.value,
            "palette": analysis["design_parameters"]["palette"],
            "layouts": [self._serialize_layout(l) for l in layouts],
            "furniture_schedule": self._create_furniture_schedule(all_furniture),
            "finish_schedule": [self._serialize_finish(f) for f in all_finishes],
            "lighting_schedule": self._create_lighting_schedule(all_lighting),
            "ffe_budget": self._estimate_ffe_budget(all_furniture, grade),
            "metrics": self._calculate_metrics(layouts),
            "geometry": self._generate_geometry(layouts)
        }

        self.log_decision(
            "design_complete",
            f"Interior design complete: {len(all_furniture)} furniture items, "
            f"{len(all_lighting)} lighting fixtures"
        )

        return design

    async def validate(self, design: Dict[str, Any]) -> Tuple[bool, List[str]]:
        """Validate interior design"""
        logger.info("[Interior] Validating design...")
        issues = []

        # Check furniture clearances
        for layout in design.get("layouts", []):
            furniture = layout.get("furniture", [])
            for i, f1 in enumerate(furniture):
                for f2 in furniture[i+1:]:
                    if self._check_collision(f1, f2):
                        issues.append(
                            f"Furniture collision: {f1.get('id')} and {f2.get('id')}"
                        )

        # Check circulation width
        for layout in design.get("layouts", []):
            # Simplified check
            furniture_count = len(layout.get("furniture", []))
            if furniture_count > 20:
                issues.append(f"Space {layout.get('space_id')} may be overcrowded")

        # Check lighting levels
        for layout in design.get("layouts", []):
            lighting = layout.get("lighting", [])
            if not lighting:
                issues.append(f"Space {layout.get('space_id')} has no lighting")

        is_valid = len(issues) == 0
        return is_valid, issues

    async def optimize(self, design: Dict[str, Any], objectives: List[str]) -> Dict[str, Any]:
        """Optimize interior design"""
        logger.info(f"[Interior] Optimizing for: {objectives}")

        optimized = design.copy()

        for objective in objectives:
            if objective == "cost":
                optimized = self._optimize_for_cost(optimized)
            elif objective == "density":
                optimized = self._optimize_for_density(optimized)
            elif objective == "daylight":
                optimized = self._optimize_for_daylight(optimized)

        return optimized

    # ========================================================================
    # Helper Methods
    # ========================================================================

    def _select_style(self, building_type: str, region: str) -> DesignStyle:
        """Select design style"""
        if region in ["saudi", "uae", "qatar"]:
            return DesignStyle.MODERN
        elif building_type == "office":
            return DesignStyle.CONTEMPORARY
        else:
            return DesignStyle.MODERN

    def _select_grade(self, budget: str) -> FinishGrade:
        """Select finish grade"""
        grade_map = {
            "economy": FinishGrade.ECONOMY,
            "standard": FinishGrade.STANDARD,
            "premium": FinishGrade.PREMIUM,
            "luxury": FinishGrade.LUXURY
        }
        return grade_map.get(budget.lower(), FinishGrade.STANDARD)

    def _calculate_power_points(self, furniture: List[FurnitureItem]) -> List[Tuple[float, float]]:
        """Calculate power outlet locations"""
        points = []
        for item in furniture:
            if FURNITURE_CATALOG.get(item.type, {}).get("power", False):
                points.append((
                    item.position[0] + item.dimensions[0] / 2,
                    item.position[1]
                ))
        return points

    def _calculate_data_points(self, furniture: List[FurnitureItem]) -> List[Tuple[float, float]]:
        """Calculate data outlet locations"""
        points = []
        for item in furniture:
            if FURNITURE_CATALOG.get(item.type, {}).get("data", False):
                points.append((
                    item.position[0] + item.dimensions[0] / 2,
                    item.position[1]
                ))
        return points

    def _serialize_layout(self, layout: InteriorLayout) -> Dict:
        """Serialize layout to dictionary"""
        return {
            "space_id": layout.space_id,
            "furniture": [
                {
                    "id": f.id,
                    "type": f.type,
                    "position": {"x": f.position[0], "y": f.position[1]},
                    "rotation": f.rotation,
                    "dimensions": {"l": f.dimensions[0], "w": f.dimensions[1], "h": f.dimensions[2]}
                }
                for f in layout.furniture
            ],
            "lighting": [
                {
                    "id": l.id,
                    "type": l.type,
                    "position": {"x": l.position[0], "y": l.position[1], "z": l.position[2]},
                    "wattage": l.wattage,
                    "lumens": l.lumens
                }
                for l in layout.lighting
            ],
            "power_points": [{"x": p[0], "y": p[1]} for p in layout.power_points],
            "data_points": [{"x": p[0], "y": p[1]} for p in layout.data_points]
        }

    def _serialize_finish(self, finish: FinishSchedule) -> Dict:
        """Serialize finish schedule"""
        return {
            "space_id": finish.space_id,
            "floor": finish.floor_finish,
            "wall": finish.wall_finish,
            "ceiling": finish.ceiling_finish,
            "ceiling_height": finish.ceiling_height,
            "skirting": finish.skirting,
            "accent_wall": finish.accent_wall
        }

    def _create_furniture_schedule(self, furniture: List[FurnitureItem]) -> List[Dict]:
        """Create furniture schedule"""
        schedule = {}
        for item in furniture:
            if item.type not in schedule:
                schedule[item.type] = {
                    "type": item.type,
                    "count": 0,
                    "dimensions": item.dimensions
                }
            schedule[item.type]["count"] += 1

        return list(schedule.values())

    def _create_lighting_schedule(self, lighting: List[LightingFixture]) -> List[Dict]:
        """Create lighting schedule"""
        schedule = {}
        for fixture in lighting:
            key = f"{fixture.type}_{fixture.wattage}W"
            if key not in schedule:
                schedule[key] = {
                    "type": fixture.type,
                    "wattage": fixture.wattage,
                    "lumens": fixture.lumens,
                    "count": 0,
                    "total_wattage": 0
                }
            schedule[key]["count"] += 1
            schedule[key]["total_wattage"] += fixture.wattage

        return list(schedule.values())

    def _estimate_ffe_budget(self, furniture: List, grade: FinishGrade) -> Dict:
        """Estimate FF&E budget"""
        # Cost per item by grade (simplified)
        cost_multipliers = {
            FinishGrade.ECONOMY: 0.6,
            FinishGrade.STANDARD: 1.0,
            FinishGrade.PREMIUM: 1.8,
            FinishGrade.LUXURY: 3.0
        }

        base_costs = {
            "workstation": 800,
            "executive_desk": 2000,
            "office_chair": 400,
            "meeting_table_8": 3000,
            "sofa_3seater": 2500,
            "armchair": 800,
            "reception_desk": 5000,
            "planter_large": 300
        }

        multiplier = cost_multipliers.get(grade, 1.0)
        total = 0

        for item in furniture:
            base = base_costs.get(item.type, 500)
            total += base * multiplier

        return {
            "total_estimate": total,
            "per_item_average": total / max(len(furniture), 1),
            "grade": grade.value,
            "currency": "USD"
        }

    def _check_collision(self, f1: Dict, f2: Dict) -> bool:
        """Check if two furniture items collide"""
        pos1 = f1.get("position", {})
        pos2 = f2.get("position", {})
        dim1 = f1.get("dimensions", {})
        dim2 = f2.get("dimensions", {})

        # Simple AABB collision
        x1, y1 = pos1.get("x", 0), pos1.get("y", 0)
        x2, y2 = pos2.get("x", 0), pos2.get("y", 0)
        w1, d1 = dim1.get("l", 1), dim1.get("w", 1)
        w2, d2 = dim2.get("l", 1), dim2.get("w", 1)

        return not (x1 + w1 < x2 or x2 + w2 < x1 or
                    y1 + d1 < y2 or y2 + d2 < y1)

    def _calculate_metrics(self, layouts: List) -> Dict:
        """Calculate interior design metrics"""
        total_furniture = sum(len(l.furniture) for l in layouts)
        total_lighting = sum(len(l.lighting) for l in layouts)
        total_wattage = sum(
            sum(fix.wattage for fix in l.lighting)
            for l in layouts
        )

        return {
            "total_furniture_items": total_furniture,
            "total_lighting_fixtures": total_lighting,
            "total_lighting_wattage": total_wattage,
            "spaces_designed": len(layouts)
        }

    def _generate_geometry(self, layouts: List) -> Dict:
        """Generate 3D geometry for visualization"""
        elements = []

        for layout in layouts:
            for furniture in layout.furniture:
                elements.append({
                    "type": "furniture",
                    "id": furniture.id,
                    "furniture_type": furniture.type,
                    "bounds": {
                        "min_x": furniture.position[0],
                        "max_x": furniture.position[0] + furniture.dimensions[0],
                        "min_y": furniture.position[1],
                        "max_y": furniture.position[1] + furniture.dimensions[1],
                        "min_z": 0,
                        "max_z": furniture.dimensions[2]
                    }
                })

            for light in layout.lighting:
                elements.append({
                    "type": "lighting",
                    "id": light.id,
                    "position": light.position,
                    "lumens": light.lumens
                })

        return {"elements": elements}

    def _optimize_for_cost(self, design: Dict) -> Dict:
        """Optimize for cost"""
        design["optimization_notes"] = design.get("optimization_notes", [])
        design["optimization_notes"].append("Consider standard finish grades")
        return design

    def _optimize_for_density(self, design: Dict) -> Dict:
        """Optimize for space density"""
        design["optimization_notes"] = design.get("optimization_notes", [])
        design["optimization_notes"].append("Compact furniture arrangement applied")
        return design

    def _optimize_for_daylight(self, design: Dict) -> Dict:
        """Optimize for daylight"""
        design["optimization_notes"] = design.get("optimization_notes", [])
        design["optimization_notes"].append("Perimeter workstations prioritized")
        return design
