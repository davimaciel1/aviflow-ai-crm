
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Building, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Client {
  id: string;
  name: string;
  industry: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  address: string;
  status: "active" | "inactive" | "prospect";
  dealsValue: string;
  dealsCount: number;
}

const ClientsList = () => {
  const clients: Client[] = [
    {
      id: "1",
      name: "TechCorp Ltd",
      industry: "Tecnologia",
      contactEmail: "contato@techcorp.com",
      contactPhone: "(11) 99999-9999",
      website: "www.techcorp.com",
      address: "São Paulo, SP",
      status: "active",
      dealsValue: "R$ 450.000",
      dealsCount: 3
    },
    {
      id: "2",
      name: "StartupXYZ",
      industry: "Fintech",
      contactEmail: "hello@startupxyz.com",
      contactPhone: "(11) 88888-8888",
      website: "www.startupxyz.com",
      address: "Rio de Janeiro, RJ",
      status: "active",
      dealsValue: "R$ 275.000",
      dealsCount: 2
    },
    {
      id: "3",
      name: "ABC Corporation",
      industry: "Varejo",
      contactEmail: "vendas@abccorp.com",
      contactPhone: "(11) 77777-7777",
      website: "www.abccorp.com",
      address: "Belo Horizonte, MG",
      status: "prospect",
      dealsValue: "R$ 120.000",
      dealsCount: 1
    },
    {
      id: "4",
      name: "RetailPlus",
      industry: "E-commerce",
      contactEmail: "comercial@retailplus.com",
      contactPhone: "(11) 66666-6666",
      website: "www.retailplus.com",
      address: "Curitiba, PR",
      status: "active",
      dealsValue: "R$ 380.000",
      dealsCount: 4
    },
    {
      id: "5",
      name: "DataCorp",
      industry: "Analytics",
      contactEmail: "info@datacorp.com",
      contactPhone: "(11) 55555-5555",
      website: "www.datacorp.com",
      address: "Porto Alegre, RS",
      status: "inactive",
      dealsValue: "R$ 95.000",
      dealsCount: 1
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "inactive": return "bg-gray-100 text-gray-800";
      case "prospect": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active": return "Ativo";
      case "inactive": return "Inativo";
      case "prospect": return "Prospect";
      default: return status;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {clients.map((client) => (
        <Card key={client.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {client.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{client.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{client.industry}</p>
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
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
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
            <div className="flex justify-between items-center">
              <Badge className={getStatusColor(client.status)}>
                {getStatusLabel(client.status)}
              </Badge>
              <div className="text-right">
                <div className="text-sm font-medium text-green-600">{client.dealsValue}</div>
                <div className="text-xs text-muted-foreground">{client.dealsCount} deals</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span className="truncate">{client.contactEmail}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{client.contactPhone}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="w-4 h-4" />
                <span className="truncate">{client.website}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{client.address}</span>
              </div>
            </div>
            
            <div className="pt-3 border-t border-slate-200">
              <Button variant="outline" className="w-full">
                <Building className="w-4 h-4 mr-2" />
                Ver Detalhes
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ClientsList;
