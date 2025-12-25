// components/WeaponPanel.tsx

import { useGame } from '../context/GameContext';
import { calculateWeaponLevelCost } from '../utils/calculations';
import { canAllocateNode } from '../utils/gameLogic';
import { GAME_CONSTANTS } from '../utils/constants';
import { TreeNode } from '../types/game.types';

export function WeaponPanel() {
  const { state, dispatch, masteryTree } = useGame();
  const { weapon } = state;

  const levelCost = calculateWeaponLevelCost(weapon.runLevel);
  const canLevelUp = state.gold >= levelCost && weapon.runLevel < GAME_CONSTANTS.WEAPON_MAX_RUN_LEVEL;

  const handleLevelWeapon = () => {
    dispatch({ type: 'LEVEL_WEAPON' });
  };

  const handleAllocateNode = (nodeId: string) => {
    dispatch({ type: 'ALLOCATE_MASTERY_NODE', payload: { nodeId } });
  };

  return (
    <div className="panel weapon-panel">
      <h2>Dagger</h2>

      <div className="panel-section">
        <h3>Run Stats</h3>
        <div className="stat-row">
          <span>Level:</span>
          <span>{weapon.runLevel} / {GAME_CONSTANTS.WEAPON_MAX_RUN_LEVEL}</span>
        </div>
        <div className="stat-row">
          <span>Base Damage:</span>
          <span>{state.stats.baseDamage.toFixed(1)}</span>
        </div>
        <div className="stat-row">
          <span>Gold:</span>
          <span>{Math.floor(state.gold).toLocaleString()}</span>
        </div>
        <button
          className="action-button"
          onClick={handleLevelWeapon}
          disabled={!canLevelUp}
        >
          {weapon.runLevel >= GAME_CONSTANTS.WEAPON_MAX_RUN_LEVEL
            ? 'Max Level Reached'
            : `Level Weapon (Cost: ${levelCost} gold)`}
        </button>
      </div>

      <div className="panel-section">
        <h3>Mastery</h3>
        <div className="stat-row">
          <span>Mastery Level:</span>
          <span>{weapon.masteryLevel}</span>
        </div>
        <div className="stat-row">
          <span>Points Available:</span>
          <span>{weapon.masteryPointsAvailable}</span>
        </div>
      </div>

      <div className="panel-section">
        <h3>Mastery Tree</h3>
        <div className="skill-tree">
          {masteryTree.nodes.map((node) => (
            <TreeNodeComponent
              key={node.id}
              node={node}
              isAllocated={!!weapon.masteryAllocated[node.id]}
              isAvailable={canAllocateNode(node, weapon.masteryAllocated, masteryTree)}
              pointsAvailable={weapon.masteryPointsAvailable}
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
