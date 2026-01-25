"""
Agent-Based Design Orchestrator
===============================
Integrates the new multi-agent system with the existing pipeline.
Provides real design generation capabilities using autonomous agents.
"""

import asyncio
import json
import logging
import os
from datetime import datetime
from typing import Any, Dict, List, Optional

from app import models
from app.config import GEMINI_API_KEY, GEMINI_MODEL, STORAGE_DIR
from app.db import SessionLocal

# Import agents
from app.agents import (
    AgentCoordinator,
    ArchitecturalAgent,
    StructuralAgent,
    MEPAgent,
    InteriorAgent,
)

logger = logging.getLogger(__name__)


class LLMClient:
    """Simple LLM client wrapper for agents"""

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or GEMINI_API_KEY
        self.model = model or GEMINI_MODEL

    async def generate(self, prompt: str) -> str:
        """Generate response from LLM"""
        try:
            from app.llm import _gemini_request
            # Run sync request in async context
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                _gemini_request,
                prompt,
                self.model,
                self.api_key,
            )
            return response or "{}"
        except Exception as e:
            logger.error(f"LLM call failed: {e}")
            # Return empty JSON as fallback
            return "{}"


class AgentDesignOrchestrator:
    """
    Orchestrates the multi-agent design process.

    This class integrates with the existing orchestrator to provide
    enhanced design generation using autonomous agents.
    """

    def __init__(self, project: models.Project, db: SessionLocal):
        """
        Initialize the agent orchestrator.

        Args:
            project: The project model
            db: Database session
        """
        self.project = project
        self.db = db
        self.llm_client = LLMClient()

        # Build project context from model
        self.context = self._build_context()

        # Initialize coordinator
        self.coordinator = AgentCoordinator(
            project_context=self.context,
            config={
                "max_iterations": 5,
                "convergence_threshold": 0.9
            }
        )

        # Storage path
        self.storage_path = os.path.join(STORAGE_DIR, f"project_{project.id}")
        os.makedirs(self.storage_path, exist_ok=True)

    def _parse_number(self, value: Any, fallback: float) -> float:
        if value is None:
            return fallback
        if isinstance(value, (int, float)):
            return float(value)
        digits = "".join([char for char in str(value) if char.isdigit() or char == "."])
        if not digits:
            return fallback
        try:
            return float(digits)
        except ValueError:
            return fallback

    def _parse_ratio(self, value: Any, fallback: float) -> float:
        ratio = self._parse_number(value, fallback)
        if ratio > 1:
            ratio = ratio / 100
        return max(0.05, min(0.4, ratio))

    def _normalize_text(self, value: Any, fallback: str) -> str:
        text = str(value or "").strip()
        return text.lower() if text else fallback

    def _build_context(self) -> Dict[str, Any]:
        """Build project context from database model"""
        gfa = self._parse_number(self.project.gfa, 10000)
        floors = max(int(self._parse_number(self.project.floors, 10)), 1)
        return {
            "id": self.project.id,
            "name": self.project.name or "Untitled Project",
            "region": self._normalize_text(self.project.region, "international"),
            "building_type": self._normalize_text(self.project.building_type, "office"),
            "gfa": gfa,
            "floors": floors,
            "core_ratio": self._parse_ratio(self.project.core_ratio, 0.12),
            "structural_system": self.project.structural_system,
            "mep_strategy": self.project.mep_strategy,
            "budget": self.project.budget or "standard",
            "energy_target": self.project.energy_target,
            "daylight_requirement": self.project.daylight,
            "code_library": self.project.code_library,
            "brief": self.project.brief
        }

    def _log_event(self, run: models.Run, message: str, step: str = "", level: str = "info"):
        """Log an event to the database"""
        event = models.RunEvent(run=run, message=message, step=step, level=level)
        self.db.add(event)
        self.db.commit()

    async def run_agents(self, run: models.Run) -> Dict[str, Any]:
        """
        Run the multi-agent design process.

        Args:
            run: The run model to track progress

        Returns:
            Integrated design output from all agents
        """
        logger.info(f"Starting agent-based design for project {self.project.id}")

        self._log_event(run, "Initializing AI design agents...", "init", "info")

        # Register agents - Use Enhanced Agent if available
        try:
            from app.agents.enhanced_architectural_agent import EnhancedArchitecturalAgent
            self._log_event(run, "Registering Enhanced Architectural Agent (Gemini 2.0)", "init", "info")
            arch_agent = EnhancedArchitecturalAgent(self.llm_client, self.context)
            logger.info("Using Enhanced Architectural Agent with AI-powered space planning")
        except ImportError:
            self._log_event(run, "Registering Architectural Agent", "init", "info")
            arch_agent = ArchitecturalAgent(self.llm_client, self.context)
            logger.info("Using standard Architectural Agent")
        self.coordinator.register_agent(arch_agent)

        self._log_event(run, "Registering Structural Agent", "init", "info")
        struct_agent = StructuralAgent(self.llm_client, self.context)
        self.coordinator.register_agent(struct_agent)

        self._log_event(run, "Registering MEP Agent", "init", "info")
        mep_agent = MEPAgent(self.llm_client, self.context)
        self.coordinator.register_agent(mep_agent)

        self._log_event(run, "Registering Interior Design Agent", "init", "info")
        interior_agent = InteriorAgent(self.llm_client, self.context)
        self.coordinator.register_agent(interior_agent)

        # Run coordination
        self._log_event(run, "Starting multi-agent coordination...", "coordination", "info")

        try:
            result = await self.coordinator.run()

            if result.success:
                self._log_event(
                    run,
                    f"Design coordination completed in {result.iterations} iterations",
                    "coordination",
                    "info"
                )

                # Log conflict resolution
                if result.resolved_conflicts:
                    self._log_event(
                        run,
                        f"Resolved {len(result.resolved_conflicts)} design conflicts",
                        "coordination",
                        "info"
                    )

                # Log unresolved conflicts
                if result.unresolved_conflicts:
                    self._log_event(
                        run,
                        f"Warning: {len(result.unresolved_conflicts)} conflicts pending review",
                        "coordination",
                        "warning"
                    )

                # Save agent outputs
                await self._save_outputs(run, result)

                return result.final_design
            else:
                self._log_event(
                    run,
                    f"Design coordination failed at phase: {result.phase.value}",
                    "coordination",
                    "error"
                )
                return {}

        except Exception as e:
            logger.error(f"Agent coordination failed: {e}")
            self._log_event(run, f"Agent error: {str(e)}", "coordination", "error")
            raise

    async def run_architecture_only(self, run: models.Run) -> Dict[str, Any]:
        """Run architecture-only pipeline for gated review."""
        logger.info(f"Starting architecture-only design for project {self.project.id}")

        self._log_event(run, "Initializing Architectural Agent...", "init", "info")
        arch_agent = ArchitecturalAgent(self.llm_client, self.context)
        self.coordinator.register_agent(arch_agent)

        self._log_event(run, "Starting architectural coordination...", "coordination", "info")
        result = await self.coordinator.run()

        if result.success:
            self._log_event(
                run,
                f"Architectural design completed in {result.iterations} iterations",
                "coordination",
                "info",
            )
            await self._save_outputs(run, result)
            return result.final_design

        self._log_event(
            run,
            f"Architectural coordination failed at phase: {result.phase.value}",
            "coordination",
            "error",
        )
        return {}

    async def _save_outputs(self, run: models.Run, result) -> None:
        """Save agent outputs to storage"""

        # Save complete design data
        design_path = os.path.join(self.storage_path, f"run_{run.id}_design.json")
        with open(design_path, "w") as f:
            json.dump(result.final_design, f, indent=2, default=str)

        self._log_event(run, f"Saved design data to {design_path}", "output", "info")

        # Save individual agent outputs
        for agent_name, output in result.agent_outputs.items():
            output_path = os.path.join(
                self.storage_path,
                f"run_{run.id}_{agent_name}.json"
            )
            with open(output_path, "w") as f:
                json.dump(output.to_dict(), f, indent=2, default=str)

        # Save decisions log
        decisions_path = os.path.join(self.storage_path, f"run_{run.id}_decisions.json")
        all_decisions = []
        for agent_name, output in result.agent_outputs.items():
            for decision in output.decisions:
                all_decisions.append({
                    "agent": agent_name,
                    "decision": decision.decision,
                    "reasoning": decision.reasoning,
                    "confidence": decision.confidence,
                    "timestamp": decision.timestamp.isoformat()
                })

        with open(decisions_path, "w") as f:
            json.dump(all_decisions, f, indent=2)

        # Save conflicts log
        conflicts_path = os.path.join(self.storage_path, f"run_{run.id}_conflicts.json")
        conflicts_data = {
            "resolved": [
                {
                    "conflict_id": r.conflict_id,
                    "resolution_type": r.resolution_type,
                    "description": r.description,
                    "resolved_by": r.resolved_by,
                    "confidence": r.confidence
                }
                for r in result.resolved_conflicts
            ],
            "unresolved": [
                {
                    "id": c.id,
                    "type": c.type.value,
                    "priority": c.priority.value,
                    "source": c.source_agent,
                    "target": c.target_agent,
                    "description": c.description
                }
                for c in result.unresolved_conflicts
            ]
        }
        with open(conflicts_path, "w") as f:
            json.dump(conflicts_data, f, indent=2)

    def extract_massing(self, design: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract massing data from agent design for compatibility with existing pipeline.

        Args:
            design: Integrated design from agents

        Returns:
            Massing dictionary compatible with existing IFC generation
        """
        arch_component = design.get("components", {}).get("architectural", {})
        massing = arch_component.get("massing", {})

        return {
            "width": massing.get("width", 40),
            "depth": massing.get("depth", 30),
            "height": massing.get("height", 36),
            "floors": massing.get("floors", 10),
            "floor_area": massing.get("width", 40) * massing.get("depth", 30),
            "core_ratio": self.context.get("core_ratio", 0.12),
            "module": 8.4,
            "grid_x": len(arch_component.get("floor_plans", [{}])[0].get("grid_x", [0,8,16,24])) - 1,
            "grid_y": len(arch_component.get("floor_plans", [{}])[0].get("grid_y", [0,8,16])) - 1
        }

    def extract_structural_data(self, design: Dict[str, Any]) -> Dict[str, Any]:
        """Extract structural data for reports"""
        struct_component = design.get("components", {}).get("structural", {})

        return {
            "system": struct_component.get("system", "moment_frame"),
            "material": struct_component.get("material", "concrete"),
            "columns": struct_component.get("columns", []),
            "beams": struct_component.get("beams", []),
            "analysis": struct_component.get("analysis", {}),
            "metrics": struct_component.get("metrics", {})
        }

    def extract_mep_data(self, design: Dict[str, Any]) -> Dict[str, Any]:
        """Extract MEP data for reports"""
        mep_component = design.get("components", {}).get("mep", {})

        return {
            "hvac": mep_component.get("hvac", {}),
            "electrical": mep_component.get("electrical", {}),
            "plumbing": mep_component.get("plumbing", {}),
            "fire_protection": mep_component.get("fire_protection", {}),
            "metrics": mep_component.get("metrics", {})
        }

    def extract_interior_data(self, design: Dict[str, Any]) -> Dict[str, Any]:
        """Extract interior design data"""
        interior_component = design.get("components", {}).get("interior", {})

        return {
            "style": interior_component.get("style", "modern"),
            "furniture_schedule": interior_component.get("furniture_schedule", []),
            "finish_schedule": interior_component.get("finish_schedule", []),
            "lighting_schedule": interior_component.get("lighting_schedule", []),
            "ffe_budget": interior_component.get("ffe_budget", {})
        }

    def get_design_summary(self, design: Dict[str, Any]) -> str:
        """Generate a summary of the design"""
        metrics = design.get("metrics", {})
        components = design.get("components", {})

        summary_parts = [
            f"# Design Summary for {self.context['name']}",
            "",
            "## Project Overview",
            f"- Building Type: {self.context['building_type']}",
            f"- Location: {self.context['region']}",
            f"- Gross Floor Area: {self.context['gfa']:,} m²",
            f"- Number of Floors: {self.context['floors']}",
            "",
            "## Design Metrics"
        ]

        # Add architectural metrics
        arch = components.get("architectural", {}).get("metrics", {})
        if arch:
            summary_parts.extend([
                "",
                "### Architectural",
                f"- Efficiency Ratio: {arch.get('efficiency_ratio', 0):.1f}%",
                f"- Net Floor Area: {arch.get('net_floor_area', 0):,.0f} m²",
                f"- Facade Area: {arch.get('facade_area', 0):,.0f} m²"
            ])

        # Add structural metrics
        struct = components.get("structural", {}).get("metrics", {})
        if struct:
            summary_parts.extend([
                "",
                "### Structural",
                f"- System: {components.get('structural', {}).get('system', 'N/A')}",
                f"- Columns: {struct.get('column_count', 0)}",
                f"- Average Column Utilization: {struct.get('avg_column_utilization', 0)*100:.1f}%",
                f"- Max Drift Ratio: {struct.get('max_drift_ratio', 0):.4f}"
            ])

        # Add MEP metrics
        mep = components.get("mep", {}).get("metrics", {})
        if mep:
            summary_parts.extend([
                "",
                "### MEP",
                f"- Cooling Capacity: {mep.get('cooling_capacity_w_per_m2', 0):.0f} W/m²",
                f"- Electrical Load: {mep.get('electrical_load_w_per_m2', 0):.0f} W/m²",
                f"- Estimated EUI: {mep.get('estimated_eui_kwh_per_m2', 0):.0f} kWh/m²·year"
            ])

        # Add interior metrics
        interior = components.get("interior", {}).get("metrics", {})
        if interior:
            summary_parts.extend([
                "",
                "### Interior",
                f"- Furniture Items: {interior.get('total_furniture_items', 0)}",
                f"- Lighting Fixtures: {interior.get('total_lighting_fixtures', 0)}",
                f"- Total Lighting Wattage: {interior.get('total_lighting_wattage', 0):,.0f} W"
            ])

        # Coordination metrics
        summary_parts.extend([
            "",
            "## Coordination",
            f"- Total Iterations: {metrics.get('total_iterations', 0)}",
            f"- Resolved Conflicts: {metrics.get('resolved_conflicts', 0)}",
            f"- Convergence: {'Achieved' if metrics.get('convergence_achieved', False) else 'Pending'}"
        ])

        return "\n".join(summary_parts)


async def run_agent_pipeline(project_id: int, run_id: int) -> Dict[str, Any]:
    """
    Main entry point for running the agent-based design pipeline.

    Args:
        project_id: Project ID
        run_id: Run ID for tracking

    Returns:
        Design output dictionary
    """
    db = SessionLocal()
    try:
        project = db.query(models.Project).filter(models.Project.id == project_id).first()
        run = db.query(models.Run).filter(models.Run.id == run_id).first()

        if not project or not run:
            raise ValueError(f"Project {project_id} or Run {run_id} not found")

        orchestrator = AgentDesignOrchestrator(project, db)
        design = await orchestrator.run_agents(run)

        return {
            "design": design,
            "massing": orchestrator.extract_massing(design),
            "structural": orchestrator.extract_structural_data(design),
            "mep": orchestrator.extract_mep_data(design),
            "interior": orchestrator.extract_interior_data(design),
            "summary": orchestrator.get_design_summary(design)
        }

    finally:
        db.close()


async def run_architecture_pipeline(project_id: int, run_id: int) -> Dict[str, Any]:
    """Architecture-only pipeline for gated approval."""
    db = SessionLocal()
    try:
        project = db.query(models.Project).filter(models.Project.id == project_id).first()
        run = db.query(models.Run).filter(models.Run.id == run_id).first()

        if not project or not run:
            raise ValueError(f"Project {project_id} or Run {run_id} not found")

        orchestrator = AgentDesignOrchestrator(project, db)
        design = await orchestrator.run_architecture_only(run)

        return {
            "design": design,
            "massing": orchestrator.extract_massing(design),
            "structural": {},
            "mep": {},
            "interior": {},
            "summary": orchestrator.get_design_summary(design),
        }
    finally:
        db.close()


# Synchronous wrapper for existing pipeline integration
def run_agent_pipeline_sync(project_id: int, run_id: int) -> Dict[str, Any]:
    """Synchronous wrapper for the async pipeline"""
    return asyncio.run(run_agent_pipeline(project_id, run_id))


def run_architecture_pipeline_sync(project_id: int, run_id: int) -> Dict[str, Any]:
    """Synchronous wrapper for the architecture-only pipeline"""
    return asyncio.run(run_architecture_pipeline(project_id, run_id))
