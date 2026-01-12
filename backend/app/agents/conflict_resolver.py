"""
Conflict Resolver
=================
Intelligent conflict resolution between design agents.
Uses LLM-powered negotiation and rule-based resolution strategies.
"""

import logging
from typing import Any, Dict, List, Optional
from dataclasses import dataclass
import json

from .base_agent import (
    BaseDesignAgent, AgentOutput, Conflict, Resolution,
    ConflictType, ConflictPriority
)

logger = logging.getLogger(__name__)


@dataclass
class ResolutionStrategy:
    """A strategy for resolving a specific type of conflict"""
    name: str
    conflict_types: List[ConflictType]
    priority_threshold: ConflictPriority
    auto_resolve: bool  # Can be resolved without LLM
    resolution_func: str  # Name of the resolution method


class ConflictResolver:
    """
    Resolves conflicts between design agents using a combination of
    rule-based strategies and LLM-powered negotiation.
    """

    # Priority weights for conflict resolution decisions
    PRIORITY_WEIGHTS = {
        ConflictPriority.CRITICAL: 100,
        ConflictPriority.HIGH: 80,
        ConflictPriority.MEDIUM: 60,
        ConflictPriority.LOW: 40,
        ConflictPriority.OPTIONAL: 20
    }

    # Agent hierarchy for conflict resolution (lower = higher priority)
    AGENT_HIERARCHY = {
        "structural": 1,      # Safety first
        "mep": 2,             # Critical systems
        "architectural": 3,   # Space planning
        "interior": 4,        # Finishes
        "landscape": 5        # External
    }

    def __init__(
        self,
        agents: Dict[str, BaseDesignAgent],
        outputs: Dict[str, AgentOutput],
        context: Dict[str, Any],
        llm_client: Any = None
    ):
        """
        Initialize the conflict resolver.

        Args:
            agents: Dictionary of registered agents
            outputs: Current outputs from agents
            context: Project context
            llm_client: LLM client for complex negotiations
        """
        self.agents = agents
        self.outputs = outputs
        self.context = context
        self.llm = llm_client

        # Define resolution strategies
        self.strategies = self._define_strategies()

    def _define_strategies(self) -> List[ResolutionStrategy]:
        """Define conflict resolution strategies"""
        return [
            ResolutionStrategy(
                name="structural_safety",
                conflict_types=[ConflictType.STRUCTURAL],
                priority_threshold=ConflictPriority.CRITICAL,
                auto_resolve=True,
                resolution_func="_resolve_structural_safety"
            ),
            ResolutionStrategy(
                name="code_compliance",
                conflict_types=[ConflictType.CODE],
                priority_threshold=ConflictPriority.HIGH,
                auto_resolve=True,
                resolution_func="_resolve_code_compliance"
            ),
            ResolutionStrategy(
                name="spatial_optimization",
                conflict_types=[ConflictType.SPATIAL],
                priority_threshold=ConflictPriority.MEDIUM,
                auto_resolve=False,
                resolution_func="_resolve_spatial"
            ),
            ResolutionStrategy(
                name="mep_routing",
                conflict_types=[ConflictType.MEP_CLEARANCE],
                priority_threshold=ConflictPriority.HIGH,
                auto_resolve=True,
                resolution_func="_resolve_mep_clearance"
            ),
            ResolutionStrategy(
                name="cost_optimization",
                conflict_types=[ConflictType.COST],
                priority_threshold=ConflictPriority.LOW,
                auto_resolve=False,
                resolution_func="_resolve_cost"
            ),
            ResolutionStrategy(
                name="aesthetic_balance",
                conflict_types=[ConflictType.AESTHETIC],
                priority_threshold=ConflictPriority.OPTIONAL,
                auto_resolve=False,
                resolution_func="_resolve_aesthetic"
            ),
        ]

    async def resolve_all(self, conflicts: List[Conflict]) -> List[Resolution]:
        """
        Resolve all conflicts.

        Args:
            conflicts: List of conflicts to resolve

        Returns:
            List of resolutions
        """
        # Sort by priority (highest first)
        sorted_conflicts = sorted(
            conflicts,
            key=lambda c: self.PRIORITY_WEIGHTS[c.priority],
            reverse=True
        )

        resolutions = []
        for conflict in sorted_conflicts:
            resolution = await self.resolve(conflict)
            if resolution:
                resolutions.append(resolution)

        return resolutions

    async def resolve(self, conflict: Conflict) -> Optional[Resolution]:
        """
        Resolve a single conflict.

        Args:
            conflict: The conflict to resolve

        Returns:
            Resolution or None if unresolvable
        """
        logger.info(f"Resolving conflict: {conflict.id} ({conflict.type.value})")

        # Find applicable strategy
        strategy = self._find_strategy(conflict)

        if strategy and strategy.auto_resolve:
            # Use rule-based resolution
            resolution = await self._apply_strategy(strategy, conflict)
        else:
            # Use LLM-powered negotiation
            resolution = await self._negotiate_resolution(conflict)

        if resolution:
            logger.info(f"Resolved conflict {conflict.id}: {resolution.resolution_type}")
        else:
            logger.warning(f"Could not resolve conflict {conflict.id}")

        return resolution

    def _find_strategy(self, conflict: Conflict) -> Optional[ResolutionStrategy]:
        """Find the best strategy for a conflict"""
        for strategy in self.strategies:
            if conflict.type in strategy.conflict_types:
                if self.PRIORITY_WEIGHTS[conflict.priority] >= \
                   self.PRIORITY_WEIGHTS[strategy.priority_threshold]:
                    return strategy
        return None

    async def _apply_strategy(
        self,
        strategy: ResolutionStrategy,
        conflict: Conflict
    ) -> Resolution:
        """Apply a resolution strategy"""
        method = getattr(self, strategy.resolution_func, None)
        if method:
            return await method(conflict)
        return await self._default_resolution(conflict)

    async def _resolve_structural_safety(self, conflict: Conflict) -> Resolution:
        """
        Resolve structural safety conflicts.
        Structural requirements always win.
        """
        # Get structural agent's requirements
        struct_output = self.outputs.get("structural", {})
        struct_data = struct_output.design_data if struct_output else {}

        # Structural wins - other agents must adapt
        changes = {
            conflict.target_agent: {
                "adaptations": [{
                    "reason": "structural_safety",
                    "affected_elements": conflict.affected_elements,
                    "action": "modify_around_structure"
                }]
            }
        }

        return Resolution(
            conflict_id=conflict.id,
            resolution_type="modify",
            description=f"Structural safety takes priority. {conflict.target_agent} must adapt.",
            changes=changes,
            resolved_by="conflict_resolver",
            confidence=0.95
        )

    async def _resolve_code_compliance(self, conflict: Conflict) -> Resolution:
        """
        Resolve building code compliance conflicts.
        Code requirements are non-negotiable.
        """
        # Identify the non-compliant element
        affected = conflict.affected_elements

        changes = {
            conflict.source_agent: {
                "code_adjustments": [{
                    "elements": affected,
                    "action": "modify_for_compliance",
                    "code_reference": conflict.description
                }]
            }
        }

        return Resolution(
            conflict_id=conflict.id,
            resolution_type="modify",
            description=f"Design modified for code compliance: {conflict.description}",
            changes=changes,
            resolved_by="conflict_resolver",
            confidence=0.90
        )

    async def _resolve_mep_clearance(self, conflict: Conflict) -> Resolution:
        """
        Resolve MEP clearance conflicts.
        Try to reroute MEP first, then structural modification.
        """
        mep_output = self.outputs.get("mep", {})
        struct_output = self.outputs.get("structural", {})

        # Check if MEP can be rerouted
        mep_element = conflict.affected_elements[0] if conflict.affected_elements else None

        if mep_element:
            # Try rerouting strategy
            changes = {
                "mep": {
                    "reroutes": [{
                        "element_id": mep_element,
                        "action": "find_alternative_path",
                        "avoid": conflict.affected_elements[1:],
                        "clearance_required": 0.15  # 150mm clearance
                    }]
                }
            }

            return Resolution(
                conflict_id=conflict.id,
                resolution_type="relocate",
                description=f"MEP element {mep_element} will be rerouted to avoid conflict",
                changes=changes,
                resolved_by="conflict_resolver",
                confidence=0.85
            )

        return await self._default_resolution(conflict)

    async def _resolve_spatial(self, conflict: Conflict) -> Resolution:
        """
        Resolve spatial conflicts between agents.
        Uses LLM for complex negotiations.
        """
        if self.llm:
            return await self._negotiate_resolution(conflict)
        return await self._default_resolution(conflict)

    async def _resolve_cost(self, conflict: Conflict) -> Resolution:
        """
        Resolve cost-related conflicts.
        Optimize for budget while maintaining quality.
        """
        # Calculate cost impact
        budget = self.context.get("budget", 0)

        changes = {
            conflict.source_agent: {
                "cost_optimizations": [{
                    "action": "value_engineer",
                    "target_saving": budget * 0.05,  # 5% saving target
                    "maintain_quality": True
                }]
            }
        }

        return Resolution(
            conflict_id=conflict.id,
            resolution_type="modify",
            description="Cost optimization applied while maintaining design quality",
            changes=changes,
            resolved_by="conflict_resolver",
            confidence=0.75
        )

    async def _resolve_aesthetic(self, conflict: Conflict) -> Resolution:
        """
        Resolve aesthetic conflicts.
        Balance between different design preferences.
        """
        return await self._negotiate_resolution(conflict)

    async def _negotiate_resolution(self, conflict: Conflict) -> Resolution:
        """
        Use LLM to negotiate a resolution between agents.
        """
        # Get relevant context from both agents
        source_data = {}
        target_data = {}

        if conflict.source_agent in self.outputs:
            source_data = self.outputs[conflict.source_agent].design_data
        if conflict.target_agent in self.outputs:
            target_data = self.outputs[conflict.target_agent].design_data

        # Determine agent priorities
        source_priority = self.AGENT_HIERARCHY.get(conflict.source_agent, 10)
        target_priority = self.AGENT_HIERARCHY.get(conflict.target_agent, 10)

        # Build negotiation prompt
        prompt = f"""
        You are a BIM Coordinator resolving a design conflict between agents.

        CONFLICT DETAILS:
        - Type: {conflict.type.value}
        - Priority: {conflict.priority.value}
        - Description: {conflict.description}
        - Source Agent: {conflict.source_agent} (hierarchy: {source_priority})
        - Target Agent: {conflict.target_agent} (hierarchy: {target_priority})
        - Affected Elements: {conflict.affected_elements}

        SOURCE AGENT DATA (excerpt):
        {json.dumps(self._excerpt_data(source_data), indent=2)}

        TARGET AGENT DATA (excerpt):
        {json.dumps(self._excerpt_data(target_data), indent=2)}

        PROJECT CONTEXT:
        - Building Type: {self.context.get('building_type', 'unknown')}
        - Region: {self.context.get('region', 'unknown')}
        - Budget Priority: {self.context.get('budget_priority', 'balanced')}

        RESOLUTION RULES:
        1. Safety requirements (structural) cannot be compromised
        2. Code compliance is mandatory
        3. Lower hierarchy number = higher priority agent
        4. Consider cost and time implications

        Provide a resolution in JSON format:
        {{
            "resolution_type": "modify|relocate|accept|reject",
            "description": "Clear explanation of the resolution",
            "winner": "source|target|compromise",
            "changes": {{
                "agent_name": {{
                    "action": "description of what to change",
                    "elements": ["element_ids"]
                }}
            }},
            "confidence": 0.0-1.0,
            "reasoning": "Why this resolution is optimal"
        }}
        """

        if self.llm:
            try:
                response = await self.llm.generate(prompt)
                result = json.loads(response)

                return Resolution(
                    conflict_id=conflict.id,
                    resolution_type=result.get("resolution_type", "modify"),
                    description=result.get("description", "LLM-negotiated resolution"),
                    changes=result.get("changes", {}),
                    resolved_by="llm_negotiation",
                    confidence=result.get("confidence", 0.7)
                )
            except Exception as e:
                logger.error(f"LLM negotiation failed: {e}")

        # Fallback to hierarchy-based resolution
        return await self._hierarchy_resolution(conflict, source_priority, target_priority)

    async def _hierarchy_resolution(
        self,
        conflict: Conflict,
        source_priority: int,
        target_priority: int
    ) -> Resolution:
        """Resolve based on agent hierarchy"""
        if source_priority < target_priority:
            # Source agent wins
            winner = conflict.source_agent
            loser = conflict.target_agent
        else:
            # Target agent wins
            winner = conflict.target_agent
            loser = conflict.source_agent

        changes = {
            loser: {
                "adaptations": [{
                    "reason": "hierarchy_resolution",
                    "adapt_to": winner,
                    "affected_elements": conflict.affected_elements
                }]
            }
        }

        return Resolution(
            conflict_id=conflict.id,
            resolution_type="modify",
            description=f"{winner} takes priority. {loser} must adapt design.",
            changes=changes,
            resolved_by="hierarchy_resolution",
            confidence=0.70
        )

    async def _default_resolution(self, conflict: Conflict) -> Resolution:
        """Default resolution when no specific strategy applies"""
        return Resolution(
            conflict_id=conflict.id,
            resolution_type="accept",
            description="Conflict accepted pending manual review",
            changes={},
            resolved_by="default",
            confidence=0.50
        )

    def _excerpt_data(self, data: Dict[str, Any], max_items: int = 5) -> Dict[str, Any]:
        """Extract relevant excerpt from agent data"""
        if not data:
            return {}

        excerpt = {}
        for key, value in data.items():
            if isinstance(value, list):
                excerpt[key] = value[:max_items]
                if len(value) > max_items:
                    excerpt[f"{key}_count"] = len(value)
            elif isinstance(value, dict):
                excerpt[key] = self._excerpt_data(value, max_items)
            else:
                excerpt[key] = value

        return excerpt

    def analyze_conflicts(self, conflicts: List[Conflict]) -> Dict[str, Any]:
        """
        Analyze conflicts and provide summary.

        Args:
            conflicts: List of conflicts

        Returns:
            Analysis summary
        """
        if not conflicts:
            return {"total": 0, "summary": "No conflicts detected"}

        analysis = {
            "total": len(conflicts),
            "by_type": {},
            "by_priority": {},
            "by_agent_pair": {},
            "critical_count": 0,
            "auto_resolvable": 0
        }

        for conflict in conflicts:
            # By type
            type_key = conflict.type.value
            analysis["by_type"][type_key] = analysis["by_type"].get(type_key, 0) + 1

            # By priority
            priority_key = conflict.priority.value
            analysis["by_priority"][priority_key] = analysis["by_priority"].get(priority_key, 0) + 1

            # By agent pair
            pair_key = f"{conflict.source_agent}_{conflict.target_agent}"
            analysis["by_agent_pair"][pair_key] = analysis["by_agent_pair"].get(pair_key, 0) + 1

            # Critical count
            if conflict.priority == ConflictPriority.CRITICAL:
                analysis["critical_count"] += 1

            # Auto-resolvable
            strategy = self._find_strategy(conflict)
            if strategy and strategy.auto_resolve:
                analysis["auto_resolvable"] += 1

        return analysis
