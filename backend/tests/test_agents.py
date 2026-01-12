"""
Tests for the AI Design Agents
==============================
"""

import asyncio
import pytest
from typing import Dict, Any

# Add parent directory to path
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.agents.base_agent import (
    BaseDesignAgent, AgentOutput, AgentDecision, AgentStatus,
    Conflict, ConflictType, ConflictPriority
)
from app.agents.coordinator import AgentCoordinator, CoordinationResult
from app.agents.conflict_resolver import ConflictResolver
from app.agents.architectural_agent import (
    ArchitecturalAgent, FloorPlanGenerator, FacadeGenerator, BuildingMassing
)
from app.agents.structural_agent import (
    StructuralAgent, StructuralSystemSelector, LoadCalculator, MemberDesigner
)
from app.agents.mep_agent import MEPAgent, HVACDesigner, ElectricalDesigner
from app.agents.interior_agent import InteriorAgent, FurniturePlanner, FinishDesigner


class MockLLMClient:
    """Mock LLM client for testing"""

    async def generate(self, prompt: str) -> str:
        """Return mock responses"""
        return '{"recommendation": "test", "confidence": 0.8}'


# ============================================================================
# Test Project Context
# ============================================================================

TEST_PROJECT_CONTEXT = {
    "name": "Test Office Building",
    "region": "saudi",
    "building_type": "office",
    "gfa": 15000,
    "floors": 12,
    "core_ratio": 0.15,
    "budget": "standard",
    "structural_system": "moment_frame",
    "mep_strategy": "vav"
}


# ============================================================================
# Architectural Agent Tests
# ============================================================================

class TestFloorPlanGenerator:
    """Tests for FloorPlanGenerator"""

    def test_generate_floor_plan(self):
        """Test floor plan generation"""
        generator = FloorPlanGenerator(
            building_program={"type": "office"},
            constraints={
                "aspect_ratio": 1.3,
                "grid_module": 8.4,
                "region": "saudi",
                "floors": 10
            }
        )

        plan = generator.generate(floor_area=1200, floor_level=0)

        assert plan.width > 0
        assert plan.depth > 0
        assert plan.core is not None
        assert len(plan.spaces) > 0
        assert len(plan.grid_x) > 1
        assert len(plan.grid_y) > 1

    def test_core_placement(self):
        """Test building core placement"""
        generator = FloorPlanGenerator(
            building_program={"type": "office"},
            constraints={"region": "international", "floors": 10}
        )

        plan = generator.generate(floor_area=1000, floor_level=0)

        # Core should be within building bounds
        assert 0 <= plan.core.position[0] <= plan.width
        assert 0 <= plan.core.position[1] <= plan.depth

        # Core should have reasonable size
        core_area = plan.core.width * plan.core.depth
        total_area = plan.width * plan.depth
        assert 0.08 <= core_area / total_area <= 0.20


class TestFacadeGenerator:
    """Tests for FacadeGenerator"""

    def test_generate_facades(self):
        """Test facade generation"""
        generator = FacadeGenerator(climate="saudi", building_type="office")

        massing = BuildingMassing(
            width=40,
            depth=30,
            height=43.2,
            floors=12,
            floor_height=3.6
        )

        facades = generator.generate(massing)

        assert "facades" in facades
        assert "north" in facades["facades"]
        assert "south" in facades["facades"]
        assert "materials" in facades
        assert "shading" in facades


class TestArchitecturalAgent:
    """Tests for ArchitecturalAgent"""

    @pytest.mark.asyncio
    async def test_analyze(self):
        """Test architectural analysis"""
        agent = ArchitecturalAgent(
            llm_client=MockLLMClient(),
            project_context=TEST_PROJECT_CONTEXT
        )

        analysis = await agent.analyze({})

        assert "requirements" in analysis
        assert "constraints" in analysis
        assert analysis["requirements"]["total_gfa"] == 15000
        assert analysis["requirements"]["floors"] == 12

    @pytest.mark.asyncio
    async def test_design(self):
        """Test architectural design generation"""
        agent = ArchitecturalAgent(
            llm_client=MockLLMClient(),
            project_context=TEST_PROJECT_CONTEXT
        )

        analysis = await agent.analyze({})
        design = await agent.design(analysis, {})

        assert "massing" in design
        assert "floor_plans" in design
        assert "facades" in design
        assert "metrics" in design

        # Check massing
        assert design["massing"]["floors"] == 12
        assert design["massing"]["width"] > 0

        # Check floor plans
        assert len(design["floor_plans"]) == 12


# ============================================================================
# Structural Agent Tests
# ============================================================================

