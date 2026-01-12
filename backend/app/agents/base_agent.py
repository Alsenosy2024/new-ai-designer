"""
Base Design Agent
=================
The foundational class for all design agents in the system.
Provides common functionality for analysis, design, validation, and optimization.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional, Tuple
import json
import asyncio
import logging

logger = logging.getLogger(__name__)


class AgentStatus(Enum):
    """Agent execution status"""
    IDLE = "idle"
    ANALYZING = "analyzing"
    DESIGNING = "designing"
    VALIDATING = "validating"
    OPTIMIZING = "optimizing"
    RESOLVING_CONFLICT = "resolving_conflict"
    COMPLETED = "completed"
    FAILED = "failed"


class ConflictType(Enum):
    """Types of conflicts between agents"""
    SPATIAL = "spatial"           # Physical space collision
    STRUCTURAL = "structural"     # Structural integrity issue
    FUNCTIONAL = "functional"     # Functional requirement violation
    CODE = "code"                 # Building code violation
    COST = "cost"                 # Budget constraint
    AESTHETIC = "aesthetic"       # Design aesthetics conflict
    MEP_CLEARANCE = "mep_clearance"  # MEP routing conflict


class ConflictPriority(Enum):
    """Conflict resolution priority levels"""
    CRITICAL = 100   # Safety-related, must be resolved
    HIGH = 80        # Code compliance
    MEDIUM = 60      # Functional requirements
    LOW = 40         # Optimization opportunities
    OPTIONAL = 20    # Nice-to-have improvements


@dataclass
class Conflict:
    """Represents a conflict between agents or design requirements"""
    id: str
    type: ConflictType
    priority: ConflictPriority
    source_agent: str
    target_agent: str
    description: str
    location: Optional[Dict[str, Any]] = None  # Spatial location if applicable
    affected_elements: List[str] = field(default_factory=list)
    suggested_resolutions: List[str] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.utcnow)


@dataclass
class Resolution:
    """Resolution for a conflict"""
    conflict_id: str
    resolution_type: str  # "modify", "relocate", "accept", "reject"
    description: str
    changes: Dict[str, Any]
    resolved_by: str
    confidence: float  # 0.0 to 1.0
    resolved_at: datetime = field(default_factory=datetime.utcnow)


@dataclass
class AgentDecision:
    """Records a decision made by an agent"""
    id: str
    agent_name: str
    decision: str
    reasoning: str
    alternatives_considered: List[str] = field(default_factory=list)
    confidence: float = 0.8
    timestamp: datetime = field(default_factory=datetime.utcnow)
    context: Dict[str, Any] = field(default_factory=dict)


@dataclass
class AgentOutput:
    """Standard output format for all agents"""
    agent_name: str
    status: AgentStatus
    design_data: Dict[str, Any]
    geometry: Optional[Dict[str, Any]] = None
    metrics: Dict[str, float] = field(default_factory=dict)
    decisions: List[AgentDecision] = field(default_factory=list)
    conflicts: List[Conflict] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    execution_time: float = 0.0
    created_at: datetime = field(default_factory=datetime.utcnow)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization"""
        return {
            "agent_name": self.agent_name,
            "status": self.status.value,
            "design_data": self.design_data,
            "geometry": self.geometry,
            "metrics": self.metrics,
            "decisions": [
                {
                    "id": d.id,
                    "decision": d.decision,
                    "reasoning": d.reasoning,
                    "confidence": d.confidence,
                    "timestamp": d.timestamp.isoformat()
                }
                for d in self.decisions
            ],
            "conflicts": [
                {
                    "id": c.id,
                    "type": c.type.value,
                    "priority": c.priority.value,
                    "description": c.description
                }
                for c in self.conflicts
            ],
            "warnings": self.warnings,
            "execution_time": self.execution_time,
            "created_at": self.created_at.isoformat()
        }


