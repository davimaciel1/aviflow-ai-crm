
import { useState } from 'react';

export interface KanbanConfig {
  cardWidth: number;
  minCardWidth: number;
  maxCardWidth: number;
}

export const useKanbanConfig = () => {
  const [config, setConfig] = useState<KanbanConfig>({
    cardWidth: 280, // largura padrão em pixels
    minCardWidth: 200, // largura mínima
    maxCardWidth: 400, // largura máxima
  });

  const updateCardWidth = (width: number) => {
    const clampedWidth = Math.max(
      config.minCardWidth,
      Math.min(config.maxCardWidth, width)
    );
    setConfig(prev => ({ ...prev, cardWidth: clampedWidth }));
  };

  return {
    config,
    updateCardWidth,
  };
};
