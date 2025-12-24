// components/LegacyPanel.tsx

import { useGame } from '../context/GameContext';
import { canAllocateNode } from '../utils/gameLogic';
import { TreeNode } from '../types/game.types';

export function LegacyPanel() {
  const { state, dispatch, legacyTree } = useGame();

  const handleAllocateNode = (nodeId: string) => {
    dispatch({ type: 'ALLOCATE_LEGACY_NODE', payload: { nodeId } });
  };

  return (
    <div className="panel legacy-panel">
      <h2>Legacy</h2>

      <div className="panel-section">
        <h3>Legacy Progression</h3>
        <div className="stat-row">
          <span>Legacy Level:</span>
          <span>{state.legacyLevel}</span>
        </div>
        <div className="stat-row">
          <span>Points Available:</span>
          <span>{state.legacyPointsAvailable}</span>
        </div>
      </div>

      <div className="panel-section">
        <h3>Legacy Tree</h3>
        <div className="skill-tree">
          {legacyTree.nodes.map((node) => (
            <TreeNodeComponent
              key={node.id}
              node={node}
              isAllocated={!!state.legacyAllocated[node.id]}
              isAvailable={canAllocateNode(node, state.legacyAllocated, legacyTree)}
              pointsAvailable={state.legacyPointsAvailable}
              onAllocate={handleAllocateNode}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function TreeNodeComponent({
  node,
  isAllocated,
  isAvailable,
  pointsAvailable,
  onAllocate,
}: {
  node: TreeNode;
  isAllocated: boolean;
  isAvailable: boolean;
  pointsAvailable: number;
  onAllocate: (nodeId: string) => void;
}) {
  const canAfford = pointsAvailable >= node.cost;
  const canAllocate = isAvailable && canAfford && !isAllocated;

  let className = 'tree-node';
  if (isAllocated) {
    className += ' allocated';
  } else if (!isAvailable) {
    className += ' locked';
  } else if (!canAfford) {
    className += ' insufficient';
  } else {
    className += ' available';
  }

  return (
    <div
      className={className}
      onClick={() => canAllocate && onAllocate(node.id)}
      style={{ cursor: canAllocate ? 'pointer' : 'default' }}
    >
      <div className="node-name">{node.name}</div>
      <div className="node-description">{node.description}</div>
      <div className="node-cost">
        {isAllocated ? '✓ Allocated' : `Cost: ${node.cost}`}
      </div>
    </div>
  );
}
