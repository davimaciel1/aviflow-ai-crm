
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Download, 
  Eye, 
  Trash2, 
  Brain,
  Calendar,
  User,
  Building,
  MoreHorizontal,
  Shield
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  uploadedBy: string;
  clientName?: string;
  dealTitle?: string;
  isConfidential: boolean;
  aiAnalysis?: {
    summary: string;
    keyPoints: string[];
    category: string;
  };
}

const DocumentsList = () => {
  const documents: Document[] = [
    {
      id: "1",
      name: "Contrato_TechCorp_2024.pdf",
      type: "PDF",
      size: "2.4 MB",
      uploadedAt: "2024-06-10",
      uploadedBy: "João Silva",
      clientName: "TechCorp Ltd",
      dealTitle: "Sistema ERP - TechCorp",
      isConfidential: true,
      aiAnalysis: {
        summary: "Contrato de prestação de serviços para desenvolvimento de sistema ERP",
        keyPoints: ["Valor: R$ 150.000", "Prazo: 6 meses", "3 marcos de pagamento"],
        category: "Contrato"
      }
    },
    {
      id: "2",
      name: "Proposta_StartupXYZ.docx",
      type: "DOCX",
      size: "1.8 MB",
      uploadedAt: "2024-06-09",
      uploadedBy: "Maria Santos",
      clientName: "StartupXYZ",
      dealTitle: "Consultoria Digital - StartupXYZ",
      isConfidential: false,
      aiAnalysis: {
        summary: "Proposta comercial para consultoria em transformação digital",
        keyPoints: ["Escopo: 3 fases", "Investment: R$ 75.000", "ROI esperado: 300%"],
        category: "Proposta"
      }
    },
    {
      id: "3",
      name: "Briefing_ABC_Corp.pdf",
      type: "PDF",
      size: "956 KB",
      uploadedAt: "2024-06-08",
      uploadedBy: "Pedro Oliveira",
      clientName: "ABC Corporation",
      dealTitle: "Website Institucional - ABC Corp",
      isConfidential: false,
      aiAnalysis: {
        summary: "Briefing completo para desenvolvimento de website institucional",
        keyPoints: ["Design moderno", "Integração CRM", "SEO otimizado"],
        category: "Briefing"
      }
    },
    {
      id: "4",
      name: "NDA_RetailPlus.pdf",
      type: "PDF",
      size: "432 KB",
      uploadedAt: "2024-06-07",
      uploadedBy: "Ana Costa",
      clientName: "RetailPlus",
      dealTitle: "App Mobile - RetailPlus",
      isConfidential: true,
      aiAnalysis: {
        summary: "Acordo de confidencialidade para projeto de aplicativo mobile",
        keyPoints: ["Vigência: 2 anos", "Informações protegidas", "Penalidades definidas"],
        category: "Legal"
      }
    },
    {
      id: "5",
      name: "Especificacoes_DataCorp.xlsx",
      type: "XLSX",
      size: "3.2 MB",
      uploadedAt: "2024-06-06",
      uploadedBy: "Carlos Lima",
      clientName: "DataCorp",
      dealTitle: "Dashboard Analytics - DataCorp",
      isConfidential: false,
      aiAnalysis: {
        summary: "Especificações técnicas detalhadas para dashboard de analytics",
        keyPoints: ["15 KPIs principais", "Integração API", "Tempo real"],
        category: "Especificação"
      }
    }
  ];

  const getFileIcon = (type: string) => {
    return <FileText className="w-5 h-5 text-blue-600" />;
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "contrato": return "bg-green-100 text-green-800";
      case "proposta": return "bg-blue-100 text-blue-800";
      case "briefing": return "bg-purple-100 text-purple-800";
      case "legal": return "bg-red-100 text-red-800";
      case "especificação": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{documents.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Confidenciais</p>
                <p className="text-2xl font-bold">
                  {documents.filter(doc => doc.isConfidential).length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Com IA</p>
                <p className="text-2xl font-bold">
                  {documents.filter(doc => doc.aiAnalysis).length}
                </p>
              </div>
              <Brain className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Este Mês</p>
                <p className="text-2xl font-bold">5</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {documents.map((document) => (
          <Card key={document.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  {getFileIcon(document.type)}
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">{document.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{document.type}</Badge>
                      <span className="text-sm text-muted-foreground">{document.size}</span>
                      {document.isConfidential && (
                        <Badge variant="destructive" className="text-xs">
                          <Shield className="w-3 h-3 mr-1" />
                          Confidencial
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Eye className="w-4 h-4 mr-2" />
                      Visualizar
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Enviado em {document.uploadedAt}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Por {document.uploadedBy}</span>
                </div>
                
                {document.clientName && (
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    <span>{document.clientName}</span>
                  </div>
                )}
                
                {document.dealTitle && (
                  <div className="text-xs text-muted-foreground">
                    Vinculado a: {document.dealTitle}
                  </div>
                )}
              </div>
              
              {document.aiAnalysis && (
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">Análise IA</span>
                    <Badge className={getCategoryColor(document.aiAnalysis.category)}>
                      {document.aiAnalysis.category}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-purple-800 mb-2">
                    {document.aiAnalysis.summary}
                  </p>
                  
                  <div className="space-y-1">
                    {document.aiAnalysis.keyPoints.map((point, index) => (
                      <div key={index} className="text-xs text-purple-700">
                        • {point}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="w-4 h-4 mr-2" />
                  Visualizar
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DocumentsList;
