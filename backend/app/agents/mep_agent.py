"""
MEP (Mechanical, Electrical, Plumbing) Design Agent
===================================================
Autonomous agent for MEP systems design.
Designs HVAC, electrical, plumbing, and fire protection systems.
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

class HVACSystemType(Enum):
    """Types of HVAC systems"""
    VAV = "variable_air_volume"
    FCU = "fan_coil_unit"
    VRF = "variable_refrigerant_flow"
    CHILLED_BEAM = "chilled_beam"
    SPLIT = "split_system"
    CENTRAL = "central_air_handling"


class ElectricalSystemType(Enum):
    """Electrical distribution types"""
    LV = "low_voltage"
    MV = "medium_voltage"
    BUSWAY = "busway"
    CABLE_TRAY = "cable_tray"


# Climate data for cooling load calculations
CLIMATE_DATA = {
    "saudi": {
        "design_temp": 48,  # °C
        "humidity": 20,  # %
        "solar_radiation": 1000,  # W/m²
        "degree_days_cooling": 4500
    },
    "uae": {
        "design_temp": 46,
        "humidity": 65,
        "solar_radiation": 950,
        "degree_days_cooling": 4200
    },
    "qatar": {
        "design_temp": 46,
        "humidity": 60,
        "solar_radiation": 900,
        "degree_days_cooling": 4000
    },
    "international": {
        "design_temp": 35,
        "humidity": 50,
        "solar_radiation": 700,
        "degree_days_cooling": 2000
    }
}

# Space loads by type (W/m²)
SPACE_LOADS = {
    "office": {"lighting": 12, "equipment": 15, "occupancy": 10},
    "open_office": {"lighting": 14, "equipment": 20, "occupancy": 12},
    "meeting_room": {"lighting": 12, "equipment": 10, "occupancy": 25},
    "lobby": {"lighting": 15, "equipment": 5, "occupancy": 8},
    "retail": {"lighting": 20, "equipment": 10, "occupancy": 15},
    "restaurant": {"lighting": 15, "equipment": 30, "occupancy": 20},
    "hotel_room": {"lighting": 10, "equipment": 8, "occupancy": 5},
    "parking": {"lighting": 5, "equipment": 0, "occupancy": 0}
}


# ============================================================================
# Data Structures
# ============================================================================

@dataclass
class ThermalZone:
    """Thermal zone for HVAC design"""
    id: str
    name: str
    floor_level: int
    area: float  # m²
    height: float  # m
    occupancy: int
    lighting_load: float  # W
    equipment_load: float  # W
    cooling_load: float  # W
    heating_load: float  # W
    supply_air: float  # L/s
    fresh_air: float  # L/s


@dataclass
class AHU:
    """Air Handling Unit"""
    id: str
    location: Tuple[float, float, float]
    cooling_capacity: float  # kW
    airflow: float  # m³/h
    supply_pressure: float  # Pa
    zones_served: List[str]
    dimensions: Tuple[float, float, float]


@dataclass
class Duct:
    """Ductwork segment"""
    id: str
    type: str  # supply, return, exhaust, fresh_air
    start: Tuple[float, float, float]
    end: Tuple[float, float, float]
    width: float
    height: float
    airflow: float  # m³/h
    velocity: float  # m/s
    pressure_drop: float  # Pa


@dataclass
class ElectricalPanel:
    """Electrical distribution panel"""
    id: str
    type: str  # main, sub, floor
    location: Tuple[float, float, float]
    capacity: float  # kVA
    voltage: str
    circuits: int


@dataclass
class PlumbingRiser:
    """Vertical plumbing riser"""
    id: str
    type: str  # cold_water, hot_water, drain, vent
    position: Tuple[float, float]
    diameter: float  # mm
    floors_served: List[int]


# ============================================================================
# HVAC Designer
# ============================================================================

class HVACDesigner:
    """Designs HVAC systems"""

    def __init__(self, region: str, building_type: str):
        self.region = region
        self.building_type = building_type
        self.climate = CLIMATE_DATA.get(region.lower(), CLIMATE_DATA["international"])

    def calculate_cooling_loads(
        self,
        spaces: List[Dict],
        facades: Dict,
        floor_height: float
    ) -> List[ThermalZone]:
        """Calculate cooling loads for all zones"""
        zones = []

        for i, space in enumerate(spaces):
            space_type = space.get("type", "office")
            area = space.get("area", 100)
            loads = SPACE_LOADS.get(space_type, SPACE_LOADS["office"])

            # Internal loads
            lighting = loads["lighting"] * area
            equipment = loads["equipment"] * area
            occupancy_count = int(area / 10)  # 1 person per 10m²
            people_load = occupancy_count * 120  # W/person sensible

            # Envelope loads (simplified)
            envelope_load = self._calculate_envelope_load(space, facades)

            # Total cooling load
            total_cooling = (lighting + equipment + people_load + envelope_load) * 1.15  # Safety factor

            # Supply air calculation
            supply_air = total_cooling / (1.2 * 1.0 * 10)  # L/s (10°C temp diff)
            fresh_air = max(occupancy_count * 10, area * 1.0)  # L/s

            zones.append(ThermalZone(
                id=f"zone_{i}",
                name=space.get("name", f"Zone {i}"),
                floor_level=space.get("floor_level", 0),
                area=area,
                height=floor_height,
                occupancy=occupancy_count,
                lighting_load=lighting,
                equipment_load=equipment,
                cooling_load=total_cooling,
                heating_load=total_cooling * 0.3,  # Simplified
                supply_air=supply_air,
                fresh_air=fresh_air
            ))

        return zones

    def _calculate_envelope_load(self, space: Dict, facades: Dict) -> float:
        """Calculate envelope heat gain"""
        # Simplified envelope calculation
        if not space.get("requires_daylight", False):
            return 0  # Interior space

        # Perimeter load
        perimeter_length = math.sqrt(space.get("area", 100)) * 2
        glass_area = perimeter_length * 2.5  # 2.5m window height

        # Solar gain
        shgc = facades.get("materials", {}).get("shgc", 0.3)
        solar_gain = glass_area * self.climate["solar_radiation"] * shgc * 0.5

        # Conduction
        u_value = facades.get("materials", {}).get("u_value", 2.0)
        delta_t = self.climate["design_temp"] - 24  # Indoor 24°C
        conduction = glass_area * u_value * delta_t

        return solar_gain + conduction

    def select_system(
        self,
        total_cooling: float,
        floors: int,
        building_type: str
    ) -> HVACSystemType:
        """Select optimal HVAC system"""
        # Selection criteria
        if total_cooling < 50000:  # < 50 kW
            return HVACSystemType.VRF

        if building_type in ["hotel", "residential"]:
            return HVACSystemType.FCU

        if floors > 20:
            return HVACSystemType.VAV

        if building_type == "office":
            return HVACSystemType.VAV

        return HVACSystemType.CENTRAL

    def design_ahu(
        self,
        zones: List[ThermalZone],
        system_type: HVACSystemType
    ) -> List[AHU]:
        """Design Air Handling Units"""
        ahus = []

        # Group zones by floor
        floors = {}
        for zone in zones:
            floor = zone.floor_level
            if floor not in floors:
                floors[floor] = []
            floors[floor].append(zone)

        # Design AHU for each floor or group
        ahu_id = 0
        for floor, floor_zones in floors.items():
            total_cooling = sum(z.cooling_load for z in floor_zones)
            total_airflow = sum(z.supply_air for z in floor_zones) * 3.6  # m³/h

            # Determine number of AHUs
            max_ahu_capacity = 200000  # 200 kW max per AHU
            num_ahus = max(1, math.ceil(total_cooling / max_ahu_capacity))

            for i in range(num_ahus):
                ahus.append(AHU(
                    id=f"AHU_{floor}_{i}",
                    location=(5.0, 5.0, floor * 3.6),  # Simplified location
                    cooling_capacity=total_cooling / num_ahus / 1000,  # kW
                    airflow=total_airflow / num_ahus,
                    supply_pressure=500,  # Pa typical
                    zones_served=[z.id for z in floor_zones[i::num_ahus]],
                    dimensions=(3.0, 2.0, 2.5)  # Typical AHU size
                ))
                ahu_id += 1

        return ahus

    def design_ductwork(
        self,
        ahus: List[AHU],
        zones: List[ThermalZone],
        grid: Dict
    ) -> List[Duct]:
        """Design ductwork layout"""
        ducts = []
        duct_id = 0

        for ahu in ahus:
            # Main supply duct
            ahu_zones = [z for z in zones if z.id in ahu.zones_served]
            total_airflow = ahu.airflow

            # Size main duct
            velocity = 8  # m/s target
            area = total_airflow / 3600 / velocity  # m²
            width = math.sqrt(area * 2)  # 2:1 aspect ratio
            height = area / width

            # Main duct from AHU
            main_duct = Duct(
                id=f"D_main_{duct_id}",
                type="supply",
                start=ahu.location,
                end=(ahu.location[0] + 20, ahu.location[1], ahu.location[2]),
                width=round(width, 2),
                height=round(height, 2),
                airflow=total_airflow,
                velocity=velocity,
                pressure_drop=50
            )
            ducts.append(main_duct)
            duct_id += 1

            # Branch ducts to zones
            remaining_airflow = total_airflow
            for zone in ahu_zones:
                zone_airflow = zone.supply_air * 3.6

                # Size branch
                branch_area = zone_airflow / 3600 / 6  # Lower velocity for branches
                branch_width = math.sqrt(branch_area * 1.5)
                branch_height = branch_area / branch_width

                bounds = zone.id  # Simplified - use zone center
                ducts.append(Duct(
                    id=f"D_branch_{duct_id}",
                    type="supply",
                    start=main_duct.end,
                    end=(main_duct.end[0], main_duct.end[1] + 5, main_duct.end[2]),
                    width=round(branch_width, 2),
                    height=round(branch_height, 2),
                    airflow=zone_airflow,
                    velocity=6,
                    pressure_drop=20
                ))
                duct_id += 1
                remaining_airflow -= zone_airflow

        return ducts


# ============================================================================
# Electrical Designer
# ============================================================================

class ElectricalDesigner:
    """Designs electrical systems"""

    def __init__(self, region: str, building_type: str):
        self.region = region
        self.building_type = building_type

    def calculate_loads(
        self,
        spaces: List[Dict],
        hvac_load: float,  # kW
        floors: int
    ) -> Dict[str, float]:
        """Calculate electrical loads"""
        # Lighting load
        lighting = sum(
            SPACE_LOADS.get(s.get("type", "office"), {}).get("lighting", 12) *
            s.get("area", 100)
            for s in spaces
        ) / 1000  # kW

        # Equipment load
        equipment = sum(
            SPACE_LOADS.get(s.get("type", "office"), {}).get("equipment", 15) *
            s.get("area", 100)
            for s in spaces
        ) / 1000

        # HVAC electrical load
        hvac_electrical = hvac_load * 0.35  # COP assumption

        # Elevator load
        elevator_load = floors * 30  # kW per floor roughly

        # Total connected load
        total_connected = lighting + equipment + hvac_electrical + elevator_load

        # Demand factor
        demand_factor = 0.7 if self.building_type == "office" else 0.6
        total_demand = total_connected * demand_factor

        return {
            "lighting": lighting,
            "equipment": equipment,
            "hvac": hvac_electrical,
            "elevator": elevator_load,
            "total_connected": total_connected,
            "total_demand": total_demand,
            "transformer_size": self._select_transformer(total_demand)
        }

    def _select_transformer(self, demand: float) -> float:
        """Select transformer size"""
        standard_sizes = [100, 250, 500, 750, 1000, 1500, 2000, 2500]
        for size in standard_sizes:
            if size >= demand * 1.25:  # 25% margin
                return size
        return demand * 1.5

    def design_distribution(
        self,
        loads: Dict,
        floors: int,
        grid: Dict
    ) -> Dict[str, Any]:
        """Design electrical distribution system"""
        panels = []

        # Main switchboard
        main_panel = ElectricalPanel(
            id="MSB",
            type="main",
            location=(2.0, 2.0, 0),
            capacity=loads["transformer_size"],
            voltage="415V",
            circuits=20
        )
        panels.append(main_panel)

        # Floor distribution boards
        load_per_floor = loads["total_demand"] / floors
        for floor in range(floors):
            panels.append(ElectricalPanel(
                id=f"FDB_{floor}",
                type="floor",
                location=(2.0, 2.0, floor * 3.6),
                capacity=load_per_floor * 1.2,
                voltage="415V",
                circuits=12
            ))

        return {
            "panels": [self._serialize_panel(p) for p in panels],
            "cable_routes": self._design_cable_routes(panels, grid),
            "emergency_power": self._design_emergency(loads)
        }

    def _serialize_panel(self, panel: ElectricalPanel) -> Dict:
        return {
            "id": panel.id,
            "type": panel.type,
            "location": {"x": panel.location[0], "y": panel.location[1], "z": panel.location[2]},
            "capacity_kva": panel.capacity,
            "voltage": panel.voltage,
            "circuits": panel.circuits
        }

    def _design_cable_routes(self, panels: List, grid: Dict) -> List[Dict]:
        """Design cable tray routes"""
        routes = []

        # Vertical riser
        routes.append({
            "id": "riser_main",
            "type": "vertical",
            "start": {"x": 2.0, "y": 2.0, "z": 0},
            "end": {"x": 2.0, "y": 2.0, "z": len(panels) * 3.6},
            "width": 0.3
        })

        return routes

    def _design_emergency(self, loads: Dict) -> Dict:
        """Design emergency power system"""
        emergency_load = (loads["lighting"] * 0.3 +
                         loads["elevator"] * 0.5 +
                         loads["equipment"] * 0.1)

        return {
            "generator_size": math.ceil(emergency_load / 100) * 100,
            "ups_capacity": loads["equipment"] * 0.2,
            "automatic_transfer": True
        }


# ============================================================================
# Plumbing Designer
# ============================================================================

class PlumbingDesigner:
    """Designs plumbing systems"""

    def __init__(self, building_type: str):
        self.building_type = building_type

    def calculate_fixtures(
        self,
        floors: int,
        floor_area: float,
        building_type: str
    ) -> Dict[str, int]:
        """Calculate plumbing fixture count"""
        # Fixture ratios per 100 occupants
        ratios = {
            "office": {"wc": 2, "urinal": 2, "lavatory": 2, "drinking": 1},
            "retail": {"wc": 3, "urinal": 2, "lavatory": 3, "drinking": 1},
            "hotel": {"wc": 1, "lavatory": 1, "shower": 1, "bathtub": 0.5},
            "residential": {"wc": 1, "lavatory": 1, "shower": 1, "kitchen": 1}
        }

        # Estimated occupancy
        occupancy = floor_area * floors / 15  # 15 m² per person

        fixture_ratio = ratios.get(building_type, ratios["office"])
        fixtures = {}

        for fixture, ratio in fixture_ratio.items():
            fixtures[fixture] = max(2, int(occupancy * ratio / 100 * floors))

        return fixtures

    def design_risers(
        self,
        floors: int,
        fixtures: Dict,
        core_position: Tuple[float, float]
    ) -> List[PlumbingRiser]:
        """Design plumbing risers"""
        risers = []

        # Cold water riser
        risers.append(PlumbingRiser(
            id="CW_01",
            type="cold_water",
            position=(core_position[0], core_position[1] - 1),
            diameter=self._size_water_riser(fixtures, floors),
            floors_served=list(range(floors))
        ))

        # Hot water riser
        risers.append(PlumbingRiser(
            id="HW_01",
            type="hot_water",
            position=(core_position[0], core_position[1] - 0.5),
            diameter=self._size_water_riser(fixtures, floors) * 0.75,
            floors_served=list(range(floors))
        ))

        # Drain riser
        risers.append(PlumbingRiser(
            id="DR_01",
            type="drain",
            position=(core_position[0] + 0.5, core_position[1] - 1),
            diameter=self._size_drain_riser(fixtures, floors),
            floors_served=list(range(floors))
        ))

        # Vent riser
        risers.append(PlumbingRiser(
            id="VT_01",
            type="vent",
            position=(core_position[0] + 0.5, core_position[1] - 0.5),
            diameter=75,
            floors_served=list(range(floors))
        ))

        return risers

    def _size_water_riser(self, fixtures: Dict, floors: int) -> float:
        """Size water supply riser"""
        total_fu = sum(fixtures.values()) * floors  # Fixture units
        if total_fu < 50:
            return 50
        elif total_fu < 150:
            return 75
        elif total_fu < 500:
            return 100
        else:
            return 150

    def _size_drain_riser(self, fixtures: Dict, floors: int) -> float:
        """Size drainage riser"""
        total_dfu = sum(fixtures.values()) * floors * 2  # Drainage fixture units
        if total_dfu < 100:
            return 100
        elif total_dfu < 300:
            return 150
        else:
            return 200


# ============================================================================
# MEP Agent
# ============================================================================

class MEPAgent(BaseDesignAgent):
    """
    Autonomous agent for MEP systems design.

    Capabilities:
    - HVAC system selection and design
    - Electrical distribution design
    - Plumbing system design
    - Fire protection layout
    - Clash detection with structure
    """

    @property
    def domain(self) -> str:
        return "mep"

    @property
    def dependencies(self) -> List[str]:
        return ["architectural", "structural"]

    def __init__(self, llm_client: Any, project_context: Dict[str, Any], config: Dict[str, Any] = None):
        super().__init__("mep", llm_client, project_context, config)

        self.hvac_designer = None
        self.electrical_designer = None
        self.plumbing_designer = None

    async def analyze(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze MEP requirements"""
        logger.info("[MEP] Analyzing requirements...")

        # Get dependencies
        arch_data = inputs.get("dependency_outputs", {}).get("architectural", {})
        struct_data = inputs.get("dependency_outputs", {}).get("structural", {})

        # Extract data
        massing = arch_data.get("massing", {})
        spaces = arch_data.get("spaces", [])
        facades = arch_data.get("facades", {})
        floors = massing.get("floors", 10)
        floor_height = massing.get("floor_height", 3.6)

        region = self.context.get("region", "international")
        building_type = self.context.get("building_type", "office")

        # Initialize designers
        self.hvac_designer = HVACDesigner(region, building_type)
        self.electrical_designer = ElectricalDesigner(region, building_type)
        self.plumbing_designer = PlumbingDesigner(building_type)

        # Calculate zones
        zones = self.hvac_designer.calculate_cooling_loads(spaces, facades, floor_height)
        total_cooling = sum(z.cooling_load for z in zones)

        # Extract structural grid
        struct_grid = struct_data.get("grid", {})
        beams = struct_data.get("beams", [])

        analysis = {
            "thermal_zones": [self._serialize_zone(z) for z in zones],
            "total_cooling_load": total_cooling,
            "total_heating_load": total_cooling * 0.3,
            "structural_constraints": {
                "beam_depths": [b.get("depth", 0.5) for b in beams[:5]],
                "grid": struct_grid,
                "ceiling_plenum": floor_height - 2.7 - max(b.get("depth", 0.5) for b in beams) if beams else 0.6
            },
            "building_params": {
                "floors": floors,
                "floor_height": floor_height,
                "floor_area": massing.get("width", 30) * massing.get("depth", 25),
                "region": region,
                "building_type": building_type
            }
        }

        self.log_decision(
            "analysis_complete",
            f"Total cooling load: {total_cooling/1000:.0f} kW for {len(zones)} zones"
        )

        return analysis

    async def design(self, analysis: Dict[str, Any], constraints: Dict[str, Any]) -> Dict[str, Any]:
        """Generate MEP design"""
        logger.info("[MEP] Designing systems...")

        zones = [self._deserialize_zone(z) for z in analysis["thermal_zones"]]
        params = analysis["building_params"]
        struct_constraints = analysis["structural_constraints"]

        # Design HVAC
        hvac_system = self.hvac_designer.select_system(
            analysis["total_cooling_load"],
            params["floors"],
            params["building_type"]
        )

        self.log_decision(
            "hvac_system_selected",
            f"Selected {hvac_system.value} system for {analysis['total_cooling_load']/1000:.0f} kW load",
            confidence=0.85
        )

        ahus = self.hvac_designer.design_ahu(zones, hvac_system)
        ductwork = self.hvac_designer.design_ductwork(ahus, zones, struct_constraints["grid"])

        # Design Electrical
        electrical_loads = self.electrical_designer.calculate_loads(
            analysis["thermal_zones"],
            analysis["total_cooling_load"] / 1000,
            params["floors"]
        )
        electrical_distribution = self.electrical_designer.design_distribution(
            electrical_loads,
            params["floors"],
            struct_constraints["grid"]
        )

        # Design Plumbing
        fixtures = self.plumbing_designer.calculate_fixtures(
            params["floors"],
            params["floor_area"],
            params["building_type"]
        )
        risers = self.plumbing_designer.design_risers(
            params["floors"],
            fixtures,
            (params["floor_area"] ** 0.5 / 2, params["floor_area"] ** 0.5 / 2)
        )

        # Check conflicts with structure
        self._check_structural_conflicts(ductwork, struct_constraints)

        design = {
            "hvac": {
                "system_type": hvac_system.value,
                "cooling_capacity_kw": analysis["total_cooling_load"] / 1000,
                "ahus": [self._serialize_ahu(a) for a in ahus],
                "ductwork": [self._serialize_duct(d) for d in ductwork],
                "zones": analysis["thermal_zones"]
            },
            "electrical": {
                "loads": electrical_loads,
                "distribution": electrical_distribution
            },
            "plumbing": {
                "fixtures": fixtures,
                "risers": [self._serialize_riser(r) for r in risers]
            },
            "fire_protection": self._design_fire_protection(params),
            "metrics": self._calculate_metrics(analysis, electrical_loads),
            "geometry": self._generate_geometry(ahus, ductwork, risers)
        }

        self.log_decision(
            "design_complete",
            f"MEP design complete: {len(ahus)} AHUs, {len(ductwork)} ducts, {len(risers)} risers"
        )

        return design

    async def validate(self, design: Dict[str, Any]) -> Tuple[bool, List[str]]:
        """Validate MEP design"""
        logger.info("[MEP] Validating design...")
        issues = []

        # Check duct velocities
        for duct in design.get("hvac", {}).get("ductwork", []):
            if duct.get("velocity", 0) > 10:
                issues.append(f"Duct {duct['id']} velocity {duct['velocity']:.1f} m/s exceeds 10 m/s limit")

        # Check electrical capacity
        loads = design.get("electrical", {}).get("loads", {})
        transformer = loads.get("transformer_size", 0)
        demand = loads.get("total_demand", 0)
        if transformer < demand:
            issues.append(f"Transformer {transformer} kVA undersized for {demand:.0f} kVA demand")

        # Check zone coverage
        zones = design.get("hvac", {}).get("zones", [])
        ahus = design.get("hvac", {}).get("ahus", [])
        served_zones = set()
        for ahu in ahus:
            served_zones.update(ahu.get("zones_served", []))

        unserved = [z["id"] for z in zones if z["id"] not in served_zones]
        if unserved:
            issues.append(f"Zones not served by HVAC: {unserved}")

        is_valid = len(issues) == 0
        return is_valid, issues

    async def optimize(self, design: Dict[str, Any], objectives: List[str]) -> Dict[str, Any]:
        """Optimize MEP design"""
        logger.info(f"[MEP] Optimizing for: {objectives}")

        optimized = design.copy()

        for objective in objectives:
            if objective == "energy":
                optimized = self._optimize_for_energy(optimized)
            elif objective == "cost":
                optimized = self._optimize_for_cost(optimized)
            elif objective == "space":
                optimized = self._optimize_for_space(optimized)

        return optimized

    # ========================================================================
    # Helper Methods
    # ========================================================================

    def _serialize_zone(self, zone: ThermalZone) -> Dict:
        return {
            "id": zone.id,
            "name": zone.name,
            "floor_level": zone.floor_level,
            "area": zone.area,
            "cooling_load": zone.cooling_load,
            "supply_air": zone.supply_air,
            "fresh_air": zone.fresh_air
        }

    def _deserialize_zone(self, data: Dict) -> ThermalZone:
        return ThermalZone(
            id=data["id"],
            name=data["name"],
            floor_level=data["floor_level"],
            area=data["area"],
            height=3.6,
            occupancy=int(data["area"] / 10),
            lighting_load=data["area"] * 12,
            equipment_load=data["area"] * 15,
            cooling_load=data["cooling_load"],
            heating_load=data["cooling_load"] * 0.3,
            supply_air=data["supply_air"],
            fresh_air=data["fresh_air"]
        )

    def _serialize_ahu(self, ahu: AHU) -> Dict:
        return {
            "id": ahu.id,
            "location": {"x": ahu.location[0], "y": ahu.location[1], "z": ahu.location[2]},
            "cooling_capacity_kw": ahu.cooling_capacity,
            "airflow_m3h": ahu.airflow,
            "zones_served": ahu.zones_served,
            "dimensions": {"l": ahu.dimensions[0], "w": ahu.dimensions[1], "h": ahu.dimensions[2]}
        }

    def _serialize_duct(self, duct: Duct) -> Dict:
        return {
            "id": duct.id,
            "type": duct.type,
            "start": {"x": duct.start[0], "y": duct.start[1], "z": duct.start[2]},
            "end": {"x": duct.end[0], "y": duct.end[1], "z": duct.end[2]},
            "width": duct.width,
            "height": duct.height,
            "airflow": duct.airflow,
            "velocity": duct.velocity,
            "bounds": {
                "min_x": min(duct.start[0], duct.end[0]),
                "max_x": max(duct.start[0], duct.end[0]),
                "min_y": min(duct.start[1], duct.end[1]) - duct.width/2,
                "max_y": max(duct.start[1], duct.end[1]) + duct.width/2,
                "min_z": min(duct.start[2], duct.end[2]),
                "max_z": max(duct.start[2], duct.end[2]) + duct.height
            }
        }

    def _serialize_riser(self, riser: PlumbingRiser) -> Dict:
        return {
            "id": riser.id,
            "type": riser.type,
            "position": {"x": riser.position[0], "y": riser.position[1]},
            "diameter_mm": riser.diameter,
            "floors_served": riser.floors_served
        }

    def _design_fire_protection(self, params: Dict) -> Dict:
        """Design fire protection system"""
        floor_area = params["floor_area"]
        floors = params["floors"]

        return {
            "sprinkler_system": True,
            "coverage_area": floor_area * floors,
            "sprinkler_count": int(floor_area * floors / 12),  # 1 per 12m²
            "standpipe": floors > 5,
            "fire_pump": floor_area * floors > 5000,
            "fire_pump_capacity_lpm": 2000 if floor_area * floors > 5000 else 0
        }

    def _check_structural_conflicts(self, ductwork: List[Duct], struct: Dict):
        """Check for conflicts with structural elements"""
        ceiling_plenum = struct.get("ceiling_plenum", 0.6)

        for duct in ductwork:
            if duct.height > ceiling_plenum - 0.1:
                self.add_conflict(
                    ConflictType.MEP_CLEARANCE,
                    ConflictPriority.HIGH,
                    "structural",
                    f"Duct {duct.id} height {duct.height}m exceeds available plenum {ceiling_plenum}m",
                    {"x": duct.start[0], "y": duct.start[1], "z": duct.start[2]},
                    [duct.id]
                )

    def _calculate_metrics(self, analysis: Dict, electrical: Dict) -> Dict[str, float]:
        """Calculate MEP metrics"""
        floor_area = analysis["building_params"]["floor_area"]
        floors = analysis["building_params"]["floors"]
        total_area = floor_area * floors

        return {
            "cooling_capacity_w_per_m2": analysis["total_cooling_load"] / total_area,
            "electrical_load_w_per_m2": electrical["total_demand"] * 1000 / total_area,
            "fresh_air_l_per_s_per_m2": sum(z["fresh_air"] for z in analysis["thermal_zones"]) / total_area,
            "estimated_eui_kwh_per_m2": (analysis["total_cooling_load"] / 1000 * 2000 +
                                          electrical["total_demand"] * 2500) / total_area
        }

    def _generate_geometry(self, ahus: List, ducts: List, risers: List) -> Dict:
        """Generate 3D geometry for visualization"""
        elements = []

        for ahu in ahus:
            loc = ahu.location
            dim = ahu.dimensions
            elements.append({
                "type": "ahu",
                "id": ahu.id,
                "bounds": {
                    "min_x": loc[0], "max_x": loc[0] + dim[0],
                    "min_y": loc[1], "max_y": loc[1] + dim[1],
                    "min_z": loc[2], "max_z": loc[2] + dim[2]
                }
            })

        for duct in ducts:
            elements.append({
                "type": "duct",
                "id": duct.id,
                "path": [duct.start, duct.end],
                "width": duct.width,
                "height": duct.height
            })

        for riser in risers:
            elements.append({
                "type": "riser",
                "id": riser.id,
                "riser_type": riser.type,
                "position": riser.position,
                "diameter": riser.diameter
            })

        return {"elements": elements}

    def _optimize_for_energy(self, design: Dict) -> Dict:
        """Optimize for energy efficiency"""
        # Recommend VRF for better part-load efficiency
        if design.get("hvac", {}).get("system_type") == "variable_air_volume":
            design["hvac"]["optimization_note"] = "Consider VRF for 20-30% energy savings"
        return design

    def _optimize_for_cost(self, design: Dict) -> Dict:
        """Optimize for cost"""
        # Standard duct sizes
        for duct in design.get("hvac", {}).get("ductwork", []):
            duct["width"] = round(duct["width"] / 0.1) * 0.1
            duct["height"] = round(duct["height"] / 0.1) * 0.1
        return design

    def _optimize_for_space(self, design: Dict) -> Dict:
        """Optimize for space efficiency"""
        # Reduce duct sizes with higher velocity
        for duct in design.get("hvac", {}).get("ductwork", []):
            if duct.get("velocity", 0) < 8:
                duct["optimization_note"] = "Can reduce size with velocity increase"
        return design
