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
# Space Adjacency Rules
# ============================================================================

ADJACENCY_RULES = {
    # Space types that should be adjacent to each other
    "requires_adjacency": {
        "lobby": ["reception", "waiting", "elevator", "core"],
        "reception": ["lobby", "waiting"],
        "waiting": ["lobby", "reception"],
        "open_office": ["meeting_room", "private_office", "support"],
        "private_office": ["open_office", "meeting_room"],
        "meeting_room": ["open_office", "private_office", "corridor"],
        "support": ["open_office", "corridor"],
        "break_room": ["open_office", "support"],
        "kitchen": ["dining", "storage", "service"],
        "dining": ["kitchen", "lobby"],
        "restaurant": ["kitchen", "lobby"],
        "retail": ["lobby", "storage"],
        "storage": ["service", "loading"],
        "service": ["core", "storage", "loading"],
        "guest_room": ["corridor", "elevator"],
        "apartment": ["corridor", "elevator"],
        "corridor": ["core", "elevator", "stairs"],
        "elevator": ["core", "lobby", "corridor"],
        "stairs": ["core", "corridor"],
    },
    # Space types that should NOT be adjacent
    "avoid_adjacency": {
        "lobby": ["service", "storage", "mechanical"],
        "reception": ["service", "storage", "toilet"],
        "open_office": ["mechanical", "toilet", "storage"],
        "private_office": ["toilet", "mechanical", "loading"],
        "meeting_room": ["mechanical", "toilet", "loading"],
        "guest_room": ["mechanical", "service", "loading"],
        "apartment": ["mechanical", "service", "loading"],
        "restaurant": ["toilet", "mechanical", "loading"],
        "retail": ["mechanical", "loading"],
        "dining": ["toilet", "mechanical"],
    },
    # Priority scores for placement (higher = place first, closer to core)
    "placement_priority": {
        "core": 100,
        "elevator": 95,
        "stairs": 90,
        "lobby": 85,
        "reception": 80,
        "corridor": 75,
        "service": 70,
        "meeting_room": 60,
        "private_office": 55,
        "open_office": 50,
        "support": 45,
        "break_room": 40,
        "storage": 35,
        "toilet": 30,
        "mechanical": 25,
    }
}


# ============================================================================
# Clash Detection System
# ============================================================================

@dataclass
class Clash:
    """Represents a detected clash/conflict in the design"""
    id: str
    clash_type: str  # "space_overlap", "boundary_violation", "structural_conflict", "adjacency_violation", "mep_conflict"
    severity: str  # "critical", "major", "minor", "warning"
    description: str
    elements: List[str]  # IDs of elements involved
    location: Optional[Dict[str, float]] = None  # x, y, z coordinates
    overlap_area: Optional[float] = None  # Area of overlap in m²
    resolution_hint: Optional[str] = None


