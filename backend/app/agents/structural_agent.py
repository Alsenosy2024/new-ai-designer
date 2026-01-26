"""
Structural Engineering Agent
============================
Autonomous agent for structural design and analysis.
Designs structural systems, grids, and performs analysis.
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

class StructuralSystem(Enum):
    """Types of structural systems"""
    MOMENT_FRAME = "moment_frame"
    BRACED_FRAME = "braced_frame"
    SHEAR_WALL = "shear_wall"
    CORE_OUTRIGGER = "core_outrigger"
    TUBE = "tube"
    FLAT_SLAB = "flat_slab"


class MaterialType(Enum):
    """Structural materials"""
    CONCRETE = "concrete"
    STEEL = "steel"
    COMPOSITE = "composite"
    TIMBER = "timber"


# Material properties (simplified)
MATERIAL_PROPERTIES = {
    "concrete": {
        "fc": 40,  # MPa
        "Ec": 32000,  # MPa
        "density": 2400,  # kg/m³
        "cost_factor": 1.0
    },
    "steel": {
        "fy": 355,  # MPa
        "Es": 200000,  # MPa
        "density": 7850,  # kg/m³
        "cost_factor": 2.5
    },
    "composite": {
        "fc": 40,
        "fy": 355,
        "density": 3500,
        "cost_factor": 1.8
    }
}

# Load factors
LOAD_FACTORS = {
    "dead": 1.35,
    "live": 1.5,
    "wind": 1.5,
    "seismic": 1.0
}

# Typical loads (kN/m²)
TYPICAL_LOADS = {
    "office": {"dead": 5.0, "live": 3.0, "partition": 1.0},
    "residential": {"dead": 4.5, "live": 2.0, "partition": 0.5},
    "retail": {"dead": 5.5, "live": 5.0, "partition": 0.5},
    "hotel": {"dead": 5.0, "live": 2.5, "partition": 1.0},
    "parking": {"dead": 4.0, "live": 2.5, "partition": 0.0}
}


# ============================================================================
# Data Structures
# ============================================================================

@dataclass
class Column:
    """Structural column element"""
    id: str
    position: Tuple[float, float]  # (x, y)
    base_level: int
    top_level: int
    width: float  # m
    depth: float  # m
    material: str
    load: float = 0  # kN
    utilization: float = 0  # 0-1


@dataclass
class Beam:
    """Structural beam element"""
    id: str
    start: Tuple[float, float]
    end: Tuple[float, float]
    level: int
    width: float
    depth: float
    material: str
    span: float = 0
    load: float = 0  # kN/m
    utilization: float = 0


@dataclass
class Slab:
    """Floor slab element"""
    id: str
    level: int
    thickness: float
    system: str  # flat_slab, beam_slab, composite
    spans: Tuple[float, float]
    reinforcement_ratio: float = 0.01


@dataclass
class StructuralGrid:
    """Structural grid definition"""
    grid_x: List[float]  # X coordinates
    grid_y: List[float]  # Y coordinates
    module_x: float
    module_y: float
    column_positions: List[Tuple[float, float]]


@dataclass
class StructuralModel:
    """Complete structural model"""
    system: StructuralSystem
    material: MaterialType
    grid: StructuralGrid
    columns: List[Column]
    beams: List[Beam]
    slabs: List[Slab]
    walls: List[Dict]
    foundations: List[Dict]
    max_drift: float = 0
    period: float = 0


# ============================================================================
# Structural System Selector
# ============================================================================

class StructuralSystemSelector:
    """Selects optimal structural system based on building parameters"""

    # System applicability by height range (floors)
    SYSTEM_HEIGHT_LIMITS = {
        StructuralSystem.FLAT_SLAB: (1, 10),
        StructuralSystem.MOMENT_FRAME: (1, 25),
        StructuralSystem.BRACED_FRAME: (5, 40),
        StructuralSystem.SHEAR_WALL: (5, 50),
        StructuralSystem.CORE_OUTRIGGER: (30, 70),
        StructuralSystem.TUBE: (40, 100)
    }

    # System efficiency factors
    SYSTEM_EFFICIENCY = {
        StructuralSystem.FLAT_SLAB: 0.95,
        StructuralSystem.MOMENT_FRAME: 0.85,
        StructuralSystem.BRACED_FRAME: 0.88,
        StructuralSystem.SHEAR_WALL: 0.90,
        StructuralSystem.CORE_OUTRIGGER: 0.82,
        StructuralSystem.TUBE: 0.78
    }

    def select(
        self,
        floors: int,
        building_type: str,
        seismic_zone: str,
        span_requirement: float,
        budget_priority: str = "balanced"
    ) -> Tuple[StructuralSystem, MaterialType, str]:
        """
        Select optimal structural system.

        Returns:
            Tuple of (system, material, reasoning)
        """
        candidates = []

        for system, (min_h, max_h) in self.SYSTEM_HEIGHT_LIMITS.items():
            if min_h <= floors <= max_h:
                score = self._calculate_score(
                    system, floors, building_type, seismic_zone,
                    span_requirement, budget_priority
                )
                candidates.append((system, score))

        if not candidates:
            # Default to moment frame
            return StructuralSystem.MOMENT_FRAME, MaterialType.CONCRETE, "Default selection"

        # Select best system
        best_system = max(candidates, key=lambda x: x[1])[0]

        # Select material
        material = self._select_material(best_system, floors, building_type)

        reasoning = self._generate_reasoning(best_system, material, floors, building_type)

        return best_system, material, reasoning

    def _calculate_score(
        self,
        system: StructuralSystem,
        floors: int,
        building_type: str,
        seismic_zone: str,
        span_requirement: float,
        budget_priority: str
    ) -> float:
        """Calculate suitability score for a system"""
        score = 50.0  # Base score

        # Height efficiency
        min_h, max_h = self.SYSTEM_HEIGHT_LIMITS[system]
        optimal_height = (min_h + max_h) / 2
        height_factor = 1 - abs(floors - optimal_height) / (max_h - min_h)
        score += height_factor * 20

        # Span capability
        if system in [StructuralSystem.FLAT_SLAB, StructuralSystem.MOMENT_FRAME]:
            if span_requirement <= 9:
                score += 15
            elif span_requirement <= 12:
                score += 10
        elif system == StructuralSystem.BRACED_FRAME:
            if span_requirement <= 15:
                score += 15

        # Seismic performance
        if seismic_zone in ["high", "very_high"]:
            if system in [StructuralSystem.SHEAR_WALL, StructuralSystem.BRACED_FRAME]:
                score += 15
            elif system == StructuralSystem.MOMENT_FRAME:
                score += 10

        # Building type compatibility
        if building_type == "office":
            if system == StructuralSystem.MOMENT_FRAME:
                score += 10  # Flexibility
        elif building_type == "residential":
            if system == StructuralSystem.SHEAR_WALL:
                score += 10  # Partition alignment

        # Budget consideration
        efficiency = self.SYSTEM_EFFICIENCY[system]
        if budget_priority == "economy":
            score += efficiency * 15
        elif budget_priority == "performance":
            score -= efficiency * 5

        return score

    def _select_material(
        self,
        system: StructuralSystem,
        floors: int,
        building_type: str
    ) -> MaterialType:
        """Select structural material"""
        if floors > 30:
            return MaterialType.COMPOSITE

        if system == StructuralSystem.MOMENT_FRAME:
            if floors > 15:
                return MaterialType.STEEL
            return MaterialType.CONCRETE

        if system in [StructuralSystem.SHEAR_WALL, StructuralSystem.FLAT_SLAB]:
            return MaterialType.CONCRETE

        return MaterialType.COMPOSITE

    def _generate_reasoning(
        self,
        system: StructuralSystem,
        material: MaterialType,
        floors: int,
        building_type: str
    ) -> str:
        """Generate reasoning for system selection"""
        return (
            f"Selected {system.value} with {material.value} for {floors}-story {building_type}. "
            f"This system provides optimal balance of structural efficiency, "
            f"architectural flexibility, and cost-effectiveness."
        )


# ============================================================================
# Load Calculator
# ============================================================================

class LoadCalculator:
    """Calculates structural loads"""

    def __init__(self, building_type: str, region: str):
        self.building_type = building_type
        self.region = region
        self.loads = TYPICAL_LOADS.get(building_type, TYPICAL_LOADS["office"])

    def calculate_gravity_loads(
        self,
        floor_area: float,
        floors: int,
        tributary_area: float
    ) -> Dict[str, float]:
        """Calculate gravity loads"""
        # Dead load
        dead = (self.loads["dead"] + self.loads["partition"]) * tributary_area

        # Live load with reduction
        reduction = self._live_load_reduction(tributary_area, floors)
        live = self.loads["live"] * tributary_area * reduction

        # Factored load
        factored = (
            dead * LOAD_FACTORS["dead"] +
            live * LOAD_FACTORS["live"]
        )

        return {
            "dead": dead,
            "live": live,
            "factored": factored,
            "tributary_area": tributary_area
        }

    def calculate_lateral_loads(
        self,
        width: float,
        depth: float,
        height: float,
        floors: int
    ) -> Dict[str, Any]:
        """Calculate lateral loads (wind and seismic)"""
        # Wind load (simplified)
        wind_pressure = self._get_wind_pressure()
        wind_force = wind_pressure * width * height

        # Seismic load (simplified)
        seismic_coefficient = self._get_seismic_coefficient()
        building_weight = width * depth * floors * 10  # kN/m² approx
        seismic_force = seismic_coefficient * building_weight

        # Distribute to floors
        denom = sum(range(1, floors + 1))
        floor_forces = []
        for i in range(floors):
            factor = (i + 1) / denom
            floor_forces.append({
                "level": i,
                "wind": wind_force * factor,
                "seismic": seismic_force * factor
            })

        return {
            "wind_base_shear": wind_force,
            "seismic_base_shear": seismic_force,
            "controlling": "seismic" if seismic_force > wind_force else "wind",
            "floor_forces": floor_forces
        }

    def _live_load_reduction(self, area: float, floors: int) -> float:
        """Calculate live load reduction factor"""
        # Simple reduction based on area
        if area <= 40:
            return 1.0
        reduction = 0.25 + 15 / math.sqrt(area)
        return max(0.5, min(1.0, reduction))

    def _get_wind_pressure(self) -> float:
        """Get design wind pressure (kPa)"""
        wind_speeds = {
            "saudi": 1.2,
            "uae": 1.4,
            "qatar": 1.3,
            "international": 1.0
        }
        return wind_speeds.get(self.region.lower(), 1.0)

    def _get_seismic_coefficient(self) -> float:
        """Get seismic design coefficient"""
        seismic_zones = {
            "saudi": 0.15,
            "uae": 0.10,
            "qatar": 0.10,
            "international": 0.20
        }
        return seismic_zones.get(self.region.lower(), 0.15)


# ============================================================================
# Member Designer
# ============================================================================

class MemberDesigner:
    """Designs structural members"""

    def __init__(self, material: MaterialType):
        self.material = material
        self.props = MATERIAL_PROPERTIES[material.value]

    def design_column(
        self,
        axial_load: float,  # kN
        height: float,  # m
        restraint: str = "fixed"  # fixed, pinned
    ) -> Tuple[float, float, float]:
        """
        Design column for given load.

        Returns:
            (width, depth, utilization)
        """
        if self.material == MaterialType.CONCRETE:
            return self._design_concrete_column(axial_load, height)
        elif self.material == MaterialType.STEEL:
            return self._design_steel_column(axial_load, height)
        else:
            return self._design_composite_column(axial_load, height)

    def _design_concrete_column(
        self,
        axial_load: float,
        height: float
    ) -> Tuple[float, float, float]:
        """Design reinforced concrete column"""
        fc = self.props["fc"]  # MPa

        # Required area (simplified)
        required_area = (axial_load * 1000) / (0.4 * fc)  # mm²

        # Square column
        side = math.ceil(math.sqrt(required_area) / 50) * 50  # Round to 50mm
        side = max(300, min(1500, side))  # Practical limits

        # Utilization
        capacity = 0.4 * fc * (side ** 2) / 1000  # kN
        utilization = axial_load / capacity

        return side / 1000, side / 1000, min(1.0, utilization)

    def _design_steel_column(
        self,
        axial_load: float,
        height: float
    ) -> Tuple[float, float, float]:
        """Design steel column"""
        fy = self.props["fy"]  # MPa

        # Effective length factor
        k = 1.0  # Assumed pinned-pinned

        # Slenderness limit
        slenderness_limit = math.pi * math.sqrt(self.props["Es"] / fy)

        # Required area
        required_area = (axial_load * 1000) / (0.6 * fy)  # mm²

        # Select section (simplified - square tube)
        side = math.ceil(math.sqrt(required_area / 4) / 10) * 10
        side = max(150, min(600, side))

        # Utilization
        capacity = 0.6 * fy * (4 * side * 10) / 1000  # kN (tube)
        utilization = axial_load / capacity

        return side / 1000, side / 1000, min(1.0, utilization)

    def _design_composite_column(
        self,
        axial_load: float,
        height: float
    ) -> Tuple[float, float, float]:
        """Design composite column"""
        # Concrete-filled steel tube
        fc = 40  # MPa
        fy = 355  # MPa

        required_area = (axial_load * 1000) / (0.5 * (fc + 0.85 * fy))

        side = math.ceil(math.sqrt(required_area) / 50) * 50
        side = max(250, min(800, side))

        capacity = 0.5 * (fc + 0.85 * fy) * (side ** 2) / 1000
        utilization = axial_load / capacity

        return side / 1000, side / 1000, min(1.0, utilization)

    def design_beam(
        self,
        span: float,  # m
        load: float,  # kN/m
        width: float = None
    ) -> Tuple[float, float, float]:
        """
        Design beam for given span and load.

        Returns:
            (width, depth, utilization)
        """
        if self.material == MaterialType.CONCRETE:
            return self._design_concrete_beam(span, load, width)
        elif self.material == MaterialType.STEEL:
            return self._design_steel_beam(span, load)
        else:
            return self._design_composite_beam(span, load)

    def _design_concrete_beam(
        self,
        span: float,
        load: float,
        width: float = None
    ) -> Tuple[float, float, float]:
        """Design reinforced concrete beam"""
        # Estimate depth from span/depth ratio
        depth = span / 12  # Typical for continuous beams
        width = width or depth * 0.5

        # Round to practical dimensions
        depth = math.ceil(depth * 1000 / 50) * 50 / 1000
        width = math.ceil(width * 1000 / 50) * 50 / 1000

        depth = max(0.4, min(1.5, depth))
        width = max(0.25, min(0.8, width))

        # Calculate moment
        moment = load * span ** 2 / 8  # kN.m

        # Capacity (simplified)
        fc = self.props["fc"]
        capacity = 0.138 * fc * width * depth ** 2 * 1000  # kN.m

        utilization = moment / capacity

        return width, depth, min(1.0, utilization)

    def _design_steel_beam(
        self,
        span: float,
        load: float
    ) -> Tuple[float, float, float]:
        """Design steel beam"""
        # Estimate depth from span
        depth = span / 20
        width = depth * 0.4

        depth = max(0.3, min(1.2, depth))
        width = max(0.15, min(0.5, width))

        moment = load * span ** 2 / 8
        fy = self.props["fy"]

        # Simplified section modulus
        Z = width * depth ** 2 / 6  # m³
        capacity = fy * Z * 1000  # kN.m

        utilization = moment / capacity

        return width, depth, min(1.0, utilization)

    def _design_composite_beam(
        self,
        span: float,
        load: float
    ) -> Tuple[float, float, float]:
        """Design composite beam"""
        depth = span / 18
        width = depth * 0.35

        depth = max(0.35, min(1.0, depth))
        width = max(0.2, min(0.4, width))

        moment = load * span ** 2 / 8

        # Composite action increases capacity by ~30%
        Z = width * depth ** 2 / 6
        capacity = 355 * Z * 1000 * 1.3

        utilization = moment / capacity

        return width, depth, min(1.0, utilization)


# ============================================================================
# Structural Analysis
# ============================================================================

class StructuralAnalyzer:
    """Performs structural analysis"""

    def analyze_drift(
        self,
        model: StructuralModel,
        lateral_loads: Dict[str, Any],
        stiffness_multiplier: float = 1.0
    ) -> Dict[str, float]:
        """Analyze inter-story drift"""
        floors = len(model.slabs)
        floor_height = 3.6  # Assumed

        # Estimate stiffness
        if model.system in [StructuralSystem.MOMENT_FRAME]:
            stiffness_factor = 0.7
        elif model.system in [StructuralSystem.BRACED_FRAME, StructuralSystem.SHEAR_WALL]:
            stiffness_factor = 1.2
        else:
            stiffness_factor = 1.0
            
        stiffness_factor *= stiffness_multiplier

        # Calculate drift per floor
        drifts = []
        total_drift = 0

        for i, floor_load in enumerate(lateral_loads.get("floor_forces", [])):
            force = floor_load.get("seismic", 0) + floor_load.get("wind", 0)

            # Simplified drift calculation
            drift = force / (stiffness_factor * 10000 * floor_height)
            drifts.append({
                "level": i,
                "drift": drift,
                "drift_ratio": drift / floor_height
            })
            total_drift += drift

        max_drift_ratio = max(d["drift_ratio"] for d in drifts) if drifts else 0

        return {
            "max_drift": total_drift,
            "max_drift_ratio": max_drift_ratio,
            "drift_limit": 0.015,  # H/66 typical limit
            "compliant": max_drift_ratio <= 0.015,
            "floor_drifts": drifts
        }

    def analyze_period(
        self,
        height: float,
        system: StructuralSystem
    ) -> float:
        """Estimate fundamental period"""
        # Simplified formula
        coefficients = {
            StructuralSystem.MOMENT_FRAME: 0.085,
            StructuralSystem.BRACED_FRAME: 0.05,
            StructuralSystem.SHEAR_WALL: 0.05,
            StructuralSystem.CORE_OUTRIGGER: 0.06,
            StructuralSystem.TUBE: 0.045
        }
        ct = coefficients.get(system, 0.07)

        return ct * height ** 0.75


# ============================================================================
# Structural Agent
# ============================================================================

class StructuralAgent(BaseDesignAgent):
    """
    Autonomous agent for structural engineering design.

    Capabilities:
    - Structural system selection
    - Grid design
    - Member sizing
    - Load calculation
    - Drift analysis
    """

    @property
    def domain(self) -> str:
        return "structural"

    @property
    def dependencies(self) -> List[str]:
        return ["architectural"]

    def __init__(self, llm_client: Any, project_context: Dict[str, Any], config: Dict[str, Any] = None):
        super().__init__("structural", llm_client, project_context, config)

        self.system_selector = StructuralSystemSelector()
        self.load_calculator = None
        self.member_designer = None
        self.analyzer = StructuralAnalyzer()

    async def analyze(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze structural requirements"""
        logger.info("[Structural] Analyzing requirements...")

        # Get architectural design
        arch_data = inputs.get("dependency_outputs", {}).get("architectural", {})
        massing = arch_data.get("massing", {})

        # Extract parameters
        floors = massing.get("floors", self.context.get("floors", 10))
        width = massing.get("width", 40)
        depth = massing.get("depth", 30)
        floor_height = massing.get("floor_height", 3.6)

        # Calculate spans from grid
        floor_plans = arch_data.get("floor_plans", [{}])
        grid_x = floor_plans[0].get("grid_x", [0, 8, 16, 24])
        grid_y = floor_plans[0].get("grid_y", [0, 8, 16])

        spans_x = [grid_x[i+1] - grid_x[i] for i in range(len(grid_x)-1)] if len(grid_x) > 1 else [8]
        spans_y = [grid_y[i+1] - grid_y[i] for i in range(len(grid_y)-1)] if len(grid_y) > 1 else [8]

        max_span = max(max(spans_x), max(spans_y))

        # Get loads
        building_type = self.context.get("building_type", "office")
        region = self.context.get("region", "international")

        self.load_calculator = LoadCalculator(building_type, region)

        analysis = {
            "geometry": {
                "width": width,
                "depth": depth,
                "height": floors * floor_height,
                "floors": floors,
                "floor_height": floor_height
            },
            "grid": {
                "grid_x": grid_x,
                "grid_y": grid_y,
                "spans_x": spans_x,
                "spans_y": spans_y,
                "max_span": max_span
            },
            "loads": {
                "gravity": self.load_calculator.calculate_gravity_loads(
                    width * depth, floors, max_span ** 2
                ),
                "lateral": self.load_calculator.calculate_lateral_loads(
                    width, depth, floors * floor_height, floors
                )
            },
            "constraints": {
                "max_drift_ratio": 0.015,
                "column_free_spans": arch_data.get("spaces", []),
                "opening_locations": arch_data.get("circulation", [])
            }
        }

        self.log_decision(
            "analysis_complete",
            f"Analyzed {floors}-story structure with {max_span}m spans"
        )

        return analysis

    async def design(self, analysis: Dict[str, Any], constraints: Dict[str, Any]) -> Dict[str, Any]:
        """Generate structural design"""
        logger.info("[Structural] Designing structure...")

        geometry = analysis["geometry"]
        grid_data = analysis["grid"]
        loads = analysis["loads"]

        # Select structural system
        system, material, reasoning = self.system_selector.select(
            floors=geometry["floors"],
            building_type=self.context.get("building_type", "office"),
            seismic_zone=self._get_seismic_zone(),
            span_requirement=grid_data["max_span"],
            budget_priority=self.context.get("budget_priority", "balanced")
        )

        self.log_decision(
            "system_selected",
            reasoning,
            alternatives=[s.value for s in StructuralSystem],
            confidence=0.85
        )

        # Initialize member designer
        self.member_designer = MemberDesigner(material)

        # Create structural grid
        grid = self._create_structural_grid(grid_data)

        # Design columns
        columns = self._design_columns(grid, geometry, loads)

        # Design beams
        beams = self._design_beams(grid, geometry, loads)

        # Design slabs
        slabs = self._design_slabs(geometry, grid_data)

        # Create model
        model = StructuralModel(
            system=system,
            material=material,
            grid=grid,
            columns=columns,
            beams=beams,
            slabs=slabs,
            walls=self._design_walls(system, geometry),
            foundations=self._design_foundations(columns, loads)
        )

        # Iterative design for drift optimization
        max_iterations = 3
        stiffness_multiplier = 1.0
        
        for iteration in range(max_iterations):
            # Analyze drift with current stiffness
            drift_results = self.analyzer.analyze_drift(model, loads["lateral"], stiffness_multiplier)
            model.max_drift = drift_results["max_drift"]
            model.period = self.analyzer.analyze_period(
                geometry["height"], system
            )
            
            # Check compliance
            if drift_results["max_drift_ratio"] <= 0.015:
                logger.info(f"[Structural] Drift check passed on iteration {iteration + 1}")
                break
                
            logger.info(f"[Structural] Drift ratio {drift_results['max_drift_ratio']:.4f} exceeds limit. Optimizing (Iter {iteration + 1})...")
            
            # Increase stiffness for next iteration (simulate larger members)
            stiffness_multiplier *= 1.3
            
            # Update member sizes in model to reflect increased stiffness
            for col in model.columns:
                col.width *= 1.1
                col.depth *= 1.1
            for beam in model.beams:
                beam.width *= 1.1
                beam.depth *= 1.1

        # Check for conflicts with architecture
        self._check_conflicts(analysis, model)

        design = {
            "system": system.value,
            "material": material.value,
            "grid": {
                "grid_x": grid.grid_x,
                "grid_y": grid.grid_y,
                "module_x": grid.module_x,
                "module_y": grid.module_y
            },
            "columns": [self._serialize_column(c) for c in columns],
            "beams": [self._serialize_beam(b) for b in beams],
            "slabs": [self._serialize_slab(s) for s in slabs],
            "walls": model.walls,
            "foundations": model.foundations,
            "analysis": {
                "max_drift": model.max_drift,
                "max_drift_ratio": drift_results["max_drift_ratio"],
                "drift_compliant": drift_results["compliant"],
                "period": model.period
            },
            "metrics": self._calculate_metrics(model, geometry),
            "geometry": self._generate_geometry(model, geometry)
        }

        self.log_decision(
            "design_complete",
            f"Designed {system.value} system with {len(columns)} columns, {len(beams)} beams"
        )

        return design

    async def validate(self, design: Dict[str, Any]) -> Tuple[bool, List[str]]:
        """Validate structural design"""
        logger.info("[Structural] Validating design...")
        issues = []

        # Check drift
        if not design.get("analysis", {}).get("drift_compliant", True):
            issues.append(
                f"Drift ratio {design['analysis'].get('max_drift_ratio', 0):.4f} "
                f"exceeds limit 0.015"
            )

        # Check column utilization
        for col in design.get("columns", []):
            if col.get("utilization", 0) > 0.9:
                issues.append(f"Column {col['id']} utilization {col['utilization']:.2f} > 0.9")

        # Check beam utilization
        for beam in design.get("beams", []):
            if beam.get("utilization", 0) > 0.9:
                issues.append(f"Beam {beam['id']} utilization {beam['utilization']:.2f} > 0.9")

        # Check minimum column size
        for col in design.get("columns", []):
            if col.get("width", 0) < 0.3:
                issues.append(f"Column {col['id']} width {col['width']}m < minimum 0.3m")

        is_valid = len(issues) == 0
        return is_valid, issues

    async def optimize(self, design: Dict[str, Any], objectives: List[str]) -> Dict[str, Any]:
        """Optimize structural design"""
        logger.info(f"[Structural] Optimizing for: {objectives}")

        optimized = design.copy()

        for objective in objectives:
            if objective == "cost":
                optimized = self._optimize_for_cost(optimized)
            elif objective == "weight":
                optimized = self._optimize_for_weight(optimized)
            elif objective == "stiffness":
                optimized = self._optimize_for_stiffness(optimized)

        return optimized

    # ========================================================================
    # Helper Methods
    # ========================================================================

    def _get_seismic_zone(self) -> str:
        """Get seismic zone for region"""
        zones = {
            "saudi": "medium",
            "uae": "low",
            "qatar": "low",
            "international": "medium"
        }
        return zones.get(self.context.get("region", "").lower(), "medium")

    def _create_structural_grid(self, grid_data: Dict) -> StructuralGrid:
        """Create structural grid from architectural grid"""
        grid_x = grid_data["grid_x"]
        grid_y = grid_data["grid_y"]

        # Calculate column positions (at grid intersections)
        column_positions = [
            (x, y) for x in grid_x for y in grid_y
        ]

        return StructuralGrid(
            grid_x=grid_x,
            grid_y=grid_y,
            module_x=grid_data["spans_x"][0] if grid_data["spans_x"] else 8,
            module_y=grid_data["spans_y"][0] if grid_data["spans_y"] else 8,
            column_positions=column_positions
        )

    def _design_columns(
        self,
        grid: StructuralGrid,
        geometry: Dict,
        loads: Dict
    ) -> List[Column]:
        """Design all columns"""
        columns = []
        total_load = loads["gravity"]["factored"]
        num_columns = len(grid.column_positions)
        load_per_column = total_load * geometry["floors"] / num_columns

        for i, (x, y) in enumerate(grid.column_positions):
            # Vary load based on position (edge vs interior)
            is_edge = (x == min(grid.grid_x) or x == max(grid.grid_x) or
                       y == min(grid.grid_y) or y == max(grid.grid_y))
            position_factor = 0.7 if is_edge else 1.0

            column_load = load_per_column * position_factor

            width, depth, util = self.member_designer.design_column(
                column_load, geometry["floor_height"]
            )

            columns.append(Column(
                id=f"C{i+1}",
                position=(x, y),
                base_level=0,
                top_level=geometry["floors"],
                width=width,
                depth=depth,
                material=self.member_designer.material.value,
                load=column_load,
                utilization=util
            ))

        return columns

    def _design_beams(
        self,
        grid: StructuralGrid,
        geometry: Dict,
        loads: Dict
    ) -> List[Beam]:
        """Design all beams"""
        beams = []
        beam_id = 0

        # Load per meter
        floor_load = loads["gravity"]["factored"] / (
            (max(grid.grid_x) - min(grid.grid_x)) *
            (max(grid.grid_y) - min(grid.grid_y))
        )

        for level in range(geometry["floors"]):
            # X-direction beams
            for y in grid.grid_y:
                for i in range(len(grid.grid_x) - 1):
                    span = grid.grid_x[i+1] - grid.grid_x[i]
                    tributary = grid.module_y
                    load = floor_load * tributary

                    width, depth, util = self.member_designer.design_beam(span, load)

                    beams.append(Beam(
                        id=f"BX{beam_id}",
                        start=(grid.grid_x[i], y),
                        end=(grid.grid_x[i+1], y),
                        level=level,
                        width=width,
                        depth=depth,
                        material=self.member_designer.material.value,
                        span=span,
                        load=load,
                        utilization=util
                    ))
                    beam_id += 1

            # Y-direction beams
            for x in grid.grid_x:
                for j in range(len(grid.grid_y) - 1):
                    span = grid.grid_y[j+1] - grid.grid_y[j]
                    tributary = grid.module_x
                    load = floor_load * tributary

                    width, depth, util = self.member_designer.design_beam(span, load)

                    beams.append(Beam(
                        id=f"BY{beam_id}",
                        start=(x, grid.grid_y[j]),
                        end=(x, grid.grid_y[j+1]),
                        level=level,
                        width=width,
                        depth=depth,
                        material=self.member_designer.material.value,
                        span=span,
                        load=load,
                        utilization=util
                    ))
                    beam_id += 1

        return beams

    def _design_slabs(self, geometry: Dict, grid_data: Dict) -> List[Slab]:
        """Design floor slabs"""
        slabs = []
        max_span = grid_data["max_span"]

        # Determine slab thickness
        if max_span <= 6:
            thickness = 0.2
            system = "flat_slab"
        elif max_span <= 9:
            thickness = 0.25
            system = "flat_slab"
        else:
            thickness = 0.15
            system = "beam_slab"

        for level in range(geometry["floors"]):
            slabs.append(Slab(
                id=f"S{level}",
                level=level,
                thickness=thickness,
                system=system,
                spans=(grid_data["spans_x"][0], grid_data["spans_y"][0])
            ))

        return slabs

    def _design_walls(self, system: StructuralSystem, geometry: Dict) -> List[Dict]:
        """Design shear walls if needed"""
        walls = []

        if system in [StructuralSystem.SHEAR_WALL, StructuralSystem.CORE_OUTRIGGER]:
            # Add core walls
            core_width = geometry["width"] * 0.15
            core_depth = geometry["depth"] * 0.15

            walls.append({
                "id": "SW1",
                "type": "core",
                "position": (geometry["width"]/2 - core_width/2, geometry["depth"]/2 - core_depth/2),
                "length": core_width,
                "thickness": 0.3,
                "height": geometry["height"]
            })

        return walls

    def _design_foundations(self, columns: List[Column], loads: Dict) -> List[Dict]:
        """Design foundations"""
        foundations = []

        for col in columns:
            # Simplified pad footing
            load = col.load
            bearing = 200  # kN/m² assumed

            area_required = load / bearing
            side = math.sqrt(area_required)
            side = math.ceil(side * 10) / 10

            foundations.append({
                "id": f"F{col.id}",
                "type": "pad",
                "position": col.position,
                "width": max(1.5, side),
                "depth": max(1.5, side),
                "thickness": 0.5
            })

        return foundations

    def _check_conflicts(self, analysis: Dict, model: StructuralModel):
        """Check for conflicts with architectural design"""
        # Check if columns interfere with open spaces
        arch_spaces = analysis.get("constraints", {}).get("column_free_spans", [])

        for col in model.columns:
            for space in arch_spaces:
                if space.get("type") in ["lobby", "open_office", "atrium"]:
                    bounds = space.get("bounds", {})
                    if bounds:
                        if (bounds.get("min_x", 0) < col.position[0] < bounds.get("max_x", 0) and
                            bounds.get("min_y", 0) < col.position[1] < bounds.get("max_y", 0)):
                            self.add_conflict(
                                ConflictType.SPATIAL,
                                ConflictPriority.MEDIUM,
                                "architectural",
                                f"Column {col.id} at ({col.position[0]:.1f}, {col.position[1]:.1f}) "
                                f"conflicts with open space {space.get('id')}",
                                {"x": col.position[0], "y": col.position[1]},
                                [col.id, space.get("id")]
                            )

    def _serialize_column(self, col: Column) -> Dict:
        """Serialize column to dictionary"""
        return {
            "id": col.id,
            "position": {"x": col.position[0], "y": col.position[1]},
            "base_level": col.base_level,
            "top_level": col.top_level,
            "width": col.width,
            "depth": col.depth,
            "material": col.material,
            "load": col.load,
            "utilization": col.utilization
        }

    def _serialize_beam(self, beam: Beam) -> Dict:
        """Serialize beam to dictionary"""
        return {
            "id": beam.id,
            "start": {"x": beam.start[0], "y": beam.start[1]},
            "end": {"x": beam.end[0], "y": beam.end[1]},
            "level": beam.level,
            "width": beam.width,
            "depth": beam.depth,
            "material": beam.material,
            "span": beam.span,
            "utilization": beam.utilization
        }

    def _serialize_slab(self, slab: Slab) -> Dict:
        """Serialize slab to dictionary"""
        return {
            "id": slab.id,
            "level": slab.level,
            "thickness": slab.thickness,
            "system": slab.system,
            "spans": slab.spans
        }

    def _calculate_metrics(self, model: StructuralModel, geometry: Dict) -> Dict[str, float]:
        """Calculate structural metrics"""
        # Steel/concrete quantities
        concrete_volume = 0
        steel_weight = 0

        for col in model.columns:
            height = geometry["height"]
            vol = col.width * col.depth * height
            if model.material == MaterialType.CONCRETE:
                concrete_volume += vol
            else:
                steel_weight += vol * 7850  # kg

        for beam in model.beams:
            vol = beam.width * beam.depth * beam.span
            if model.material == MaterialType.CONCRETE:
                concrete_volume += vol
            else:
                steel_weight += vol * 7850

        for slab in model.slabs:
            area = (max(model.grid.grid_x) - min(model.grid.grid_x)) * \
                   (max(model.grid.grid_y) - min(model.grid.grid_y))
            concrete_volume += area * slab.thickness

        return {
            "concrete_volume": concrete_volume,
            "steel_weight": steel_weight,
            "column_count": len(model.columns),
            "beam_count": len(model.beams),
            "avg_column_utilization": sum(c.utilization for c in model.columns) / max(len(model.columns), 1),
            "avg_beam_utilization": sum(b.utilization for b in model.beams) / max(len(model.beams), 1),
            "max_drift_ratio": model.max_drift,
            "fundamental_period": model.period
        }

    def _generate_geometry(self, model: StructuralModel, geometry: Dict) -> Dict:
        """Generate 3D geometry for visualization"""
        elements = []

        # Columns
        for col in model.columns:
            elements.append({
                "type": "column",
                "id": col.id,
                "bounds": {
                    "min_x": col.position[0] - col.width/2,
                    "max_x": col.position[0] + col.width/2,
                    "min_y": col.position[1] - col.depth/2,
                    "max_y": col.position[1] + col.depth/2,
                    "min_z": 0,
                    "max_z": geometry["height"]
                }
            })

        # Beams (simplified)
        for beam in model.beams:
            z = (beam.level + 1) * geometry["floor_height"]
            elements.append({
                "type": "beam",
                "id": beam.id,
                "bounds": {
                    "min_x": min(beam.start[0], beam.end[0]),
                    "max_x": max(beam.start[0], beam.end[0]),
                    "min_y": min(beam.start[1], beam.end[1]) - beam.width/2,
                    "max_y": max(beam.start[1], beam.end[1]) + beam.width/2,
                    "min_z": z - beam.depth,
                    "max_z": z
                }
            })

        return {
            "elements": elements,
            "grid": {
                "x": model.grid.grid_x,
                "y": model.grid.grid_y
            }
        }

    def _optimize_for_cost(self, design: Dict) -> Dict:
        """Optimize for cost"""
        # Reduce over-designed members
        for col in design.get("columns", []):
            if col.get("utilization", 0) < 0.6:
                col["optimization_note"] = "Consider reducing size"
        return design

    def _optimize_for_weight(self, design: Dict) -> Dict:
        """Optimize for weight"""
        for beam in design.get("beams", []):
            if beam.get("utilization", 0) < 0.5:
                beam["optimization_note"] = "Consider lighter section"
        return design

    def _optimize_for_stiffness(self, design: Dict) -> Dict:
        """Optimize for stiffness"""
        if design.get("analysis", {}).get("max_drift_ratio", 0) > 0.01:
            design["optimization_note"] = "Consider additional bracing or wall"
        return design
