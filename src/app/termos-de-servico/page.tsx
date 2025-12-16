'use client';

import PageHeader from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Handshake, UserCheck, Ban, FileText, Truck } from "lucide-react";

const termsSections = [
    {
        icon: Handshake,
        title: "1. Aceitação dos Termos",
        content: "Ao acessar e usar o site Primavera Delivery, você concorda em cumprir estes Termos de Serviço e todas as leis e regulamentos aplicáveis. Se você não concorda com algum destes termos, está proibido de usar ou acessar este site."
    },
    {
        icon: UserCheck,
        title: "2. Uso da Conta",
        content: "Você é responsável por manter a confidencialidade de sua conta e senha e por restringir o acesso ao seu computador. Você concorda em aceitar a responsabilidade por todas as atividades que ocorram sob sua conta ou senha. Reservamo-nos o direito de recusar serviço, encerrar contas, remover ou editar conteúdo, ou cancelar pedidos a nosso exclusivo critério."
    },
    {
        icon: Truck,
        title: "3. Pedidos e Entregas",
        content: "Todos os pedidos estão sujeitos à disponibilidade de estoque. Faremos o nosso melhor para entregar seu pedido dentro do prazo estimado, mas não garantimos prazos de entrega. O risco de perda e o título para todos os itens comprados de nós passam para você no momento da nossa entrega à transportadora."
    },
    {
        icon: Ban,
        title: "4. Conduta do Usuário",
        content: "É proibido usar o site para qualquer finalidade ilegal ou não autorizada. Você não deve, no uso do Serviço, violar nenhuma lei em sua jurisdição (incluindo, mas não se limitando a, leis de direitos autorais). É proibido transmitir worms ou vírus ou qualquer código de natureza destrutiva."
    },
    {
        icon: FileText,
        title: "5. Modificações dos Termos",
        content: "Reservamo-nos o direito, a nosso critério, de atualizar, modificar ou substituir qualquer parte destes Termos de Serviço, publicando atualizações e alterações no nosso site. É sua responsabilidade verificar nosso site periodicamente para verificar alterações."
    }
];

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <PageHeader
        title="Termos de Serviço"
        description="Leia os termos e condições para usar nossos serviços."
      />
      <div className="mt-8 space-y-6">
        {termsSections.map((section, index) => (
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