class BaseDesignAgent(ABC):
    """
    Base class for all design agents.

    Each agent is responsible for a specific domain of building design
    and can communicate with other agents through the coordinator.
    """

    def __init__(
        self,
        name: str,
        llm_client: Any,
        project_context: Dict[str, Any],
        config: Optional[Dict[str, Any]] = None
    ):
        """
        Initialize the design agent.

        Args:
            name: Agent identifier
            llm_client: LLM client for AI-powered decisions
            project_context: Project parameters and constraints
            config: Agent-specific configuration
        """
        self.name = name
        self.llm = llm_client
        self.context = project_context
        self.config = config or {}

        self.status = AgentStatus.IDLE
        self.decisions: List[AgentDecision] = []
        self.conflicts: List[Conflict] = []
        self.outputs: Dict[str, Any] = {}
        self.iteration = 0
        self.max_iterations = self.config.get("max_iterations", 5)

        # Performance tracking
        self._start_time: Optional[datetime] = None
        self._execution_times: List[float] = []

    @property
    @abstractmethod
    def domain(self) -> str:
        """Return the design domain this agent handles"""
        pass

    @property
    @abstractmethod
    def dependencies(self) -> List[str]:
        """Return list of agent names this agent depends on"""
        pass

    @abstractmethod
    async def analyze(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze inputs and requirements.

        Args:
            inputs: Input data including project context and other agent outputs

        Returns:
            Analysis results including constraints, opportunities, and requirements
        """
        pass

    @abstractmethod
    async def design(self, analysis: Dict[str, Any], constraints: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate design based on analysis.

        Args:
            analysis: Results from analyze phase
            constraints: External constraints from other agents

        Returns:
            Design output including geometry, specifications, and metrics
        """
        pass

    @abstractmethod
    async def validate(self, design: Dict[str, Any]) -> Tuple[bool, List[str]]:
        """
        Validate the design against requirements and codes.

        Args:
            design: Design output from design phase

        Returns:
            Tuple of (is_valid, list_of_issues)
        """
        pass

    @abstractmethod
    async def optimize(self, design: Dict[str, Any], objectives: List[str]) -> Dict[str, Any]:
        """
        Optimize the design for given objectives.

        Args:
            design: Current design
            objectives: List of optimization objectives (e.g., "cost", "energy", "area")

        Returns:
            Optimized design
        """
        pass

    async def run(self, inputs: Dict[str, Any], constraints: Dict[str, Any] = None) -> AgentOutput:
        """
        Execute the full agent pipeline: analyze → design → validate → optimize.

        Args:
            inputs: Input data for analysis
            constraints: External constraints

        Returns:
            AgentOutput with all results
        """
        self._start_time = datetime.utcnow()
        constraints = constraints or {}

        try:
            # Phase 1: Analyze
            self.status = AgentStatus.ANALYZING
            logger.info(f"[{self.name}] Starting analysis...")
            analysis = await self.analyze(inputs)
            self.log_decision(
                "analysis_complete",
                f"Completed analysis with {len(analysis.get('requirements', []))} requirements identified"
            )

            # Phase 2: Design
            self.status = AgentStatus.DESIGNING
            logger.info(f"[{self.name}] Generating design...")
            design = await self.design(analysis, constraints)
            self.log_decision(
                "design_generated",
                f"Generated initial design with {len(design.get('elements', []))} elements"
            )

            # Phase 3: Validate
            self.status = AgentStatus.VALIDATING
            logger.info(f"[{self.name}] Validating design...")
            is_valid, issues = await self.validate(design)

            if not is_valid:
                logger.warning(f"[{self.name}] Validation found {len(issues)} issues")
                for issue in issues:
                    self.add_warning(issue)

            # Phase 4: Optimize (if valid)
            if is_valid and self.config.get("auto_optimize", True):
                self.status = AgentStatus.OPTIMIZING
                logger.info(f"[{self.name}] Optimizing design...")
                objectives = self.config.get("optimization_objectives", ["efficiency"])
                design = await self.optimize(design, objectives)
                self.log_decision(
                    "design_optimized",
                    f"Optimized design for {', '.join(objectives)}"
                )

            # Calculate execution time
            execution_time = (datetime.utcnow() - self._start_time).total_seconds()
            self._execution_times.append(execution_time)

            self.status = AgentStatus.COMPLETED

            return AgentOutput(
                agent_name=self.name,
                status=self.status,
                design_data=design,
                geometry=design.get("geometry"),
                metrics=design.get("metrics", {}),
                decisions=self.decisions.copy(),
                conflicts=self.conflicts.copy(),
                warnings=list(self.outputs.get("warnings", [])),
                execution_time=execution_time
            )

        except Exception as e:
            self.status = AgentStatus.FAILED
            logger.error(f"[{self.name}] Failed: {str(e)}")
            raise

    async def resolve_conflict(self, conflict: Conflict, other_agent_output: Dict[str, Any]) -> Resolution:
        """
        Attempt to resolve a conflict with another agent.

        Args:
            conflict: The conflict to resolve
            other_agent_output: Output from the conflicting agent

        Returns:
            Resolution describing how the conflict was handled
        """
        self.status = AgentStatus.RESOLVING_CONFLICT

        # Use LLM to negotiate resolution
        prompt = f"""
        You are the {self.name} agent resolving a design conflict.

        Conflict Type: {conflict.type.value}
        Priority: {conflict.priority.value}
        Description: {conflict.description}

        Your current design: {json.dumps(self.outputs.get('design', {}), indent=2)[:1000]}

        Other agent's output: {json.dumps(other_agent_output, indent=2)[:1000]}

        Propose a resolution that:
        1. Maintains structural integrity
        2. Meets code requirements
        3. Minimizes design changes
        4. Optimizes for project objectives

        Return JSON with:
        {{
            "resolution_type": "modify|relocate|accept|reject",
            "description": "explanation",
            "changes": {{"element_id": "new_value"}},
            "confidence": 0.0-1.0
        }}
        """

        try:
            response = await self.llm.generate(prompt)
            resolution_data = json.loads(response)

            resolution = Resolution(
                conflict_id=conflict.id,
                resolution_type=resolution_data["resolution_type"],
                description=resolution_data["description"],
                changes=resolution_data.get("changes", {}),
                resolved_by=self.name,
                confidence=resolution_data.get("confidence", 0.7)
            )

            self.log_decision(
                f"conflict_resolved_{conflict.id}",
                resolution.description,
                confidence=resolution.confidence
            )

            return resolution

        except Exception as e:
            logger.error(f"[{self.name}] Conflict resolution failed: {e}")
            return Resolution(
                conflict_id=conflict.id,
                resolution_type="accept",
                description=f"Auto-accepted due to resolution failure: {str(e)}",
                changes={},
                resolved_by=self.name,
                confidence=0.3
            )

    def log_decision(
        self,
        decision: str,
        reasoning: str,
        alternatives: List[str] = None,
        confidence: float = 0.8,
        context: Dict[str, Any] = None
    ) -> AgentDecision:
        """
        Log a decision made by the agent.

        Args:
            decision: Short description of the decision
            reasoning: Explanation of why this decision was made
            alternatives: Other options that were considered
            confidence: Confidence level (0.0 to 1.0)
            context: Additional context data

        Returns:
            The recorded AgentDecision
        """
        decision_record = AgentDecision(
            id=f"{self.name}_{len(self.decisions)}_{int(datetime.utcnow().timestamp())}",
            agent_name=self.name,
            decision=decision,
            reasoning=reasoning,
            alternatives_considered=alternatives or [],
            confidence=confidence,
            context=context or {}
        )
        self.decisions.append(decision_record)
        logger.info(f"[{self.name}] Decision: {decision} (confidence: {confidence:.2f})")
        return decision_record

    def add_conflict(
        self,
        conflict_type: ConflictType,
        priority: ConflictPriority,
        target_agent: str,
        description: str,
        location: Dict[str, Any] = None,
        affected_elements: List[str] = None
    ) -> Conflict:
        """
        Record a conflict with another agent.

        Args:
            conflict_type: Type of conflict
            priority: Priority level for resolution
            target_agent: Name of the agent this conflicts with
            description: Description of the conflict
            location: Spatial location if applicable
            affected_elements: List of element IDs affected

        Returns:
            The recorded Conflict
        """
        conflict = Conflict(
            id=f"conflict_{self.name}_{target_agent}_{len(self.conflicts)}",
            type=conflict_type,
            priority=priority,
            source_agent=self.name,
            target_agent=target_agent,
            description=description,
            location=location,
            affected_elements=affected_elements or []
        )
        self.conflicts.append(conflict)
        logger.warning(f"[{self.name}] Conflict with {target_agent}: {description}")
        return conflict

    def add_warning(self, message: str):
        """Add a warning message"""
        if "warnings" not in self.outputs:
            self.outputs["warnings"] = []
        self.outputs["warnings"].append(message)
        logger.warning(f"[{self.name}] Warning: {message}")

    def get_metrics(self) -> Dict[str, float]:
        """Get performance metrics for this agent"""
        return {
            "total_decisions": len(self.decisions),
            "total_conflicts": len(self.conflicts),
            "avg_confidence": sum(d.confidence for d in self.decisions) / max(len(self.decisions), 1),
            "avg_execution_time": sum(self._execution_times) / max(len(self._execution_times), 1),
            "iterations": self.iteration
        }

    async def get_llm_recommendation(self, prompt: str, schema: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Get a recommendation from the LLM.

        Args:
            prompt: The prompt to send to the LLM
            schema: Expected response schema for validation

        Returns:
            Parsed JSON response from the LLM
        """
        try:
            response = await self.llm.generate(prompt)
            result = json.loads(response)

            if schema:
                # Basic schema validation
                for key in schema.get("required", []):
                    if key not in result:
                        raise ValueError(f"Missing required field: {key}")

            return result

        except json.JSONDecodeError:
            logger.error(f"[{self.name}] Invalid JSON from LLM")
            return {}
        except Exception as e:
            logger.error(f"[{self.name}] LLM error: {e}")
            return {}

    def reset(self):
        """Reset agent state for a new iteration"""
        self.status = AgentStatus.IDLE
        self.decisions.clear()
        self.conflicts.clear()
        self.outputs.clear()
        self.iteration += 1