class TestStructuralSystemSelector:
    """Tests for StructuralSystemSelector"""

    def test_select_for_low_rise(self):
        """Test system selection for low-rise building"""
        selector = StructuralSystemSelector()

        system, material, reasoning = selector.select(
            floors=5,
            building_type="office",
            seismic_zone="low",
            span_requirement=8,
            budget_priority="balanced"
        )

        assert system is not None
        assert material is not None
        assert len(reasoning) > 0

    def test_select_for_high_rise(self):
        """Test system selection for high-rise building"""
        selector = StructuralSystemSelector()

        system, material, reasoning = selector.select(
            floors=40,
            building_type="office",
            seismic_zone="medium",
            span_requirement=9,
            budget_priority="balanced"
        )

        # High-rise should get appropriate system
        from app.agents.structural_agent import StructuralSystem
        assert system in [
            StructuralSystem.BRACED_FRAME,
            StructuralSystem.SHEAR_WALL,
            StructuralSystem.CORE_OUTRIGGER,
            StructuralSystem.TUBE
        ]


class TestLoadCalculator:
    """Tests for LoadCalculator"""

    def test_gravity_loads(self):
        """Test gravity load calculation"""
        calculator = LoadCalculator("office", "saudi")

        loads = calculator.calculate_gravity_loads(
            floor_area=1000,
            floors=10,
            tributary_area=64  # 8x8 grid
        )

        assert loads["dead"] > 0
        assert loads["live"] > 0
        assert loads["factored"] > loads["dead"] + loads["live"]

    def test_lateral_loads(self):
        """Test lateral load calculation"""
        calculator = LoadCalculator("office", "saudi")

        loads = calculator.calculate_lateral_loads(
            width=40,
            depth=30,
            height=36,
            floors=10
        )

        assert loads["wind_base_shear"] > 0
        assert loads["seismic_base_shear"] > 0
        assert "controlling" in loads
        assert len(loads["floor_forces"]) == 10


class TestStructuralAgent:
    """Tests for StructuralAgent"""

    @pytest.mark.asyncio
    async def test_design_with_architecture(self):
        """Test structural design with architectural input"""
        # First get architectural design
        arch_agent = ArchitecturalAgent(
            llm_client=MockLLMClient(),
            project_context=TEST_PROJECT_CONTEXT
        )
        arch_analysis = await arch_agent.analyze({})
        arch_design = await arch_agent.design(arch_analysis, {})

        # Then structural design
        struct_agent = StructuralAgent(
            llm_client=MockLLMClient(),
            project_context=TEST_PROJECT_CONTEXT
        )

        inputs = {
            "dependency_outputs": {
                "architectural": arch_design
            }
        }

        analysis = await struct_agent.analyze(inputs)
        design = await struct_agent.design(analysis, {})

        assert "system" in design
        assert "columns" in design
        assert "beams" in design
        assert "analysis" in design

        # Check column design
        assert len(design["columns"]) > 0
        for col in design["columns"]:
            assert col["width"] >= 0.3  # Minimum column size


# ============================================================================
# MEP Agent Tests
# ============================================================================

class TestHVACDesigner:
    """Tests for HVACDesigner"""

    def test_cooling_load_calculation(self):
        """Test cooling load calculation"""
        designer = HVACDesigner("saudi", "office")

        spaces = [
            {"type": "open_office", "area": 500, "floor_level": 0, "requires_daylight": True},
            {"type": "meeting_room", "area": 50, "floor_level": 0, "requires_daylight": False}
        ]

        zones = designer.calculate_cooling_loads(spaces, {}, 3.6)

        assert len(zones) == 2
        assert zones[0].cooling_load > 0
        assert zones[0].supply_air > 0

    def test_system_selection(self):
        """Test HVAC system selection"""
        designer = HVACDesigner("saudi", "office")

        from app.agents.mep_agent import HVACSystemType

        # Small building
        system = designer.select_system(30000, 5, "office")
        assert system in [HVACSystemType.VRF, HVACSystemType.VAV, HVACSystemType.FCU]

        # Large building
        system = designer.select_system(500000, 25, "office")
        assert system == HVACSystemType.VAV


class TestMEPAgent:
    """Tests for MEPAgent"""

    @pytest.mark.asyncio
    async def test_full_design(self):
        """Test complete MEP design"""
        # Get prerequisites
        arch_agent = ArchitecturalAgent(MockLLMClient(), TEST_PROJECT_CONTEXT)
        arch_analysis = await arch_agent.analyze({})
        arch_design = await arch_agent.design(arch_analysis, {})

        struct_agent = StructuralAgent(MockLLMClient(), TEST_PROJECT_CONTEXT)
        struct_inputs = {"dependency_outputs": {"architectural": arch_design}}
        struct_analysis = await struct_agent.analyze(struct_inputs)
        struct_design = await struct_agent.design(struct_analysis, {})

        # Now MEP
        mep_agent = MEPAgent(MockLLMClient(), TEST_PROJECT_CONTEXT)
        mep_inputs = {
            "dependency_outputs": {
                "architectural": arch_design,
                "structural": struct_design
            }
        }

        analysis = await mep_agent.analyze(mep_inputs)
        design = await mep_agent.design(analysis, {})

        assert "hvac" in design
        assert "electrical" in design
        assert "plumbing" in design

        # Check HVAC
        assert design["hvac"]["cooling_capacity_kw"] > 0
        assert len(design["hvac"]["ahus"]) > 0


