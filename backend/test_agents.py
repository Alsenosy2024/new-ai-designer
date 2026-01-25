#!/usr/bin/env python3
"""
Test script for the multi-agent AI designer system.
Tests the full pipeline with a sample office building project.
"""

import asyncio
import json
import sys
import os
from datetime import datetime

# Add the app directory to the path
sys.path.insert(0, os.path.dirname(__file__))

from app.agents import (
    AgentCoordinator,
    ArchitecturalAgent,
    StructuralAgent,
    MEPAgent,
    InteriorAgent,
)
from app.agent_orchestrator import LLMClient


async def test_architectural_agent():
    """Test the architectural agent standalone"""
    print("\n" + "="*60)
    print("TEST 1: Architectural Agent")
    print("="*60)

    context = {
        "id": "test-001",
        "name": "Test Office Building",
        "region": "saudi",
        "building_type": "office",
        "gfa": 10000,
        "floors": 10,
        "core_ratio": 0.12,
        "budget": "standard",
    }

    llm = LLMClient()
    agent = ArchitecturalAgent(llm, context)

    print(f"✓ Created {agent.name} agent")
    print(f"  Domain: {agent.domain}")
    print(f"  Dependencies: {agent.dependencies}")

    try:
        result = await agent.run(inputs=context)
        print(f"\n✓ Agent completed: {result.status.value}")
        print(f"  Execution time: {result.execution_time:.2f}s")
        print(f"  Decisions made: {len(result.decisions)}")
        print(f"  Conflicts detected: {len(result.conflicts)}")
        print(f"  Warnings: {len(result.warnings)}")

        # Show key metrics
        if result.metrics:
            print(f"\n  Metrics:")
            for key, value in result.metrics.items():
                print(f"    - {key}: {value}")

        return True
    except Exception as e:
        print(f"✗ Agent failed: {e}")
        import traceback
        traceback.print_exc()
        return False


async def test_structural_agent():
    """Test the structural agent with architectural input"""
    print("\n" + "="*60)
    print("TEST 2: Structural Agent")
    print("="*60)

    context = {
        "id": "test-001",
        "name": "Test Office Building",
        "region": "saudi",
        "building_type": "office",
        "gfa": 10000,
        "floors": 10,
        "structural_system": "moment_frame",
    }

    # Simulate architectural output
    arch_output = {
        "massing": {
            "width": 40,
            "depth": 30,
            "height": 36,
            "floors": 10,
            "floor_height": 3.6
        },
        "floor_plans": [{
            "grid_x": [0, 8, 16, 24, 32, 40],
            "grid_y": [0, 8, 16, 24, 30]
        }]
    }

    llm = LLMClient()
    agent = StructuralAgent(llm, context)

    print(f"✓ Created {agent.name} agent")

    try:
        inputs = {
            "dependency_outputs": {
                "architectural": arch_output
            }
        }
        result = await agent.run(inputs=inputs)
        print(f"\n✓ Agent completed: {result.status.value}")
        print(f"  Execution time: {result.execution_time:.2f}s")
        print(f"  Decisions made: {len(result.decisions)}")

        # Show structural metrics
        if result.metrics:
            print(f"\n  Structural Metrics:")
            for key, value in result.metrics.items():
                if isinstance(value, float):
                    print(f"    - {key}: {value:.2f}")
                else:
                    print(f"    - {key}: {value}")

        return True
    except Exception as e:
        print(f"✗ Agent failed: {e}")
        import traceback
        traceback.print_exc()
        return False


async def test_full_coordination():
    """Test full multi-agent coordination"""
    print("\n" + "="*60)
    print("TEST 3: Full Multi-Agent Coordination")
    print("="*60)

    context = {
        "id": "test-001",
        "name": "Test Office Building",
        "region": "saudi",
        "building_type": "office",
        "gfa": 10000,
        "floors": 10,
        "core_ratio": 0.12,
        "structural_system": "moment_frame",
        "mep_strategy": "central",
        "budget": "standard",
    }

    llm = LLMClient()

    # Create coordinator
    coordinator = AgentCoordinator(
        project_context=context,
        config={
            "max_iterations": 3,
            "convergence_threshold": 0.9
        }
    )

    print("✓ Created coordinator")

    # Register agents
    arch_agent = ArchitecturalAgent(llm, context)
    coordinator.register_agent(arch_agent)
    print(f"✓ Registered {arch_agent.name}")

    struct_agent = StructuralAgent(llm, context)
    coordinator.register_agent(struct_agent)
    print(f"✓ Registered {struct_agent.name}")

    mep_agent = MEPAgent(llm, context)
    coordinator.register_agent(mep_agent)
    print(f"✓ Registered {mep_agent.name}")

    interior_agent = InteriorAgent(llm, context)
    coordinator.register_agent(interior_agent)
    print(f"✓ Registered {interior_agent.name}")

    try:
        print("\nStarting coordination...")
        result = await coordinator.run()

        print(f"\n{'='*60}")
        print("COORDINATION RESULTS")
        print(f"{'='*60}")
        print(f"Success: {result.success}")
        print(f"Phase: {result.phase.value}")
        print(f"Iterations: {result.iterations}")
        convergence = result.final_design.get("metrics", {}).get("convergence_achieved", False)
        print(f"Convergence achieved: {convergence}")
        print(f"Resolved conflicts: {len(result.resolved_conflicts)}")
        print(f"Unresolved conflicts: {len(result.unresolved_conflicts)}")

        # Show agent statuses
        print(f"\nAgent Outputs:")
        for name, output in result.agent_outputs.items():
            print(f"  {name}:")
            print(f"    Status: {output.status.value}")
            print(f"    Decisions: {len(output.decisions)}")
            print(f"    Conflicts: {len(output.conflicts)}")
            print(f"    Execution time: {output.execution_time:.2f}s")

        # Show overall metrics
        if result.final_design.get("metrics"):
            print(f"\nOverall Metrics:")
            for key, value in result.final_design["metrics"].items():
                print(f"  {key}: {value}")

        # Save result
        output_file = f"test_result_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        convergence = result.final_design.get("metrics", {}).get("convergence_achieved", False)
        with open(output_file, 'w') as f:
            json.dump({
                "success": result.success,
                "phase": result.phase.value,
                "iterations": result.iterations,
                "convergence": convergence,
                "agent_count": len(result.agent_outputs),
                "resolved_conflicts": len(result.resolved_conflicts),
                "unresolved_conflicts": len(result.unresolved_conflicts),
            }, f, indent=2)

        print(f"\n✓ Results saved to {output_file}")

        return result.success

    except Exception as e:
        print(f"\n✗ Coordination failed: {e}")
        import traceback
        traceback.print_exc()
        return False


async def run_all_tests():
    """Run all tests"""
    print("\n" + "="*60)
    print("MULTI-AGENT AI DESIGNER - TEST SUITE")
    print("="*60)
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    results = []

    # Test 1: Architectural Agent
    results.append(("Architectural Agent", await test_architectural_agent()))

    # Test 2: Structural Agent
    results.append(("Structural Agent", await test_structural_agent()))

    # Test 3: Full Coordination
    results.append(("Full Coordination", await test_full_coordination()))

    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    passed = sum(1 for _, result in results if result)
    total = len(results)

    for name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status}: {name}")

    print(f"\nTotal: {passed}/{total} tests passed")
    print(f"Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    return passed == total


if __name__ == "__main__":
    success = asyncio.run(run_all_tests())
    sys.exit(0 if success else 1)
