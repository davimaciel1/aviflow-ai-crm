
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, AlertCircle, CheckCircle, Target } from "lucide-react";

const AIInsights = () => {
  const insights = [
    {
      type: "success",
      icon: <CheckCircle className="w-4 h-4" />,
      title: "Alta Performance",
      description: "Seu pipeline de vendas está 23% acima da meta mensal",
      recommendation: "Continue focando em clientes enterprise"
    },
    {
      type: "warning",
      icon: <AlertCircle className="w-4 h-4" />,
      title: "Atenção Necessária",
      description: "5 deals grandes estão há mais de 30 dias na fase de negociação",
      recommendation: "Agende follow-ups urgentes com estes clientes"
    },
    {
      type: "opportunity",
      icon: <Target className="w-4 h-4" />,
      title: "Oportunidade Identificada",
      description: "Clientes do setor tech têm 40% mais conversão",
      recommendation: "Priorize prospecção em empresas de tecnologia"
    },
    {
      type: "trend",
      icon: <TrendingUp className="w-4 h-4" />,
      title: "Tendência Positiva",
      description: "Tempo médio de fechamento reduziu em 15% este mês",
      recommendation: "Documente as práticas que estão funcionando"
    }
  ];

  const getInsightColor = (type: string) => {
    switch (type) {
      case "success": return "text-green-600 bg-green-50";
      case "warning": return "text-orange-600 bg-orange-50";
      case "opportunity": return "text-blue-600 bg-blue-50";
      case "trend": return "text-purple-600 bg-purple-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          Insights de IA
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div key={index} className="p-4 rounded-lg border border-slate-200 hover:shadow-sm transition-shadow">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${getInsightColor(insight.type)}`}>
                  {insight.icon}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-slate-900">{insight.title}</h4>
                    <Badge variant="outline" className={getInsightColor(insight.type)}>
                      IA
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600">{insight.description}</p>
                  <p className="text-xs text-slate-500 italic">
                    💡 {insight.recommendation}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          <div className="pt-4 border-t border-slate-200">
            <p className="text-xs text-center text-slate-500">
              Insights atualizados automaticamente com base nos seus dados
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIInsights;
