"""
Agent Coordinator
=================
Orchestrates multiple design agents, manages communication,
and ensures coherent design output.
"""

import asyncio
import logging
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional, Set
from enum import Enum

from .base_agent import (
    BaseDesignAgent, AgentOutput, AgentStatus,
    Conflict, Resolution, ConflictPriority
)

logger = logging.getLogger(__name__)


class CoordinationPhase(Enum):
    """Phases of the coordination process"""
    INITIALIZATION = "initialization"
    ARCHITECTURAL = "architectural"
    PARALLEL_ANALYSIS = "parallel_analysis"
    CONFLICT_RESOLUTION = "conflict_resolution"
    REFINEMENT = "refinement"
    INTEGRATION = "integration"
    FINALIZATION = "finalization"


@dataclass
class CoordinationResult:
    """Result of the full coordination process"""
    success: bool
    phase: CoordinationPhase
    iterations: int
    agent_outputs: Dict[str, AgentOutput]
    resolved_conflicts: List[Resolution]
    unresolved_conflicts: List[Conflict]
    final_design: Dict[str, Any]
    metrics: Dict[str, float]
    execution_time: float
    created_at: datetime = field(default_factory=datetime.utcnow)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "success": self.success,
            "phase": self.phase.value,
            "iterations": self.iterations,
            "agent_outputs": {k: v.to_dict() for k, v in self.agent_outputs.items()},
            "resolved_conflicts": len(self.resolved_conflicts),
            "unresolved_conflicts": len(self.unresolved_conflicts),
            "metrics": self.metrics,
            "execution_time": self.execution_time,
            "created_at": self.created_at.isoformat()
        }