class ClashDetector:
    """Detects and reports clashes/conflicts in architectural designs"""

    # Clash severity thresholds
    CRITICAL_OVERLAP_THRESHOLD = 1.0  # m² - overlaps larger than this are critical
    MAJOR_OVERLAP_THRESHOLD = 0.5  # m² - overlaps larger than this are major
    BOUNDARY_TOLERANCE = 0.1  # m - tolerance for boundary checks

    def __init__(self):
        self.clashes: List[Clash] = []
        self._clash_counter = 0

    def _generate_clash_id(self) -> str:
        """Generate unique clash ID"""
        self._clash_counter += 1
        return f"CLASH_{self._clash_counter:04d}"

    def detect_all_clashes(
        self,
        design: Dict[str, Any],
        structural: Optional[Dict[str, Any]] = None,
        mep: Optional[Dict[str, Any]] = None
    ) -> List[Clash]:
        """Run all clash detection checks and return comprehensive report"""
        self.clashes = []
        self._clash_counter = 0

        # Check each floor plan
        for floor_plan in design.get("floor_plans", []):
            self._detect_space_overlaps(floor_plan)
            self._detect_boundary_violations(floor_plan)
            self._detect_adjacency_violations(floor_plan)

            if structural:
                self._detect_structural_conflicts(floor_plan, structural)

            if mep:
                self._detect_mep_conflicts(floor_plan, mep)

        # Sort by severity
        severity_order = {"critical": 0, "major": 1, "minor": 2, "warning": 3}
        self.clashes.sort(key=lambda c: severity_order.get(c.severity, 4))

        return self.clashes

    def _detect_space_overlaps(self, floor_plan: Dict[str, Any]) -> None:
        """Detect overlapping spaces on a floor"""
        spaces = [s for s in floor_plan.get("spaces", []) if s.get("bounds")]
        floor_level = floor_plan.get("floor_level", 0)

        for i in range(len(spaces)):
            for j in range(i + 1, len(spaces)):
                space_a = spaces[i]
                space_b = spaces[j]

                overlap = self._calculate_overlap(
                    space_a.get("bounds", {}),
                    space_b.get("bounds", {})
                )

                if overlap and overlap > 0.01:  # More than 1cm² overlap
                    # Determine severity based on overlap area
                    if overlap > self.CRITICAL_OVERLAP_THRESHOLD:
                        severity = "critical"
                    elif overlap > self.MAJOR_OVERLAP_THRESHOLD:
                        severity = "major"
                    else:
                        severity = "minor"

                    self.clashes.append(Clash(
                        id=self._generate_clash_id(),
                        clash_type="space_overlap",
                        severity=severity,
                        description=f"Space overlap ({overlap:.2f} m²) between "
                                    f"{space_a.get('name', space_a.get('id'))} and "
                                    f"{space_b.get('name', space_b.get('id'))} on floor {floor_level}",
                        elements=[space_a.get("id", ""), space_b.get("id", "")],
                        location=self._get_overlap_center(space_a.get("bounds"), space_b.get("bounds")),
                        overlap_area=overlap,
                        resolution_hint="Reduce size of one space or relocate to eliminate overlap"
                    ))

    def _detect_boundary_violations(self, floor_plan: Dict[str, Any]) -> None:
        """Detect spaces extending beyond floor boundaries"""
        plan_width = floor_plan.get("width", 0)
        plan_depth = floor_plan.get("depth", 0)
        floor_level = floor_plan.get("floor_level", 0)

        for space in floor_plan.get("spaces", []):
            bounds = space.get("bounds", {})
            if not bounds:
                continue

            min_x = bounds.get("min_x", 0)
            max_x = bounds.get("max_x", 0)
            min_y = bounds.get("min_y", 0)
            max_y = bounds.get("max_y", 0)

            violations = []
            if min_x < -self.BOUNDARY_TOLERANCE:
                violations.append(f"extends {abs(min_x):.2f}m beyond west boundary")
            if min_y < -self.BOUNDARY_TOLERANCE:
                violations.append(f"extends {abs(min_y):.2f}m beyond south boundary")
            if max_x > plan_width + self.BOUNDARY_TOLERANCE:
                violations.append(f"extends {max_x - plan_width:.2f}m beyond east boundary")
            if max_y > plan_depth + self.BOUNDARY_TOLERANCE:
                violations.append(f"extends {max_y - plan_depth:.2f}m beyond north boundary")

            if violations:
                self.clashes.append(Clash(
                    id=self._generate_clash_id(),
                    clash_type="boundary_violation",
                    severity="major",
                    description=f"Space {space.get('name', space.get('id'))} on floor {floor_level} "
                                f"{'; '.join(violations)}",
                    elements=[space.get("id", "")],
                    location={"x": (min_x + max_x) / 2, "y": (min_y + max_y) / 2, "z": floor_level * 3.6},
                    resolution_hint="Relocate space within floor boundaries or reduce size"
                ))

    def _detect_adjacency_violations(self, floor_plan: Dict[str, Any]) -> None:
        """Detect spaces that violate adjacency rules (are adjacent when they shouldn't be)"""
        spaces = [s for s in floor_plan.get("spaces", []) if s.get("bounds")]
        floor_level = floor_plan.get("floor_level", 0)
        avoid_adj = ADJACENCY_RULES.get("avoid_adjacency", {})

        for i in range(len(spaces)):
            for j in range(i + 1, len(spaces)):
                space_a = spaces[i]
                space_b = spaces[j]

                # Check if spaces are adjacent (within 0.5m of each other)
                if not self._are_adjacent(space_a.get("bounds"), space_b.get("bounds")):
                    continue

                type_a = (space_a.get("type") or "").lower()
                type_b = (space_b.get("type") or "").lower()

                # Check if this adjacency should be avoided
                avoid_list_a = avoid_adj.get(type_a, [])
                avoid_list_b = avoid_adj.get(type_b, [])

                if type_b in avoid_list_a or type_a in avoid_list_b:
                    self.clashes.append(Clash(
                        id=self._generate_clash_id(),
                        clash_type="adjacency_violation",
                        severity="warning",
                        description=f"Undesirable adjacency: {space_a.get('name', type_a)} is adjacent to "
                                    f"{space_b.get('name', type_b)} on floor {floor_level}",
                        elements=[space_a.get("id", ""), space_b.get("id", "")],
                        location=self._get_overlap_center(space_a.get("bounds"), space_b.get("bounds")),
                        resolution_hint=f"Consider separating {type_a} from {type_b} with buffer space or corridor"
                    ))

    def _detect_structural_conflicts(
        self,
        floor_plan: Dict[str, Any],
        structural: Dict[str, Any]
    ) -> None:
        """Detect conflicts between spaces and structural elements"""
        floor_level = floor_plan.get("floor_level", 0)
        columns = structural.get("columns", [])

        for space in floor_plan.get("spaces", []):
            bounds = space.get("bounds", {})
            if not bounds:
                continue

            # Check if columns fall inside spaces in problematic locations
            for col in columns:
                col_pos = col.get("position", {})
                col_x = col_pos.get("x", 0)
                col_y = col_pos.get("y", 0)
                col_w = col.get("width", 0.4)
                col_d = col.get("depth", 0.4)

                # Check if column is inside space
                if (bounds.get("min_x", 0) < col_x < bounds.get("max_x", 0) and
                    bounds.get("min_y", 0) < col_y < bounds.get("max_y", 0)):

                    # Columns near edges are usually OK, columns in center may be problematic
                    space_center_x = (bounds.get("min_x", 0) + bounds.get("max_x", 0)) / 2
                    space_center_y = (bounds.get("min_y", 0) + bounds.get("max_y", 0)) / 2
                    dist_from_center = math.sqrt((col_x - space_center_x)**2 + (col_y - space_center_y)**2)
                    space_size = min(
                        bounds.get("max_x", 0) - bounds.get("min_x", 0),
                        bounds.get("max_y", 0) - bounds.get("min_y", 0)
                    )

                    # If column is in the central 50% of the space, it may obstruct use
                    if dist_from_center < space_size * 0.25:
                        self.clashes.append(Clash(
                            id=self._generate_clash_id(),
                            clash_type="structural_conflict",
                            severity="minor",
                            description=f"Column {col.get('id', '')} ({col_w:.1f}x{col_d:.1f}m) is centrally located "
                                        f"inside {space.get('name', space.get('id'))} on floor {floor_level}",
                            elements=[space.get("id", ""), col.get("id", "")],
                            location={"x": col_x, "y": col_y, "z": floor_level * 3.6},
                            resolution_hint="Consider adjusting space boundaries to place column at edge"
                        ))

    def _detect_mep_conflicts(
        self,
        floor_plan: Dict[str, Any],
        mep: Dict[str, Any]
    ) -> None:
        """Detect MEP routing conflicts"""
        floor_level = floor_plan.get("floor_level", 0)

        # Check HVAC ductwork routing
        hvac = mep.get("hvac", {})
        ductwork = hvac.get("ductwork", [])

        # Check for duct intersections (simplified - just check if ducts cross)
        for i, duct_a in enumerate(ductwork):
            for j, duct_b in enumerate(ductwork[i+1:], i+1):
                if self._ducts_intersect(duct_a, duct_b):
                    self.clashes.append(Clash(
                        id=self._generate_clash_id(),
                        clash_type="mep_conflict",
                        severity="minor",
                        description=f"HVAC duct intersection detected on floor {floor_level}",
                        elements=[duct_a.get("id", f"duct_{i}"), duct_b.get("id", f"duct_{j}")],
                        resolution_hint="Route ducts at different elevations or reroute to avoid intersection"
                    ))

    def _calculate_overlap(self, bounds_a: Dict, bounds_b: Dict) -> Optional[float]:
        """Calculate overlap area between two rectangular bounds"""
        if not bounds_a or not bounds_b:
            return None

        # Calculate overlap in x and y dimensions
        overlap_x = max(0, min(bounds_a.get("max_x", 0), bounds_b.get("max_x", 0)) -
                        max(bounds_a.get("min_x", 0), bounds_b.get("min_x", 0)))
        overlap_y = max(0, min(bounds_a.get("max_y", 0), bounds_b.get("max_y", 0)) -
                        max(bounds_a.get("min_y", 0), bounds_b.get("min_y", 0)))

        return overlap_x * overlap_y if overlap_x > 0 and overlap_y > 0 else None

    def _get_overlap_center(self, bounds_a: Dict, bounds_b: Dict) -> Optional[Dict[str, float]]:
        """Get the center point of overlap region"""
        if not bounds_a or not bounds_b:
            return None

        center_x = (max(bounds_a.get("min_x", 0), bounds_b.get("min_x", 0)) +
                    min(bounds_a.get("max_x", 0), bounds_b.get("max_x", 0))) / 2
        center_y = (max(bounds_a.get("min_y", 0), bounds_b.get("min_y", 0)) +
                    min(bounds_a.get("max_y", 0), bounds_b.get("max_y", 0))) / 2

        return {"x": center_x, "y": center_y, "z": 0}

    def _are_adjacent(self, bounds_a: Dict, bounds_b: Dict, tolerance: float = 0.5) -> bool:
        """Check if two spaces are adjacent (share an edge or are very close)"""
        if not bounds_a or not bounds_b:
            return False

        # Check horizontal adjacency
        horiz_adj = (
            abs(bounds_a.get("max_x", 0) - bounds_b.get("min_x", 0)) <= tolerance or
            abs(bounds_b.get("max_x", 0) - bounds_a.get("min_x", 0)) <= tolerance
        )
        horiz_overlap = not (
            bounds_a.get("max_y", 0) <= bounds_b.get("min_y", 0) or
            bounds_a.get("min_y", 0) >= bounds_b.get("max_y", 0)
        )

        # Check vertical adjacency
        vert_adj = (
            abs(bounds_a.get("max_y", 0) - bounds_b.get("min_y", 0)) <= tolerance or
            abs(bounds_b.get("max_y", 0) - bounds_a.get("min_y", 0)) <= tolerance
        )
        vert_overlap = not (
            bounds_a.get("max_x", 0) <= bounds_b.get("min_x", 0) or
            bounds_a.get("min_x", 0) >= bounds_b.get("max_x", 0)
        )

        return (horiz_adj and horiz_overlap) or (vert_adj and vert_overlap)

    def _ducts_intersect(self, duct_a: Dict, duct_b: Dict) -> bool:
        """Check if two ducts intersect (simplified 2D check)"""
        start_a = duct_a.get("start", {})
        end_a = duct_a.get("end", {})
        start_b = duct_b.get("start", {})
        end_b = duct_b.get("end", {})

        # Simplified: check if line segments intersect
        # Using cross product method
        def ccw(A, B, C):
            return (C.get("y", 0) - A.get("y", 0)) * (B.get("x", 0) - A.get("x", 0)) > \
                   (B.get("y", 0) - A.get("y", 0)) * (C.get("x", 0) - A.get("x", 0))

        return (ccw(start_a, start_b, end_b) != ccw(end_a, start_b, end_b) and
                ccw(start_a, end_a, start_b) != ccw(start_a, end_a, end_b))

    def get_clash_summary(self) -> Dict[str, Any]:
        """Get summary statistics of detected clashes"""
        summary = {
            "total_clashes": len(self.clashes),
            "by_severity": {
                "critical": len([c for c in self.clashes if c.severity == "critical"]),
                "major": len([c for c in self.clashes if c.severity == "major"]),
                "minor": len([c for c in self.clashes if c.severity == "minor"]),
                "warning": len([c for c in self.clashes if c.severity == "warning"]),
            },
            "by_type": {
                "space_overlap": len([c for c in self.clashes if c.clash_type == "space_overlap"]),
                "boundary_violation": len([c for c in self.clashes if c.clash_type == "boundary_violation"]),
                "adjacency_violation": len([c for c in self.clashes if c.clash_type == "adjacency_violation"]),
                "structural_conflict": len([c for c in self.clashes if c.clash_type == "structural_conflict"]),
                "mep_conflict": len([c for c in self.clashes if c.clash_type == "mep_conflict"]),
            },
            "clash_free_percentage": 100.0 if not self.clashes else max(0, 100 - len(self.clashes) * 2),
        }
        return summary

    def to_report(self) -> str:
        """Generate human-readable clash report"""
        if not self.clashes:
            return "No clashes detected. Design is clash-free."

        lines = [
            "=" * 60,
            "CLASH DETECTION REPORT",
            "=" * 60,
            ""
        ]

        summary = self.get_clash_summary()
        lines.extend([
            f"Total Clashes: {summary['total_clashes']}",
            f"  Critical: {summary['by_severity']['critical']}",
            f"  Major: {summary['by_severity']['major']}",
            f"  Minor: {summary['by_severity']['minor']}",
            f"  Warning: {summary['by_severity']['warning']}",
            "",
            "-" * 60,
            "DETAILED CLASH LIST",
            "-" * 60,
            ""
        ])

        for clash in self.clashes:
            lines.extend([
                f"[{clash.id}] {clash.severity.upper()} - {clash.clash_type}",
                f"  {clash.description}",
                f"  Elements: {', '.join(clash.elements)}",
            ])
            if clash.location:
                lines.append(f"  Location: ({clash.location['x']:.1f}, {clash.location['y']:.1f})")
            if clash.overlap_area:
                lines.append(f"  Overlap Area: {clash.overlap_area:.2f} m²")
            if clash.resolution_hint:
                lines.append(f"  Hint: {clash.resolution_hint}")
            lines.append("")

        return "\n".join(lines)