# ============================================================================
# Interior Agent Tests
# ============================================================================

class TestFurniturePlanner:
    """Tests for FurniturePlanner"""

    def test_office_layout(self):
        """Test office furniture layout"""
        from app.agents.interior_agent import DesignStyle, FinishGrade

        planner = FurniturePlanner(DesignStyle.MODERN, FinishGrade.STANDARD)

        space = {
            "id": "space_0",
            "type": "open_office",
            "area": 200,
            "bounds": {"min_x": 0, "max_x": 20, "min_y": 0, "max_y": 10},
            "floor_level": 0
        }

        furniture = planner.plan_layout(space)

        assert len(furniture) > 0

        # Check workstations exist
        workstations = [f for f in furniture if f.type == "workstation"]
        assert len(workstations) > 0


# ============================================================================
# Coordinator Tests
# ============================================================================

class TestAgentCoordinator:
    """Tests for AgentCoordinator"""

    def test_execution_order(self):
        """Test that execution order respects dependencies"""
        coordinator = AgentCoordinator(TEST_PROJECT_CONTEXT)

        # Register agents
        coordinator.register_agent(ArchitecturalAgent(MockLLMClient(), TEST_PROJECT_CONTEXT))
        coordinator.register_agent(StructuralAgent(MockLLMClient(), TEST_PROJECT_CONTEXT))
        coordinator.register_agent(MEPAgent(MockLLMClient(), TEST_PROJECT_CONTEXT))
        coordinator.register_agent(InteriorAgent(MockLLMClient(), TEST_PROJECT_CONTEXT))

        order = coordinator.get_execution_order()

        # Architectural should be first (no dependencies)
        assert "architectural" in order[0]

        # Find positions
        arch_pos = next(i for i, group in enumerate(order) if "architectural" in group)
        struct_pos = next(i for i, group in enumerate(order) if "structural" in group)
        mep_pos = next(i for i, group in enumerate(order) if "mep" in group)

        # Structural depends on architectural
        assert struct_pos > arch_pos

        # MEP depends on both
        assert mep_pos > arch_pos
        assert mep_pos >= struct_pos

    @pytest.mark.asyncio
    async def test_full_coordination(self):
        """Test full coordination pipeline"""
        coordinator = AgentCoordinator(
            TEST_PROJECT_CONTEXT,
            config={"max_iterations": 3}
        )

        # Register all agents
        coordinator.register_agent(ArchitecturalAgent(MockLLMClient(), TEST_PROJECT_CONTEXT))
        coordinator.register_agent(StructuralAgent(MockLLMClient(), TEST_PROJECT_CONTEXT))
        coordinator.register_agent(MEPAgent(MockLLMClient(), TEST_PROJECT_CONTEXT))
        coordinator.register_agent(InteriorAgent(MockLLMClient(), TEST_PROJECT_CONTEXT))

        # Run coordination
        result = await coordinator.run()

        assert result.success
        assert "architectural" in result.agent_outputs
        assert "structural" in result.agent_outputs
        assert "mep" in result.agent_outputs
        assert "interior" in result.agent_outputs

        # Check final design
        assert "components" in result.final_design
        assert "metrics" in result.final_design


# ============================================================================
# Conflict Resolution Tests
# ============================================================================

class TestConflictResolver:
    """Tests for ConflictResolver"""

    @pytest.mark.asyncio
    async def test_resolve_structural_conflict(self):
        """Test structural conflict resolution"""
        conflict = Conflict(
            id="test_conflict_1",
            type=ConflictType.STRUCTURAL,
            priority=ConflictPriority.CRITICAL,
            source_agent="structural",
            target_agent="architectural",
            description="Column conflicts with open space"
        )

        resolver = ConflictResolver(
            agents={},
            outputs={},
            context=TEST_PROJECT_CONTEXT
        )

        resolution = await resolver.resolve(conflict)

        assert resolution is not None
        assert resolution.conflict_id == "test_conflict_1"
        assert resolution.confidence > 0.5

    def test_analyze_conflicts(self):
        """Test conflict analysis"""
        conflicts = [
            Conflict(
                id="c1",
                type=ConflictType.SPATIAL,
                priority=ConflictPriority.MEDIUM,
                source_agent="structural",
                target_agent="architectural",
                description="Test 1"
            ),
            Conflict(
                id="c2",
                type=ConflictType.MEP_CLEARANCE,
                priority=ConflictPriority.HIGH,
                source_agent="mep",
                target_agent="structural",
                description="Test 2"
            )
        ]

        resolver = ConflictResolver({}, {}, TEST_PROJECT_CONTEXT)
        analysis = resolver.analyze_conflicts(conflicts)

        assert analysis["total"] == 2
        assert "spatial" in analysis["by_type"]
        assert "mep_clearance" in analysis["by_type"]


# ============================================================================
# Run Tests
# ============================================================================

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
