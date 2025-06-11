
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Upload, 
  Save, 
  ImageIcon,
  Link2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AppSettingsProps {
  currentAppName: string;
  currentAppIcon: string;
  onAppNameChange: (name: string) => void;
  onAppIconChange: (icon: string) => void;
}

const AppSettings = ({ 
  currentAppName, 
  currentAppIcon, 
  onAppNameChange, 
  onAppIconChange 
}: AppSettingsProps) => {
  const [appName, setAppName] = useState(currentAppName);
  const [appIcon, setAppIcon] = useState(currentAppIcon);
  const [iconUrl, setIconUrl] = useState("");
  const { toast } = useToast();

  const handleSaveSettings = () => {
    if (appName.trim()) {
      onAppNameChange(appName.trim());
    }
    
    if (iconUrl.trim()) {
      onAppIconChange(iconUrl.trim());
      setIconUrl("");
    }
    
    toast({
      title: "Configurações salvas",
      description: "As configurações do app foram atualizadas com sucesso.",
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simulate file upload - in a real app, you'd upload to Supabase Storage
      const fakeUrl = `/lovable-uploads/${file.name}`;
      onAppIconChange(fakeUrl);
      toast({
        title: "Ícone carregado",
        description: "O ícone foi carregado com sucesso.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Configurações do App
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* App Name Section */}
          <div className="space-y-3">
            <Label htmlFor="app-name" className="text-sm font-medium">
              Nome do App
            </Label>
            <Input
              id="app-name"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="Digite o nome do seu CRM"
              className="max-w-md"
            />
            <p className="text-xs text-muted-foreground">
              Este nome aparecerá no cabeçalho e na aba do navegador
            </p>
          </div>

          {/* Current Icon Display */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Ícone/Logo Atual</Label>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border">
              {appIcon.startsWith('http') || appIcon.startsWith('/') ? (
                <img 
                  src={appIcon} 
                  alt="App Icon" 
                  className="w-8 h-8 rounded object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Building2 className="text-white w-5 h-5" />
                </div>
              )}
              <div>
                <p className="text-sm font-medium">{appName}</p>
                <p className="text-xs text-muted-foreground">
                  {appIcon.startsWith('http') ? 'URL personalizada' : 'Ícone padrão'}
                </p>
              </div>
            </div>
          </div>

          {/* Icon Upload Options */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Alterar Ícone/Logo</Label>
            
            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="icon-upload" className="text-xs text-muted-foreground">
                Carregar arquivo de imagem
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="icon-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="max-w-xs"
                />
                <Badge variant="outline" className="text-xs">
                  PNG, JPG, SVG
                </Badge>
              </div>
            </div>

            {/* URL Input */}
            <div className="space-y-2">
              <Label htmlFor="icon-url" className="text-xs text-muted-foreground">
                Ou inserir URL da imagem
              </Label>
              <div className="flex items-center gap-2 max-w-md">
                <div className="relative flex-1">
                  <Link2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="icon-url"
                    value={iconUrl}
                    onChange={(e) => setIconUrl(e.target.value)}
                    placeholder="https://exemplo.com/logo.png"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t">
            <Button onClick={handleSaveSettings} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Salvar Configurações
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-blue-600" />
            Pré-visualização
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                {(iconUrl.trim() || appIcon).startsWith('http') || (iconUrl.trim() || appIcon).startsWith('/') ? (
                  <img 
                    src={iconUrl.trim() || appIcon} 
                    alt="App Icon Preview" 
                    className="w-full h-full rounded-lg object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <Building2 className="text-white w-5 h-5" />
                )}
              </div>
              <h1 className="text-xl font-bold text-slate-900">
                {appName.trim() || currentAppName}
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Assim será exibido no cabeçalho do seu CRM
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppSettings;
