'use client';

import PageHeader from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, BookUser, Database, Cookie, Mail } from "lucide-react";

const policySections = [
    {
        icon: Shield,
        title: "Introdução",
        content: "A sua privacidade é importante para nós. É política do Primavera Delivery respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar no nosso site e outros sites que possuímos e operamos. Esta política de privacidade explica como coletamos, usamos e protegemos suas informações pessoais."
    },
    {
        icon: Database,
        title: "Informações que Coletamos",
        content: "Solicitamos informações pessoais apenas quando realmente precisamos delas para lhe fornecer um serviço. Fazemo-lo por meios justos e legais, com o seu conhecimento e consentimento. Também informamos por que estamos coletando e como será usado. As informações que coletamos incluem nome, e-mail, telefone e endereço, que são necessários para o processamento e entrega de pedidos."
    },
    {
        icon: BookUser,
        title: "Como Usamos Suas Informações",
        content: "Usamos as informações coletadas para processar seus pedidos, gerenciar sua conta, personalizar sua experiência e, se você concordar, enviar e-mails sobre ofertas especiais e novos produtos. Não compartilhamos informações de identificação pessoal publicamente ou com terceiros, exceto quando exigido por lei."
    },
    {
        icon: Cookie,
        title: "Cookies",
        content: "Nosso site usa 'cookies' para coletar informações e melhorar nosso serviço. Você tem a opção de aceitar ou recusar esses cookies e saber quando um cookie está sendo enviado para o seu computador. Se você optar por recusar nossos cookies, talvez não consiga usar algumas partes do nosso serviço."
    },
    {
        icon: Mail,
        title: "Contato",
        content: "Se você tiver alguma dúvida sobre como lidamos com dados do usuário e informações pessoais, entre em contato conosco através da nossa página de Ajuda."
    }
]

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <PageHeader
        title="Política de Privacidade"
        description="Entenda como seus dados são coletados, usados e protegidos."
      />
      <div className="mt-8 space-y-6">
        {policySections.map((section, index) => (
             <Card key={index}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        <section.icon className="h-6 w-6 text-primary" />
                        <span>{section.title}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{section.content}</p>
                </CardContent>
            </Card>
        ))}
      </div>
    </div>
  );
}
