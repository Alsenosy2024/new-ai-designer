"""
AI Design Agents Package
========================
A comprehensive multi-agent system for architectural design automation.

This package contains autonomous agents that work together to produce
real, professional-quality architectural designs.

Agents:
- ArchitecturalAgent: Floor plans, massing, facades
- StructuralAgent: Structural systems, grids, member sizing
- MEPAgent: HVAC, electrical, plumbing systems
- InteriorAgent: Space planning, furniture, finishes
- LandscapeAgent: Site planning, outdoor spaces
- SustainabilityAgent: Energy, daylight, environmental analysis

Coordination:
- AgentCoordinator: Orchestrates all agents
- ConflictResolver: Resolves inter-agent conflicts
"""

from .base_agent import BaseDesignAgent, AgentOutput, AgentDecision, Conflict, Resolution
from .coordinator import AgentCoordinator
from .conflict_resolver import ConflictResolver
from .architectural_agent import ArchitecturalAgent
from .structural_agent import StructuralAgent
from .mep_agent import MEPAgent
from .interior_agent import InteriorAgent

__all__ = [
    "BaseDesignAgent",
    "AgentOutput",
    "AgentDecision",
    "Conflict",
    "Resolution",
    "AgentCoordinator",
    "ConflictResolver",
    "ArchitecturalAgent",
    "StructuralAgent",
    "MEPAgent",
    "InteriorAgent",
]