class AgentCoordinator:
    """
    Coordinates multiple design agents to produce integrated building designs.

    The coordinator manages:
    - Agent execution order based on dependencies
    - Parallel execution where possible
    - Conflict detection and resolution
    - Iterative refinement until convergence
    """

    def __init__(
        self,
        project_context: Dict[str, Any],
        config: Optional[Dict[str, Any]] = None
    ):
        """
        Initialize the coordinator.

        Args:
            project_context: Project parameters and constraints
            config: Coordinator configuration
        """
        self.context = project_context
        self.config = config or {}

        self.agents: Dict[str, BaseDesignAgent] = {}
        self.outputs: Dict[str, AgentOutput] = {}
        self.all_conflicts: List[Conflict] = []
        self.resolved_conflicts: List[Resolution] = []

        self.phase = CoordinationPhase.INITIALIZATION
        self.iteration = 0
        self.max_iterations = self.config.get("max_iterations", 5)
        self.convergence_threshold = self.config.get("convergence_threshold", 0.95)

        self._start_time: Optional[datetime] = None

    def register_agent(self, agent: BaseDesignAgent):
        """Register an agent with the coordinator"""
        self.agents[agent.name] = agent
        logger.info(f"Registered agent: {agent.name} (domain: {agent.domain})")

    def get_execution_order(self) -> List[List[str]]:
        """
        Determine agent execution order based on dependencies.

        Returns:
            List of groups, where agents in the same group can run in parallel
        """
        # Build dependency graph
        remaining = set(self.agents.keys())
        executed: Set[str] = set()
        order: List[List[str]] = []

        while remaining:
            # Find agents with all dependencies satisfied
            ready = []
            for name in remaining:
                agent = self.agents[name]
                deps = set(agent.dependencies)
                if deps.issubset(executed):
                    ready.append(name)

            if not ready:
                # Circular dependency or missing agent
                logger.warning(f"Could not resolve dependencies for: {remaining}")
                ready = list(remaining)[:1]  # Force one to run

            order.append(ready)
            executed.update(ready)
            remaining -= set(ready)

        return order

    async def run_agent(
        self,
        agent_name: str,
        inputs: Dict[str, Any],
        constraints: Dict[str, Any] = None
    ) -> AgentOutput:
        """
        Run a single agent.

        Args:
            agent_name: Name of the agent to run
            inputs: Input data for the agent
            constraints: Constraints from other agents

        Returns:
            AgentOutput from the agent
        """
        agent = self.agents.get(agent_name)
        if not agent:
            raise ValueError(f"Agent not found: {agent_name}")

        # Gather outputs from dependencies
        dep_outputs = {}
        for dep in agent.dependencies:
            if dep in self.outputs:
                dep_outputs[dep] = self.outputs[dep].design_data

        # Merge dependency outputs with inputs
        full_inputs = {**inputs, "dependency_outputs": dep_outputs}

        logger.info(f"Running agent: {agent_name}")
        output = await agent.run(full_inputs, constraints)
        self.outputs[agent_name] = output

        # Collect conflicts
        self.all_conflicts.extend(output.conflicts)

        return output

    async def run_parallel(
        self,
        agent_names: List[str],
        inputs: Dict[str, Any],
        constraints: Dict[str, Any] = None
    ) -> Dict[str, AgentOutput]:
        """
        Run multiple agents in parallel.

        Args:
            agent_names: Names of agents to run
            inputs: Common input data
            constraints: Common constraints

        Returns:
            Dict of agent outputs
        """
        tasks = [
            self.run_agent(name, inputs, constraints)
            for name in agent_names
        ]

        results = await asyncio.gather(*tasks, return_exceptions=True)

        outputs = {}
        for name, result in zip(agent_names, results):
            if isinstance(result, Exception):
                logger.error(f"Agent {name} failed: {result}")
            else:
                outputs[name] = result

        return outputs

    async def detect_conflicts(self) -> List[Conflict]:
        """
        Detect conflicts between agent outputs.

        Returns:
            List of detected conflicts
        """
        conflicts = []

        # Check spatial conflicts between architectural and structural
        if "architectural" in self.outputs and "structural" in self.outputs:
            arch_data = self.outputs["architectural"].design_data
            struct_data = self.outputs["structural"].design_data

            # Check column placement vs space requirements
            columns = struct_data.get("columns", [])
            spaces = arch_data.get("spaces", [])

            for col in columns:
                col_pos = col.get("position", {})
                for space in spaces:
                    if self._point_in_space(col_pos, space):
                        if space.get("type") in ["open_office", "lobby", "atrium"]:
                            conflicts.append(Conflict(
                                id=f"spatial_col_{col.get('id')}_{space.get('id')}",
                                type=ConflictType.SPATIAL,
                                priority=ConflictPriority.MEDIUM,
                                source_agent="structural",
                                target_agent="architectural",
                                description=f"Column {col.get('id')} conflicts with open space {space.get('id')}",
                                location=col_pos,
                                affected_elements=[col.get("id"), space.get("id")]
                            ))

        # Check MEP vs structural conflicts
        if "mep" in self.outputs and "structural" in self.outputs:
            mep_data = self.outputs["mep"].design_data
            struct_data = self.outputs["structural"].design_data

            ducts = mep_data.get("ductwork", [])
            beams = struct_data.get("beams", [])

            for duct in ducts:
                for beam in beams:
                    if self._elements_intersect(duct, beam):
                        conflicts.append(Conflict(
                            id=f"mep_struct_{duct.get('id')}_{beam.get('id')}",
                            type=ConflictType.MEP_CLEARANCE,
                            priority=ConflictPriority.HIGH,
                            source_agent="mep",
                            target_agent="structural",
                            description=f"Duct {duct.get('id')} intersects beam {beam.get('id')}",
                            location=duct.get("path", [{}])[0],
                            affected_elements=[duct.get("id"), beam.get("id")]
                        ))

        return conflicts

    def _point_in_space(self, point: Dict[str, float], space: Dict[str, Any]) -> bool:
        """Check if a point is inside a space boundary"""
        if not point or not space:
            return False

        bounds = space.get("bounds", {})
        x, y = point.get("x", 0), point.get("y", 0)
        min_x = bounds.get("min_x", 0)
        max_x = bounds.get("max_x", 0)
        min_y = bounds.get("min_y", 0)
        max_y = bounds.get("max_y", 0)

        return min_x <= x <= max_x and min_y <= y <= max_y

    def _elements_intersect(self, elem1: Dict[str, Any], elem2: Dict[str, Any]) -> bool:
        """Check if two elements intersect (simplified AABB check)"""
        # Simplified intersection check
        bounds1 = elem1.get("bounds", {})
        bounds2 = elem2.get("bounds", {})

        if not bounds1 or not bounds2:
            return False

        # AABB intersection test
        return not (
            bounds1.get("max_x", 0) < bounds2.get("min_x", 0) or
            bounds1.get("min_x", 0) > bounds2.get("max_x", 0) or
            bounds1.get("max_y", 0) < bounds2.get("min_y", 0) or
            bounds1.get("min_y", 0) > bounds2.get("max_y", 0) or
            bounds1.get("max_z", 0) < bounds2.get("min_z", 0) or
            bounds1.get("min_z", 0) > bounds2.get("max_z", 0)
        )

    async def resolve_conflicts(self, conflicts: List[Conflict]) -> List[Resolution]:
        """
        Resolve detected conflicts.

        Args:
            conflicts: List of conflicts to resolve

        Returns:
            List of resolutions
        """
        from .conflict_resolver import ConflictResolver

        resolver = ConflictResolver(self.agents, self.outputs, self.context)
        resolutions = await resolver.resolve_all(conflicts)

        self.resolved_conflicts.extend(resolutions)
        return resolutions

    async def apply_resolutions(self, resolutions: List[Resolution]):
        """Apply resolutions to agent outputs"""
        for resolution in resolutions:
            if resolution.resolution_type == "modify":
                # Apply changes to the affected agent's output
                changes = resolution.changes
                for agent_name, agent_changes in changes.items():
                    if agent_name in self.outputs:
                        # Deep merge changes into design_data
                        self._deep_merge(
                            self.outputs[agent_name].design_data,
                            agent_changes
                        )

    def _deep_merge(self, base: Dict, updates: Dict):
        """Deep merge updates into base dict"""
        for key, value in updates.items():
            if key in base and isinstance(base[key], dict) and isinstance(value, dict):
                self._deep_merge(base[key], value)
            else:
                base[key] = value

    def check_convergence(self) -> bool:
        """Check if the design has converged"""
        if self.iteration < 2:
            return False

        # Check if conflicts are reducing
        current_conflicts = len(self.all_conflicts)
        if current_conflicts == 0:
            return True

        # Check if all critical conflicts are resolved
        critical = [c for c in self.all_conflicts
                    if c.priority in [ConflictPriority.CRITICAL, ConflictPriority.HIGH]]

        if critical:
            return False

        # Check confidence levels
        avg_confidence = sum(
            o.decisions[-1].confidence if o.decisions else 0.5
            for o in self.outputs.values()
        ) / max(len(self.outputs), 1)

        return avg_confidence >= self.convergence_threshold

    async def integrate_designs(self) -> Dict[str, Any]:
        """
        Integrate all agent outputs into a unified design.

        Returns:
            Integrated design data
        """
        integrated = {
            "project": self.context,
            "components": {},
            "geometry": {},
            "metrics": {},
            "decisions": []
        }

        for agent_name, output in self.outputs.items():
            # Add component data
            integrated["components"][agent_name] = output.design_data

            # Merge geometry
            if output.geometry:
                integrated["geometry"][agent_name] = output.geometry

            # Aggregate metrics
            for key, value in output.metrics.items():
                metric_key = f"{agent_name}_{key}"
                integrated["metrics"][metric_key] = value

            # Collect decisions
            integrated["decisions"].extend([d.__dict__ for d in output.decisions])

        # Calculate aggregate metrics
        integrated["metrics"]["total_conflicts"] = len(self.all_conflicts)
        integrated["metrics"]["resolved_conflicts"] = len(self.resolved_conflicts)
        integrated["metrics"]["iterations"] = self.iteration

        return integrated

    async def run(self, inputs: Dict[str, Any] = None) -> CoordinationResult:
        """
        Execute the full coordination pipeline.

        Args:
            inputs: Initial inputs for the coordination

        Returns:
            CoordinationResult with all outputs
        """
        self._start_time = datetime.utcnow()
        inputs = inputs or {}

        try:
            # Phase 1: Initialize
            self.phase = CoordinationPhase.INITIALIZATION
            logger.info("=== Starting Coordination ===")

            # Get execution order
            execution_order = self.get_execution_order()
            logger.info(f"Execution order: {execution_order}")

            # Phase 2: Run architectural agent first (foundation)
            self.phase = CoordinationPhase.ARCHITECTURAL
            if "architectural" in self.agents:
                logger.info("=== Phase: Architectural Design ===")
                await self.run_agent("architectural", inputs)

            # Phase 3: Run other agents in parallel where possible
            self.phase = CoordinationPhase.PARALLEL_ANALYSIS
            for group in execution_order:
                # Skip architectural (already run)
                group = [a for a in group if a != "architectural"]
                if group:
                    logger.info(f"=== Running parallel: {group} ===")
                    await self.run_parallel(group, inputs)

            # Phase 4: Detect and resolve conflicts
            self.phase = CoordinationPhase.CONFLICT_RESOLUTION
            while self.iteration < self.max_iterations:
                self.iteration += 1
                logger.info(f"=== Iteration {self.iteration}: Conflict Resolution ===")

                # Detect conflicts
                new_conflicts = await self.detect_conflicts()
                self.all_conflicts.extend(new_conflicts)

                if not new_conflicts:
                    logger.info("No conflicts detected")
                    break

                logger.info(f"Detected {len(new_conflicts)} conflicts")

                # Resolve conflicts
                resolutions = await self.resolve_conflicts(new_conflicts)
                await self.apply_resolutions(resolutions)

                # Check convergence
                if self.check_convergence():
                    logger.info("Design has converged")
                    break

                # Reset for next iteration
                self.all_conflicts = [
                    c for c in self.all_conflicts
                    if c.id not in [r.conflict_id for r in resolutions]
                ]

            # Phase 5: Final integration
            self.phase = CoordinationPhase.INTEGRATION
            logger.info("=== Phase: Integration ===")
            final_design = await self.integrate_designs()

            # Phase 6: Finalization
            self.phase = CoordinationPhase.FINALIZATION
            execution_time = (datetime.utcnow() - self._start_time).total_seconds()

            # Calculate final metrics
            metrics = {
                "total_agents": len(self.agents),
                "total_iterations": self.iteration,
                "total_conflicts": len(self.all_conflicts),
                "resolved_conflicts": len(self.resolved_conflicts),
                "execution_time": execution_time,
                "convergence_achieved": self.check_convergence()
            }

            logger.info(f"=== Coordination Complete in {execution_time:.2f}s ===")

            return CoordinationResult(
                success=True,
                phase=self.phase,
                iterations=self.iteration,
                agent_outputs=self.outputs,
                resolved_conflicts=self.resolved_conflicts,
                unresolved_conflicts=self.all_conflicts,
                final_design=final_design,
                metrics=metrics,
                execution_time=execution_time
            )

        except Exception as e:
            logger.error(f"Coordination failed: {e}")
            return CoordinationResult(
                success=False,
                phase=self.phase,
                iterations=self.iteration,
                agent_outputs=self.outputs,
                resolved_conflicts=self.resolved_conflicts,
                unresolved_conflicts=self.all_conflicts,
                final_design={},
                metrics={"error": str(e)},
                execution_time=(datetime.utcnow() - self._start_time).total_seconds()
            )

    def get_status(self) -> Dict[str, Any]:
        """Get current coordination status"""
        return {
            "phase": self.phase.value,
            "iteration": self.iteration,
            "agents": {
                name: agent.status.value
                for name, agent in self.agents.items()
            },
            "conflicts_pending": len(self.all_conflicts),
            "conflicts_resolved": len(self.resolved_conflicts)
        }


# Import ConflictType for backward compatibility
from .base_agent import ConflictType
