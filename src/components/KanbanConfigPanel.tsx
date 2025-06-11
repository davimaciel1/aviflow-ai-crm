
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Monitor, Smartphone, Tablet, RotateCcw, Save } from "lucide-react";

interface KanbanConfig {
  cardWidth: number;
  cardMinHeight: number;
  cardMaxHeight: number;
  autoResize: boolean;
  responsiveBreakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  cardSpacing: number;
  columnWidth: number;
}

const KanbanConfigPanel = () => {
  const [config, setConfig] = useState<KanbanConfig>({
    cardWidth: 320,
    cardMinHeight: 150,
    cardMaxHeight: 600,
    autoResize: true,
    responsiveBreakpoints: {
      mobile: 320,
      tablet: 768,
      desktop: 1024
    },
    cardSpacing: 12,
    columnWidth: 320
  });

  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Carregar configurações do localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('daviflow_kanban_config');
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error('Erro ao carregar configurações do Kanban:', error);
      }
    }
  }, []);

  // Aplicar configurações ao CSS
  useEffect(() => {
    const root = document.documentElement;
    
    // Aplicar variáveis CSS customizadas
    root.style.setProperty('--kanban-card-width', `${config.cardWidth}px`);
    root.style.setProperty('--kanban-card-min-height', `${config.cardMinHeight}px`);
    root.style.setProperty('--kanban-card-max-height', `${config.cardMaxHeight}px`);
    root.style.setProperty('--kanban-card-spacing', `${config.cardSpacing}px`);
    root.style.setProperty('--kanban-column-width', `${config.columnWidth}px`);
    
    // Aplicar responsividade
    if (config.autoResize) {
      const mediaQuery = `
        @media (max-width: ${config.responsiveBreakpoints.mobile}px) {
          :root {
            --kanban-card-width: ${Math.min(config.cardWidth, 280)}px;
            --kanban-column-width: ${Math.min(config.columnWidth, 280)}px;
          }
        }
        @media (min-width: ${config.responsiveBreakpoints.mobile + 1}px) and (max-width: ${config.responsiveBreakpoints.tablet}px) {
          :root {
            --kanban-card-width: ${Math.min(config.cardWidth, 300)}px;
            --kanban-column-width: ${Math.min(config.columnWidth, 300)}px;
          }
        }
      `;
      
      // Adicionar ou atualizar as regras CSS
      let styleElement = document.getElementById('kanban-responsive-styles');
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'kanban-responsive-styles';
        document.head.appendChild(styleElement);
      }
      styleElement.textContent = mediaQuery;
    }
  }, [config]);

  const handleSaveConfig = () => {
    localStorage.setItem('daviflow_kanban_config', JSON.stringify(config));
    
    // Aplicar as configurações imediatamente
    window.dispatchEvent(new CustomEvent('kanban-config-updated', { detail: config }));
    
    alert('Configurações salvas com sucesso!');
  };

  const handleResetConfig = () => {
    const defaultConfig: KanbanConfig = {
      cardWidth: 320,
      cardMinHeight: 150,
      cardMaxHeight: 600,
      autoResize: true,
      responsiveBreakpoints: {
        mobile: 320,
        tablet: 768,
        desktop: 1024
      },
      cardSpacing: 12,
      columnWidth: 320
    };
    
    setConfig(defaultConfig);
  };

  const getPreviewIcon = (mode: string) => {
    switch (mode) {
      case 'desktop': return <Monitor className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const getPreviewWidth = () => {
    switch (previewMode) {
      case 'mobile': return Math.min(config.cardWidth, 280);
      case 'tablet': return Math.min(config.cardWidth, 300);
      case 'desktop': return config.cardWidth;
      default: return config.cardWidth;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Configurações do Kanban
          </CardTitle>
          <CardDescription>
            Personalize o tamanho e comportamento dos cards do Kanban
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Configurações de Tamanho */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Dimensões dos Cards</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cardWidth">Largura do Card (px)</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    id="cardWidth"
                    min={250}
                    max={500}
                    step={10}
                    value={[config.cardWidth]}
                    onValueChange={(value) => setConfig(prev => ({ ...prev, cardWidth: value[0] }))}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={config.cardWidth}
                    onChange={(e) => setConfig(prev => ({ ...prev, cardWidth: parseInt(e.target.value) || 320 }))}
                    className="w-20"
                    min={250}
                    max={500}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="columnWidth">Largura da Coluna (px)</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    id="columnWidth"
                    min={280}
                    max={520}
                    step={10}
                    value={[config.columnWidth]}
                    onValueChange={(value) => setConfig(prev => ({ ...prev, columnWidth: value[0] }))}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={config.columnWidth}
                    onChange={(e) => setConfig(prev => ({ ...prev, columnWidth: parseInt(e.target.value) || 320 }))}
                    className="w-20"
                    min={280}
                    max={520}
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cardMinHeight">Altura Mínima (px)</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    id="cardMinHeight"
                    min={100}
                    max={300}
                    step={10}
                    value={[config.cardMinHeight]}
                    onValueChange={(value) => setConfig(prev => ({ ...prev, cardMinHeight: value[0] }))}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={config.cardMinHeight}
                    onChange={(e) => setConfig(prev => ({ ...prev, cardMinHeight: parseInt(e.target.value) || 150 }))}
                    className="w-20"
                    min={100}
                    max={300}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cardMaxHeight">Altura Máxima (px)</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    id="cardMaxHeight"
                    min={300}
                    max={800}
                    step={10}
                    value={[config.cardMaxHeight]}
                    onValueChange={(value) => setConfig(prev => ({ ...prev, cardMaxHeight: value[0] }))}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={config.cardMaxHeight}
                    onChange={(e) => setConfig(prev => ({ ...prev, cardMaxHeight: parseInt(e.target.value) || 600 }))}
                    className="w-20"
                    min={300}
                    max={800}
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cardSpacing">Espaçamento entre Cards (px)</Label>
              <div className="flex items-center gap-2">
                <Slider
                  id="cardSpacing"
                  min={4}
                  max={24}
                  step={2}
                  value={[config.cardSpacing]}
                  onValueChange={(value) => setConfig(prev => ({ ...prev, cardSpacing: value[0] }))}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={config.cardSpacing}
                  onChange={(e) => setConfig(prev => ({ ...prev, cardSpacing: parseInt(e.target.value) || 12 }))}
                  className="w-20"
                  min={4}
                  max={24}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Configurações de Responsividade */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Responsividade</h3>
              <div className="flex items-center space-x-2">
                <Switch
                  id="autoResize"
                  checked={config.autoResize}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, autoResize: checked }))}
                />
                <Label htmlFor="autoResize">Auto-adaptação</Label>
              </div>
            </div>
            
            {config.autoResize && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Breakpoint Mobile (px)</Label>
                  <Input
                    type="number"
                    value={config.responsiveBreakpoints.mobile}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      responsiveBreakpoints: {
                        ...prev.responsiveBreakpoints,
                        mobile: parseInt(e.target.value) || 320
                      }
                    }))}
                    min={300}
                    max={500}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Breakpoint Tablet (px)</Label>
                  <Input
                    type="number"
                    value={config.responsiveBreakpoints.tablet}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      responsiveBreakpoints: {
                        ...prev.responsiveBreakpoints,
                        tablet: parseInt(e.target.value) || 768
                      }
                    }))}
                    min={500}
                    max={900}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Breakpoint Desktop (px)</Label>
                  <Input
                    type="number"
                    value={config.responsiveBreakpoints.desktop}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      responsiveBreakpoints: {
                        ...prev.responsiveBreakpoints,
                        desktop: parseInt(e.target.value) || 1024
                      }
                    }))}
                    min={900}
                    max={1400}
                  />
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Preview</h3>
            
            <div className="flex gap-2">
              {(['desktop', 'tablet', 'mobile'] as const).map((mode) => (
                <Button
                  key={mode}
                  variant={previewMode === mode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreviewMode(mode)}
                  className="flex items-center gap-2"
                >
                  {getPreviewIcon(mode)}
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Button>
              ))}
            </div>
            
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 bg-slate-50">
              <div className="flex justify-center">
                <div
                  className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 transition-all duration-300"
                  style={{
                    width: `${getPreviewWidth()}px`,
                    minHeight: `${config.cardMinHeight}px`,
                    maxHeight: `${config.cardMaxHeight}px`
                  }}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">Card Preview</h4>
                      <Badge variant="secondary" className="text-xs">
                        {getPreviewWidth()}px
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-600">
                      Este é um exemplo de como os cards do Kanban ficarão com as configurações atuais.
                    </div>
                    <div className="text-xs text-slate-500">
                      Altura: {config.cardMinHeight}px - {config.cardMaxHeight}px
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Botões de Ação */}
          <div className="flex gap-3">
            <Button onClick={handleSaveConfig} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Salvar Configurações
            </Button>
            <Button variant="outline" onClick={handleResetConfig}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Resetar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KanbanConfigPanel;
