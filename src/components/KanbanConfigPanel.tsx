
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Minus, Plus } from "lucide-react";

interface KanbanConfigPanelProps {
  cardWidth: number;
  minWidth: number;
  maxWidth: number;
  onWidthChange: (width: number) => void;
}

const KanbanConfigPanel = ({ 
  cardWidth, 
  minWidth, 
  maxWidth, 
  onWidthChange 
}: KanbanConfigPanelProps) => {
  const decreaseWidth = () => {
    onWidthChange(Math.max(minWidth, cardWidth - 20));
  };

  const increaseWidth = () => {
    onWidthChange(Math.min(maxWidth, cardWidth + 20));
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Configuração do Kanban
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Largura dos cards:</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={decreaseWidth}
              disabled={cardWidth <= minWidth}
              className="h-7 w-7 p-0"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <Badge variant="secondary" className="min-w-16 justify-center">
              {cardWidth}px
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={increaseWidth}
              disabled={cardWidth >= maxWidth}
              className="h-7 w-7 p-0"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            ({minWidth}px - {maxWidth}px)
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default KanbanConfigPanel;