# ============================================================================
# Floor Plan Generator
# ============================================================================

class FloorPlanGenerator:
    """Generates optimized floor plans using graph-based space planning"""

    def __init__(self, building_program: Dict[str, Any], constraints: Dict[str, Any]):
        self.program = building_program
        self.constraints = constraints
        self.building_type = self._normalize_building_type(
            self.program.get("type", "office")
        )
        region = constraints.get("region", "international")
        if region not in BUILDING_CODES:
            region = "international"
        self.code = BUILDING_CODES[region]

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

    def _normalize_building_type(self, building_type: str) -> str:
        value = (building_type or "").strip().lower()
        if not value:
            return "office"
        if "residential" in value or "apartment" in value or "housing" in value:
            return "residential"
        if "hotel" in value or "hospitality" in value:
            return "hotel"
        if "mixed" in value:
            return "mixed_use"
        if "commercial" in value or "office" in value or "business" in value:
            return "office"
        if "retail" in value or "mall" in value:
            return "mixed_use"
        return value

    def _snap_to_grid(self, value: float, grid: List[float], mode: str = "nearest") -> float:
        if not grid:
            return value
        if mode == "floor":
            candidates = [g for g in grid if g <= value]
            return max(candidates) if candidates else min(grid)
        if mode == "ceil":
            candidates = [g for g in grid if g >= value]
            return min(candidates) if candidates else max(grid)
        return min(grid, key=lambda g: abs(g - value))

    def _place_core(self, plan: FloorPlan) -> BuildingCore:
        """Place building core optimally"""
        # Core typically 10-15% of floor area
        core_ratio = self.constraints.get("core_ratio", 0.12)
        core_area = plan.width * plan.depth * core_ratio

        # Core dimensions (roughly square)
        core_width = math.sqrt(core_area * 0.8)  # slightly wider
        core_depth = core_area / core_width

        module_x = plan.grid_x[1] - plan.grid_x[0] if len(plan.grid_x) > 1 else plan.width / 4
        module_y = plan.grid_y[1] - plan.grid_y[0] if len(plan.grid_y) > 1 else plan.depth / 4
        module_x = max(module_x, 1.0)
        module_y = max(module_y, 1.0)
        core_width = max(module_x, round(core_width / module_x) * module_x)
        core_depth = max(module_y, round(core_depth / module_y) * module_y)

        # Position core (center or offset based on building type)
        building_type = self.building_type

        if building_type in ["residential", "hotel"]:
            # Center core for residential
            pos_x = (plan.width - core_width) / 2
            pos_y = (plan.depth - core_depth) / 2
        else:
            # Offset core for offices (better daylight)
            pos_x = (plan.width - core_width) / 2
            pos_y = plan.depth * 0.4  # offset towards back

        pos_x = self._snap_to_grid(pos_x, plan.grid_x, "nearest")
        pos_y = self._snap_to_grid(pos_y, plan.grid_y, "nearest")
        max_x = max(plan.width - core_width - 0.5, 0.5)
        max_y = max(plan.depth - core_depth - 0.5, 0.5)
        if pos_x > max_x:
            pos_x = self._snap_to_grid(max_x, plan.grid_x, "floor")
        if pos_y > max_y:
            pos_y = self._snap_to_grid(max_y, plan.grid_y, "floor")
        pos_x = max(pos_x, 0.5)
        pos_y = max(pos_y, 0.5)

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

    def _segment_grid(
        self,
        grid: List[float],
        min_val: float,
        max_val: float,
        min_span: float
    ) -> List[Tuple[float, float]]:
        """Create merged grid segments within bounds"""
        if max_val <= min_val:
            return []
        clipped = [g for g in grid if min_val <= g <= max_val]
        if not clipped or clipped[0] > min_val:
            clipped = [min_val] + clipped
        if clipped[-1] < max_val:
            clipped.append(max_val)
        clipped = sorted(set(clipped))
        segments = [(clipped[i], clipped[i + 1]) for i in range(len(clipped) - 1)]
        merged: List[Tuple[float, float]] = []
        start = None
        span = 0.0
        for seg_start, seg_end in segments:
            if start is None:
                start = seg_start
            span += seg_end - seg_start
            if span >= min_span:
                merged.append((start, seg_end))
                start = None
                span = 0.0
        if start is not None:
            merged.append((start, max_val))
        return merged

    def _create_space(
        self,
        spaces: List[Space],
        space_id: str,
        name: str,
        space_type: str,
        floor_level: int,
        min_x: float,
        min_y: float,
        max_x: float,
        max_y: float,
        requires_daylight: bool = False,
    ) -> None:
        width = max(max_x - min_x, 0.0)
        depth = max(max_y - min_y, 0.0)
        if width < 0.6 or depth < 0.6:
            return
        area = width * depth
        space = Space(
            id=space_id,
            name=name,
            type=space_type,
            area=area,
            requires_daylight=requires_daylight,
            floor_level=floor_level,
            bounds={
                "min_x": min_x,
                "max_x": max_x,
                "min_y": min_y,
                "max_y": max_y,
            }
        )
        if SHAPELY_AVAILABLE:
            space.polygon = box(min_x, min_y, max_x, max_y)
        spaces.append(space)

    def _compute_corridor_ring(
        self,
        plan: FloorPlan,
        corridor_width: float,
    ) -> Optional[Tuple[float, float, float, float]]:
        if not plan.core:
            return None
        core_x, core_y = plan.core.position
        core_w = plan.core.width
        core_d = plan.core.depth

        ring_x0 = self._snap_to_grid(core_x - corridor_width, plan.grid_x, "floor")
        ring_y0 = self._snap_to_grid(core_y - corridor_width, plan.grid_y, "floor")
        ring_x1 = self._snap_to_grid(core_x + core_w + corridor_width, plan.grid_x, "ceil")
        ring_y1 = self._snap_to_grid(core_y + core_d + corridor_width, plan.grid_y, "ceil")

        ring_x0 = max(0.5, ring_x0)
        ring_y0 = max(0.5, ring_y0)
        ring_x1 = min(plan.width - 0.5, ring_x1)
        ring_y1 = min(plan.depth - 0.5, ring_y1)

        if ring_x1 - ring_x0 < corridor_width * 1.4:
            return None
        if ring_y1 - ring_y0 < corridor_width * 1.4:
            return None
        return ring_x0, ring_y0, ring_x1, ring_y1

    def _add_corridor_ring(
        self,
        spaces: List[Space],
        plan: FloorPlan,
        floor_level: int,
        ring: Tuple[float, float, float, float],
    ) -> None:
        if not plan.core:
            return
        ring_x0, ring_y0, ring_x1, ring_y1 = ring
        core_x, core_y = plan.core.position
        core_w = plan.core.width
        core_d = plan.core.depth
        self._create_space(
            spaces,
            f"corridor_bottom_{floor_level}",
            f"corridor_{floor_level}_bottom",
            "corridor",
            floor_level,
            ring_x0,
            ring_y0,
            ring_x1,
            core_y,
            False,
        )
        self._create_space(
            spaces,
            f"corridor_top_{floor_level}",
            f"corridor_{floor_level}_top",
            "corridor",
            floor_level,
            ring_x0,
            core_y + core_d,
            ring_x1,
            ring_y1,
            False,
        )
        self._create_space(
            spaces,
            f"corridor_left_{floor_level}",
            f"corridor_{floor_level}_left",
            "corridor",
            floor_level,
            ring_x0,
            core_y,
            core_x,
            core_y + core_d,
            False,
        )
        self._create_space(
            spaces,
            f"corridor_right_{floor_level}",
            f"corridor_{floor_level}_right",
            "corridor",
            floor_level,
            core_x + core_w,
            core_y,
            ring_x1,
            core_y + core_d,
            False,
        )

    def _layout_residential(self, plan: FloorPlan, floor_level: int) -> List[Space]:
        """Generate a corridor + perimeter unit layout for residential/hospitality."""
        spaces: List[Space] = []
        width = plan.width
        depth = plan.depth
        core = plan.core
        unit_type = "guest_room" if self.program.get("type") == "hotel" else "apartment"

        if not core:
            return spaces

        corridor_width = max(self.code["min_corridor_width"], 1.6)
        core_x, core_y = core.position
        core_w = core.width
        core_d = core.depth

        ring_x0 = self._snap_to_grid(core_x - corridor_width, plan.grid_x, "floor")
        ring_y0 = self._snap_to_grid(core_y - corridor_width, plan.grid_y, "floor")
        ring_x1 = self._snap_to_grid(core_x + core_w + corridor_width, plan.grid_x, "ceil")
        ring_y1 = self._snap_to_grid(core_y + core_d + corridor_width, plan.grid_y, "ceil")
        ring_x0 = max(0.5, ring_x0)
        ring_y0 = max(0.5, ring_y0)
        ring_x1 = min(width - 0.5, ring_x1)
        ring_y1 = min(depth - 0.5, ring_y1)

        # Corridor ring segments
        self._create_space(
            spaces,
            f"corridor_bottom_{floor_level}",
            f"corridor_{floor_level}_bottom",
            "corridor",
            floor_level,
            ring_x0,
            ring_y0,
            ring_x1,
            core_y,
            False,
        )
        self._create_space(
            spaces,
            f"corridor_top_{floor_level}",
            f"corridor_{floor_level}_top",
            "corridor",
            floor_level,
            ring_x0,
            core_y + core_d,
            ring_x1,
            ring_y1,
            False,
        )
        self._create_space(
            spaces,
            f"corridor_left_{floor_level}",
            f"corridor_{floor_level}_left",
            "corridor",
            floor_level,
            ring_x0,
            core_y,
            core_x,
            core_y + core_d,
            False,
        )
        self._create_space(
            spaces,
            f"corridor_right_{floor_level}",
            f"corridor_{floor_level}_right",
            "corridor",
            floor_level,
            core_x + core_w,
            core_y,
            ring_x1,
            core_y + core_d,
            False,
        )

        # Service rooms (place in perimeter corners to avoid corridor overlap)
        service_size = min(max(corridor_width * 1.1, 1.4), 2.0)
        south_band = ring_y0 - 0.5
        north_band = depth - 0.5 - ring_y1
        west_band = ring_x0 - 0.5
        east_band = width - 0.5 - ring_x1
        south_unit_min_x = 0.5
        north_unit_max_x = width - 0.5

        if south_band >= service_size and west_band >= service_size:
            self._create_space(
                spaces,
                f"service_{floor_level}_1",
                f"service_{floor_level}_1",
                "service",
                floor_level,
                0.5,
                0.5,
                0.5 + service_size,
                0.5 + service_size,
                False,
            )
            south_unit_min_x = 0.5 + service_size

        if north_band >= service_size and east_band >= service_size:
            self._create_space(
                spaces,
                f"service_{floor_level}_2",
                f"service_{floor_level}_2",
                "service",
                floor_level,
                width - 0.5 - service_size,
                depth - 0.5 - service_size,
                width - 0.5,
                depth - 0.5,
                False,
            )
            north_unit_max_x = width - 0.5 - service_size

        # Perimeter apartment bands around the ring
        min_unit = 4.2

        # North band
        if depth - ring_y1 >= 2.8:
            for idx, (x0, x1) in enumerate(
                self._segment_grid(plan.grid_x, 0.5, north_unit_max_x, min_unit)
            ):
                self._create_space(
                    spaces,
                    f"unit_n_{floor_level}_{idx}",
                    f"unit_n_{idx + 1}",
                    unit_type,
                    floor_level,
                    x0,
                    ring_y1,
                    x1,
                    depth - 0.5,
                    True,
                )

        # South band
        if ring_y0 - 0.5 >= 2.8:
            for idx, (x0, x1) in enumerate(
                self._segment_grid(plan.grid_x, south_unit_min_x, width - 0.5, min_unit)
            ):
                self._create_space(
                    spaces,
                    f"unit_s_{floor_level}_{idx}",
                    f"unit_s_{idx + 1}",
                    unit_type,
                    floor_level,
                    x0,
                    0.5,
                    x1,
                    ring_y0,
                    True,
                )

        # West band
        if ring_x0 - 0.5 >= 2.8:
            for idx, (y0, y1) in enumerate(
                self._segment_grid(plan.grid_y, ring_y0, ring_y1, min_unit)
            ):
                self._create_space(
                    spaces,
                    f"unit_w_{floor_level}_{idx}",
                    f"unit_w_{idx + 1}",
                    unit_type,
                    floor_level,
                    0.5,
                    y0,
                    ring_x0,
                    y1,
                    True,
                )

        # East band
        if width - ring_x1 >= 2.8:
            for idx, (y0, y1) in enumerate(
                self._segment_grid(plan.grid_y, ring_y0, ring_y1, min_unit)
            ):
                self._create_space(
                    spaces,
                    f"unit_e_{floor_level}_{idx}",
                    f"unit_e_{idx + 1}",
                    unit_type,
                    floor_level,
                    ring_x1,
                    y0,
                    width - 0.5,
                    y1,
                    True,
                )

        return spaces

    def _layout_office(self, plan: FloorPlan, floor_level: int) -> List[Space]:
        """Generate a corridor ring with perimeter office zones."""
        spaces: List[Space] = []
        if not plan.core:
            return spaces

        corridor_width = max(self.code["min_corridor_width"], 1.8)
        ring = self._compute_corridor_ring(plan, corridor_width)
        if not ring:
            return self._distribute_programmatic(plan, floor_level, "office")

        ring_x0, ring_y0, ring_x1, ring_y1 = ring
        self._add_corridor_ring(spaces, plan, floor_level, ring)

        width = plan.width
        depth = plan.depth
        open_min = 6.0 if max(width, depth) > 32 else 5.0
        side_min = 3.4
        meeting_min = 4.2

        counts: Dict[str, int] = {}

        def add_space(
            space_type: str,
            min_x: float,
            min_y: float,
            max_x: float,
            max_y: float,
            daylight: bool,
            label: Optional[str] = None,
        ) -> None:
            counts[space_type] = counts.get(space_type, 0) + 1
            idx = counts[space_type]
            name = label or f"{space_type.replace('_', ' ').title()} {idx}"
            self._create_space(
                spaces,
                f"{space_type}_{floor_level}_{idx}",
                name,
                space_type,
                floor_level,
                min_x,
                min_y,
                max_x,
                max_y,
                daylight,
            )

        south_depth = ring_y0 - 0.5
        if south_depth >= 3.0:
            if floor_level == 0:
                lobby_width = min(width * 0.35, width - 2.0)
                lobby_width = max(lobby_width, open_min)
                lobby_x0 = max(0.5, (width - lobby_width) / 2)
                lobby_x1 = min(width - 0.5, lobby_x0 + lobby_width)
                add_space(
                    "lobby",
                    lobby_x0,
                    0.5,
                    lobby_x1,
                    ring_y0,
                    True,
                    "Lobby",
                )
                if lobby_x0 - 0.5 >= open_min:
                    for x0, x1 in self._segment_grid(plan.grid_x, 0.5, lobby_x0, open_min):
                        add_space("retail", x0, 0.5, x1, ring_y0, True, "Retail")
                if width - 0.5 - lobby_x1 >= open_min:
                    for x0, x1 in self._segment_grid(plan.grid_x, lobby_x1, width - 0.5, open_min):
                        add_space("retail", x0, 0.5, x1, ring_y0, True, "Retail")
            else:
                for x0, x1 in self._segment_grid(plan.grid_x, 0.5, width - 0.5, open_min):
                    add_space("open_office", x0, 0.5, x1, ring_y0, True, "Open Office")

        north_depth = depth - 0.5 - ring_y1
        if north_depth >= 3.0:
            if floor_level == 0:
                for x0, x1 in self._segment_grid(plan.grid_x, 0.5, width - 0.5, 4.2):
                    add_space("service", x0, ring_y1, x1, depth - 0.5, False, "Service")
            else:
                for x0, x1 in self._segment_grid(plan.grid_x, 0.5, width - 0.5, open_min):
                    add_space("open_office", x0, ring_y1, x1, depth - 0.5, True, "Open Office")

        if ring_x0 - 0.5 >= side_min:
            type_cycle = ["meeting_room", "private_office", "support"]
            for idx, (y0, y1) in enumerate(
                self._segment_grid(plan.grid_y, ring_y0, ring_y1, meeting_min)
            ):
                space_type = type_cycle[idx % len(type_cycle)]
                daylight = space_type in {"meeting_room", "private_office"}
                label = "Meeting Room" if space_type == "meeting_room" else None
                add_space(space_type, 0.5, y0, ring_x0, y1, daylight, label)

        if width - ring_x1 >= side_min:
            type_cycle = ["private_office", "meeting_room", "support"]
            for idx, (y0, y1) in enumerate(
                self._segment_grid(plan.grid_y, ring_y0, ring_y1, meeting_min)
            ):
                space_type = type_cycle[idx % len(type_cycle)]
                daylight = space_type in {"meeting_room", "private_office"}
                label = "Meeting Room" if space_type == "meeting_room" else None
                add_space(space_type, ring_x1, y0, width - 0.5, y1, daylight, label)

        return spaces

    def _layout_mixed_use_ground(self, plan: FloorPlan, floor_level: int) -> List[Space]:
        """Ground floor with retail, lobby, and service zones for mixed-use."""
        spaces: List[Space] = []
        if not plan.core:
            return spaces

        corridor_width = max(self.code["min_corridor_width"], 1.8)
        ring = self._compute_corridor_ring(plan, corridor_width)
        if not ring:
            return self._distribute_programmatic(plan, floor_level, "mixed_use")

        ring_x0, ring_y0, ring_x1, ring_y1 = ring
        self._add_corridor_ring(spaces, plan, floor_level, ring)

        width = plan.width
        depth = plan.depth
        retail_min = 5.5

        counts: Dict[str, int] = {}

        def add_space(
            space_type: str,
            min_x: float,
            min_y: float,
            max_x: float,
            max_y: float,
            daylight: bool,
            label: Optional[str] = None,
        ) -> None:
            counts[space_type] = counts.get(space_type, 0) + 1
            idx = counts[space_type]
            name = label or f"{space_type.replace('_', ' ').title()} {idx}"
            self._create_space(
                spaces,
                f"{space_type}_{floor_level}_{idx}",
                name,
                space_type,
                floor_level,
                min_x,
                min_y,
                max_x,
                max_y,
                daylight,
            )

        south_depth = ring_y0 - 0.5
        if south_depth >= 3.0:
            lobby_width = min(width * 0.28, width - 2.0)
            lobby_width = max(lobby_width, retail_min)
            lobby_x0 = max(0.5, (width - lobby_width) / 2)
            lobby_x1 = min(width - 0.5, lobby_x0 + lobby_width)
            add_space("lobby", lobby_x0, 0.5, lobby_x1, ring_y0, True, "Lobby")
            if lobby_x0 - 0.5 >= retail_min:
                for x0, x1 in self._segment_grid(plan.grid_x, 0.5, lobby_x0, retail_min):
                    add_space("retail", x0, 0.5, x1, ring_y0, True, "Retail")
            if width - 0.5 - lobby_x1 >= retail_min:
                for x0, x1 in self._segment_grid(plan.grid_x, lobby_x1, width - 0.5, retail_min):
                    add_space("retail", x0, 0.5, x1, ring_y0, True, "Retail")

        north_depth = depth - 0.5 - ring_y1
        if north_depth >= 3.0:
            for x0, x1 in self._segment_grid(plan.grid_x, 0.5, width - 0.5, 4.0):
                add_space("service", x0, ring_y1, x1, depth - 0.5, False, "Service")

        if ring_x0 - 0.5 >= 3.2:
            for y0, y1 in self._segment_grid(plan.grid_y, ring_y0, ring_y1, 4.2):
                add_space("retail", 0.5, y0, ring_x0, y1, True, "Retail")

        if width - ring_x1 >= 3.2:
            for y0, y1 in self._segment_grid(plan.grid_y, ring_y0, ring_y1, 4.2):
                add_space("retail", ring_x1, y0, width - 0.5, y1, True, "Retail")

        return spaces

    def _layout_mixed_use(self, plan: FloorPlan, floor_level: int) -> List[Space]:
        if floor_level == 0:
            return self._layout_mixed_use_ground(plan, floor_level)
        return self._layout_office(plan, floor_level)

    def _distribute_programmatic(
        self,
        plan: FloorPlan,
        floor_level: int,
        building_type: Optional[str] = None,
    ) -> List[Space]:
        """Professional strip-based space distribution algorithm.

        Arranges spaces in organized horizontal strips (north/south of corridor),
        with grid snapping, placement priority, and adjacency rule compliance.
        """
        spaces = []
        placed_spaces = []  # Track placed spaces for adjacency checks
        building_type = building_type or self.building_type

        # Configuration
        GRID_SNAP = 1.2  # Standard 1.2m architectural module
        CORRIDOR_WIDTH = 2.4  # Central corridor width
        MIN_SPACE_WIDTH = 3.0
        MIN_SPACE_DEPTH = 3.0
        MAX_DAYLIGHT_DEPTH = 12.0  # Maximum depth for daylit spaces
        ADJACENCY_TOLERANCE = 0.5  # Max gap for "adjacent" spaces (meters)

        program_key = "ground_floor" if floor_level == 0 else "typical_floor"
        space_program = SPACE_PROGRAMS.get(building_type, SPACE_PROGRAMS["office"])
        floor_program = space_program.get(program_key, space_program.get("typical_floor", []))

        total_area = plan.width * plan.depth
        core_area = plan.core.width * plan.core.depth if plan.core else 0
        available_area = total_area - core_area - (plan.width * CORRIDOR_WIDTH)

        # Get adjacency rules
        requires_adj = ADJACENCY_RULES.get("requires_adjacency", {})
        avoid_adj = ADJACENCY_RULES.get("avoid_adjacency", {})
        placement_priority = ADJACENCY_RULES.get("placement_priority", {})

        # Build list of space requirements with calculated dimensions
        space_reqs = []
        for i, space_def in enumerate(floor_program):
            space_type = space_def["type"]
            space_ratio = space_def["ratio"]
            space_area = max(available_area * space_ratio, MIN_SPACE_WIDTH * MIN_SPACE_DEPTH)
            requires_daylight = space_def.get("daylight", False)

            # Calculate dimensions based on space type
            if requires_daylight:
                # Daylit spaces: limit depth, extend width along facade
                space_depth = min(MAX_DAYLIGHT_DEPTH, math.sqrt(space_area))
                space_width = space_area / space_depth
            else:
                # Interior spaces: more square aspect ratio
                aspect = 1.2
                space_width = math.sqrt(space_area * aspect)
                space_depth = space_area / space_width

            # Snap to grid
            space_width = max(MIN_SPACE_WIDTH, math.ceil(space_width / GRID_SNAP) * GRID_SNAP)
            space_depth = max(MIN_SPACE_DEPTH, math.ceil(space_depth / GRID_SNAP) * GRID_SNAP)

            # Get placement priority (higher = place first)
            priority = placement_priority.get(space_type, 30)

            space_reqs.append({
                "index": i,
                "type": space_type,
                "area": space_area,
                "width": space_width,
                "depth": space_depth,
                "daylight": requires_daylight,
                "priority": priority,
                "requires_adjacency": requires_adj.get(space_type, []),
                "avoid_adjacency": avoid_adj.get(space_type, []),
            })

        # Sort by placement priority (high priority first), then by area
        space_reqs.sort(key=lambda s: (-s["priority"], -s["area"]))

        # Define layout strips: north and south of central corridor
        corridor_y = (plan.depth - CORRIDOR_WIDTH) / 2
        strip_depth = corridor_y  # Depth available for each strip

        strips = [
            {"name": "north", "y": 0, "depth": strip_depth, "x_cursor": 0, "spaces": []},
            {"name": "south", "y": corridor_y + CORRIDOR_WIDTH, "depth": strip_depth, "x_cursor": 0, "spaces": []},
        ]

        # Avoid core zone
        core_x0 = plan.core.position[0] if plan.core else plan.width / 2 - 3
        core_x1 = core_x0 + (plan.core.width if plan.core else 6)
        core_y0 = plan.core.position[1] if plan.core else plan.depth / 2 - 3
        core_y1 = core_y0 + (plan.core.depth if plan.core else 6)

        def overlaps_core(x0: float, y0: float, x1: float, y1: float) -> bool:
            """Check if rectangle overlaps with core."""
            return not (x1 <= core_x0 or x0 >= core_x1 or y1 <= core_y0 or y0 >= core_y1)

        def is_adjacent_to(bounds1: dict, bounds2: dict, tolerance: float = ADJACENCY_TOLERANCE) -> bool:
            """Check if two spaces are adjacent (share an edge or are very close)."""
            # Check horizontal adjacency (side by side)
            horiz_adj = (
                abs(bounds1["max_x"] - bounds2["min_x"]) <= tolerance or
                abs(bounds2["max_x"] - bounds1["min_x"]) <= tolerance
            )
            horiz_overlap = not (bounds1["max_y"] <= bounds2["min_y"] or bounds1["min_y"] >= bounds2["max_y"])

            # Check vertical adjacency (above/below)
            vert_adj = (
                abs(bounds1["max_y"] - bounds2["min_y"]) <= tolerance or
                abs(bounds2["max_y"] - bounds1["min_y"]) <= tolerance
            )
            vert_overlap = not (bounds1["max_x"] <= bounds2["min_x"] or bounds1["min_x"] >= bounds2["max_x"])

            return (horiz_adj and horiz_overlap) or (vert_adj and vert_overlap)

        def check_adjacency_rules(space_type: str, bounds: dict, req: dict) -> tuple:
            """Check if placement satisfies adjacency rules. Returns (score, violations)."""
            score = 0
            violations = []

            for placed in placed_spaces:
                placed_type = placed["type"]
                placed_bounds = placed["bounds"]

                if is_adjacent_to(bounds, placed_bounds):
                    # Check if this adjacency is required (good)
                    if placed_type in req["requires_adjacency"]:
                        score += 10  # Bonus for required adjacency

                    # Check if this adjacency should be avoided (bad)
                    if placed_type in req["avoid_adjacency"]:
                        score -= 20  # Penalty for bad adjacency
                        violations.append(f"{space_type} adjacent to {placed_type}")

            return score, violations

        def find_best_position_near_adjacent(req: dict, strip: dict, space_width: float, space_depth: float) -> tuple:
            """Find position that maximizes adjacency to required spaces."""
            best_pos = None
            best_score = -float('inf')

            # Try positions along the strip
            x_positions = [strip["x_cursor"]]

            # Also try positions adjacent to already-placed spaces of required types
            for placed in placed_spaces:
                if placed["type"] in req["requires_adjacency"]:
                    pb = placed["bounds"]
                    # Try position right after this space
                    x_positions.append(pb["max_x"])
                    # Try position before this space (if there's room)
                    if pb["min_x"] >= space_width:
                        x_positions.append(pb["min_x"] - space_width)

            for pos_x in x_positions:
                pos_x = max(0, math.ceil(pos_x / GRID_SNAP) * GRID_SNAP)
                pos_y = strip["y"]

                # Check bounds
                if pos_x + space_width > plan.width:
                    continue

                # Check core overlap
                if overlaps_core(pos_x, pos_y, pos_x + space_width, pos_y + space_depth):
                    if core_x1 + space_width <= plan.width:
                        pos_x = math.ceil(core_x1 / GRID_SNAP) * GRID_SNAP
                    else:
                        continue

                bounds = {
                    "min_x": pos_x,
                    "max_x": pos_x + space_width,
                    "min_y": pos_y,
                    "max_y": pos_y + space_depth,
                }

                score, violations = check_adjacency_rules(req["type"], bounds, req)

                # Penalize positions that overlap with existing spaces
                for placed in placed_spaces:
                    pb = placed["bounds"]
                    if not (bounds["max_x"] <= pb["min_x"] or bounds["min_x"] >= pb["max_x"] or
                            bounds["max_y"] <= pb["min_y"] or bounds["min_y"] >= pb["max_y"]):
                        score -= 100  # Heavy penalty for overlap

                if score > best_score:
                    best_score = score
                    best_pos = (pos_x, pos_y, bounds)

            return best_pos, best_score

        # Place spaces in strips with adjacency awareness
        for req in space_reqs:
            placed = False
            space_width = req["width"]
            space_depth = min(req["depth"], strip_depth)

            # Try to find optimal position considering adjacency rules
            best_strip = None
            best_position = None
            best_score = -float('inf')

            for strip in strips:
                position, score = find_best_position_near_adjacent(req, strip, space_width, space_depth)
                if position and score > best_score:
                    best_score = score
                    best_position = position
                    best_strip = strip

            if best_position:
                pos_x, pos_y, bounds = best_position

                # Place the space
                space = Space(
                    id=f"space_{floor_level}_{req['index']}",
                    name=f"{req['type']}_{req['index']}",
                    type=req["type"],
                    area=req["area"],
                    requires_daylight=req["daylight"],
                    floor_level=floor_level,
                    requires_adjacency=req["requires_adjacency"],
                    avoid_adjacency=req["avoid_adjacency"],
                    bounds={
                        "min_x": pos_x,
                        "max_x": pos_x + space_width,
                        "min_y": pos_y,
                        "max_y": pos_y + space_depth,
                    },
                )

                if SHAPELY_AVAILABLE:
                    space.polygon = box(pos_x, pos_y, pos_x + space_width, pos_y + space_depth)

                spaces.append(space)

                # Track placed space for adjacency checking
                placed_spaces.append({
                    "type": req["type"],
                    "bounds": bounds,
                })

                # Update strip cursor
                if best_strip:
                    best_strip["x_cursor"] = max(best_strip["x_cursor"], pos_x + space_width)

                placed = True

            # Fallback: place in overflow area (center of plan)
            if not placed:
                pos_x = core_x1 + GRID_SNAP if plan.core else 0
                pos_y = corridor_y + CORRIDOR_WIDTH
                fallback_bounds = {
                    "min_x": pos_x,
                    "max_x": pos_x + space_width,
                    "min_y": pos_y,
                    "max_y": pos_y + space_depth,
                }
                space = Space(
                    id=f"space_{floor_level}_{req['index']}",
                    name=f"{req['type']}_{req['index']}",
                    type=req["type"],
                    area=req["area"],
                    requires_daylight=req["daylight"],
                    floor_level=floor_level,
                    requires_adjacency=req["requires_adjacency"],
                    avoid_adjacency=req["avoid_adjacency"],
                    bounds=fallback_bounds,
                )
                if SHAPELY_AVAILABLE:
                    space.polygon = box(pos_x, pos_y, pos_x + space_width, pos_y + space_depth)
                spaces.append(space)

                # Track placed space
                placed_spaces.append({
                    "type": req["type"],
                    "bounds": fallback_bounds,
                })

        return spaces

    def _distribute_spaces(self, plan: FloorPlan, floor_level: int) -> List[Space]:
        """Distribute spaces using program-specific layouts."""
        building_type = self.building_type

        if building_type in ["residential", "hotel"]:
            return self._layout_residential(plan, floor_level)
        if building_type == "mixed_use":
            return self._layout_mixed_use(plan, floor_level)
        if building_type == "office":
            return self._layout_office(plan, floor_level)

        return self._distribute_programmatic(plan, floor_level, building_type)

    def _create_circulation(self, plan: FloorPlan) -> List[Dict[str, Any]]:
        """Create circulation paths"""
        circulation = []
        corridor_width = self.code["min_corridor_width"]

        # Main corridor along core
        if plan.core:
            core_x, core_y = plan.core.position
            core_w = plan.core.width
            core_d = plan.core.depth
            offset = max(corridor_width / 2, 0.6)
            ring_x0 = max(0.0, core_x - offset)
            ring_y0 = max(0.0, core_y - offset)
            ring_x1 = min(plan.width, core_x + core_w + offset)
            ring_y1 = min(plan.depth, core_y + core_d + offset)

            circulation.append({
                "id": f"corridor_ring_{plan.floor_level}_bottom",
                "type": "main_corridor",
                "width": corridor_width,
                "path": [{"x": ring_x0, "y": ring_y0}, {"x": ring_x1, "y": ring_y0}],
                "length": ring_x1 - ring_x0
            })
            circulation.append({
                "id": f"corridor_ring_{plan.floor_level}_top",
                "type": "main_corridor",
                "width": corridor_width,
                "path": [{"x": ring_x0, "y": ring_y1}, {"x": ring_x1, "y": ring_y1}],
                "length": ring_x1 - ring_x0
            })
            circulation.append({
                "id": f"corridor_ring_{plan.floor_level}_left",
                "type": "main_corridor",
                "width": corridor_width,
                "path": [{"x": ring_x0, "y": ring_y0}, {"x": ring_x0, "y": ring_y1}],
                "length": ring_y1 - ring_y0
            })
            circulation.append({
                "id": f"corridor_ring_{plan.floor_level}_right",
                "type": "main_corridor",
                "width": corridor_width,
                "path": [{"x": ring_x1, "y": ring_y0}, {"x": ring_x1, "y": ring_y1}],
                "length": ring_y1 - ring_y0
            })

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

    def _normalize_region(self, region: str, code_library: str = "") -> str:
        text = f"{region or ''} {code_library or ''}".strip().lower()
        if "saudi" in text or "ksa" in text or "sbc" in text:
            return "saudi"
        if "uae" in text or "emirates" in text:
            return "uae"
        if "qatar" in text:
            return "qatar"
        return "international"

    def _has_window_access(self, bounds: Optional[Dict[str, float]], width: float, depth: float) -> bool:
        if not bounds:
            return False
        min_x = bounds.get("min_x")
        max_x = bounds.get("max_x")
        min_y = bounds.get("min_y")
        max_y = bounds.get("max_y")
        if None in (min_x, max_x, min_y, max_y):
            return False
        margin = 0.6
        return (
            min_x <= margin or min_y <= margin or
            max_x >= width - margin or max_y >= depth - margin
        )

    async def analyze(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze project requirements and constraints"""
        logger.info("[Architectural] Analyzing project requirements...")

        # Extract key parameters
        gfa = self.context.get("gfa", 10000)
        floors = self.context.get("floors", 10)
        building_type = self.context.get("building_type", "office")
        region = self._normalize_region(
            self.context.get("region", "international"),
            self.context.get("code_library", "")
        )

        # Calculate derived parameters
        floor_area = gfa / floors
        aspect_ratio = self._calculate_optimal_aspect_ratio(building_type, floor_area)

        # Determine code requirements
        code = BUILDING_CODES.get(region, BUILDING_CODES["international"])

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
                "code": code,
                "region": region
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

        region = self._normalize_region(
            self.context.get("region", "international"),
            self.context.get("code_library", "")
        )
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
            for space in floor_plan.get("spaces", []):
                if (space.get("type") or "").lower() not in {"corridor", "circulation"}:
                    continue
                bounds = space.get("bounds") or {}
                min_x = bounds.get("min_x")
                max_x = bounds.get("max_x")
                min_y = bounds.get("min_y")
                max_y = bounds.get("max_y")
                if None in (min_x, max_x, min_y, max_y):
                    continue
                width_s = max_x - min_x
                depth_s = max_y - min_y
                corridor_width = min(width_s, depth_s)
                if corridor_width < code["min_corridor_width"]:
                    issues.append(
                        f"Corridor {space.get('id')} width ({corridor_width:.2f}m) "
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

        # Check overlaps and bounds
        for floor_plan in design.get("floor_plans", []):
            plan_width = floor_plan.get("width", 0)
            plan_depth = floor_plan.get("depth", 0)
            spaces = [s for s in floor_plan.get("spaces", []) if s.get("bounds")]
            for space in spaces:
                bounds = space.get("bounds") or {}
                min_x = bounds.get("min_x")
                max_x = bounds.get("max_x")
                min_y = bounds.get("min_y")
                max_y = bounds.get("max_y")
                if None in (min_x, max_x, min_y, max_y):
                    continue
                if min_x < 0 or min_y < 0 or max_x > plan_width or max_y > plan_depth:
                    issues.append(f"Space {space.get('id')} extends beyond floor boundary")
            for i in range(len(spaces)):
                a = spaces[i].get("bounds") or {}
                ax1, ax2 = a.get("min_x"), a.get("max_x")
                ay1, ay2 = a.get("min_y"), a.get("max_y")
                if None in (ax1, ax2, ay1, ay2):
                    continue
                for j in range(i + 1, len(spaces)):
                    b = spaces[j].get("bounds") or {}
                    bx1, bx2 = b.get("min_x"), b.get("max_x")
                    by1, by2 = b.get("min_y"), b.get("max_y")
                    if None in (bx1, bx2, by1, by2):
                        continue
                    overlap_x = min(ax2, bx2) - max(ax1, bx1)
                    overlap_y = min(ay2, by2) - max(ay1, by1)
                    if overlap_x > 0.2 and overlap_y > 0.2:
                        issues.append(
                            f"Space overlap between {spaces[i].get('id')} and {spaces[j].get('id')}"
                        )

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
        width = plan.width
        depth = plan.depth
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
                    "has_window": self._has_window_access(s.bounds, width, depth),
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
        """Get LLM recommendations for design with spatial relationship guidance"""
        if not self.llm:
            return {}

        building_type = self.context.get('building_type', 'office')
        gfa = self.context.get('gfa', 10000)
        floors = self.context.get('floors', 10)
        region = self.context.get('region', 'international')

        prompt = f"""You are an expert architectural designer. Analyze this project and provide
professional design recommendations optimized for spatial relationships and efficiency.

PROJECT PARAMETERS:
- Project Name: {self.context.get('name', 'Untitled')}
- Building Type: {building_type}
- Gross Floor Area (GFA): {gfa} m²
- Number of Floors: {floors}
- Region/Code: {region}
- Floor Plate Area: ~{gfa / max(floors, 1):.0f} m² per floor

SPATIAL RELATIONSHIP PRINCIPLES TO CONSIDER:
1. Core Placement: Central cores maximize rentable area; offset cores suit irregular sites
2. Circulation Efficiency: Main corridors should connect core to all spaces with minimal distance
3. Daylight Access: Place daylight-requiring spaces (offices, lobbies) along perimeter
4. Service Clustering: Group service spaces (toilets, storage, mechanical) near core
5. Adjacency Requirements:
   - Lobbies should be adjacent to elevators, reception, and main entrance
   - Meeting rooms should be near open offices for accessibility
   - Service/mechanical rooms should be away from public spaces
   - Kitchens/break rooms should be near but separate from work areas

BUILDING TYPE SPECIFIC GUIDANCE ({building_type}):
{self._get_building_type_guidance(building_type)}

Provide your analysis in JSON format:
{{
    "form_recommendation": "rectangular|L-shape|U-shape|tower|courtyard",
    "form_rationale": "Brief explanation of why this form suits the project",
    "core_position": "center|offset|corner|dual",
    "core_rationale": "Why this core position is optimal",
    "optimal_floor_depth": 12-18,  // meters, for daylight penetration
    "optimal_floor_width": 20-40,  // meters
    "recommended_grid_module": 6.0-9.0,  // meters, for structural efficiency
    "facade_strategy": "Description of facade approach for climate/orientation",
    "spatial_zones": [
        {{"zone": "public", "location": "ground floor entrance area", "spaces": ["lobby", "reception"]}},
        {{"zone": "work", "location": "typical floors perimeter", "spaces": ["offices", "meeting"]}},
        {{"zone": "service", "location": "near core", "spaces": ["toilets", "storage"]}}
    ],
    "adjacency_priorities": [
        {{"space1": "lobby", "space2": "elevator", "importance": "critical"}},
        {{"space1": "meeting_room", "space2": "open_office", "importance": "high"}}
    ],
    "special_considerations": ["List of region-specific or project-specific considerations"],
    "estimated_efficiency": 0.75-0.85,  // net-to-gross ratio
    "circulation_strategy": "Description of main circulation approach"
}}
"""

        try:
            response = await self.llm.generate(prompt)
            return {"llm_analysis": response}
        except Exception as e:
            logger.warning(f"LLM analysis failed: {e}")
            return {}

    def _get_building_type_guidance(self, building_type: str) -> str:
        """Get building type specific design guidance for LLM prompt."""
        guidance = {
            "office": """
- Prioritize daylight for open office areas (max 12m depth from facade)
- Meeting rooms can be interior but should be near circulation
- Floor-to-floor height typically 3.6-4.0m
- Target efficiency ratio: 75-82%
- Consider future flexibility for tenant changes""",

            "residential": """
- All living spaces require daylight and ventilation
- Corridor width min 1.5m, maximize unit frontage
- Floor-to-floor height typically 3.0-3.3m
- Target efficiency ratio: 78-85%
- Each unit should have cross-ventilation potential""",

            "hotel": """
- Guest rooms require daylight, uniform dimensions preferred
- Back-of-house (BOH) should be separate from guest circulation
- Floor-to-floor height: 3.2m typical floors, 4.5m+ public areas
- Target efficiency ratio: 65-72%
- Lobby and F&B areas need high ceilings and visibility""",

            "mixed_use": """
- Clear separation between uses (retail, office, residential)
- Separate cores/entrances for different uses preferred
- Retail at ground with high ceilings (4.5m+)
- Consider acoustic separation between uses
- Target efficiency varies by use: retail 90%+, office 75-80%""",

            "retail": """
- Maximize ground floor frontage and visibility
- Clear floor plates with minimal columns
- High ceilings (4.5-6m) for merchandise display
- Service/loading access separate from customer entry
- Target efficiency ratio: 85-92%"""
        }
        return guidance.get(building_type, guidance["office"])

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
