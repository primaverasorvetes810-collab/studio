'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, BarChart2, Truck, Package, Users, Gift, Download } from "lucide-react";

const adminFaqs = [
  {
    icon: BarChart2,
    title: "Dashboard",
    content: "O Dashboard é a sua visão geral. Ele mostra métricas importantes como receita total, número de pedidos, total de clientes e a quantidade de produtos cadastrados. Use-o para ter um pulso rápido do seu negócio. O gráfico de visão geral mostra suas vendas mensais."
  },
  {
    icon: Truck,
    title: "Entregas",
    content: "A aba Entregas é o seu centro de logística. Aqui você gerencia todos os pedidos recebidos. Use as abas ('Feitos Agora', 'Atrasados', 'Enviados') para filtrar e acompanhar o ciclo de vida de cada pedido, desde 'Pendente' até 'Entregue'."
  },
  {
    icon: Package,
    title: "Produtos",
    content: "Gerencie todo o seu catálogo aqui. Você pode criar, editar e deletar grupos de produtos (como 'Açaí', 'Sorvetes'). Dentro de cada grupo, você pode adicionar novos produtos, alterar preços, descrições, estoque e imagens."
  },
  {
    icon: Users,
    title: "Clientes",
    content: "Esta seção lista todos os usuários que se cadastraram no seu aplicativo. Você pode ver informações como o nome, e-mail, total gasto e a data do último pedido, ajudando a entender o comportamento dos seus clientes."
  },
  {
    icon: Gift,
    title: "Aniversariantes",
    content: "Use esta aba para criar um relacionamento com seus clientes. Ela mostra todos os clientes que fazem aniversário no mês atual. É uma ótima oportunidade para oferecer um cupom de desconto ou um brinde especial e fidelizá-los."
  }
];

export default function AdminHelpPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="text-primary" />
            Funcionalidades do Painel
          </CardTitle>
          <CardDescription>Entenda o que cada seção do seu painel de controle faz.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full space-y-4">
            {adminFaqs.map((faq, index) => (
              <AccordionItem value={`item-faq-${index}`} key={index} className="rounded-lg border bg-background/50 px-4">
                <AccordionTrigger className="text-left font-semibold hover:no-underline">
                  <div className="flex items-center gap-3">
                    <faq.icon className="h-5 w-5 text-primary" />
                    <span>{faq.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-2">
                  {faq.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-2">
                  <Download className="text-primary" />
                  Instalando o Aplicativo (PWA)
              </CardTitle>
              <CardDescription>
                  Você sabia que este site pode ser instalado como um aplicativo no seu computador ou celular? Isso permite acesso rápido e uma experiência mais integrada.
              </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
              <p className="font-semibold">Como Instalar:</p>
              <ul className="list-disc pl-5 text-muted-foreground text-sm space-y-1">
                <li><strong>No Computador (Chrome/Edge):</strong> Procure por um ícone de instalação (geralmente um monitor com uma seta para baixo) na barra de endereço do navegador e clique em "Instalar".</li>
                <li><strong>No Celular (Android/Chrome):</strong> Abra o menu do navegador (três pontos) e selecione "Instalar aplicativo" ou "Adicionar à tela inicial".</li>
                <li><strong>No iPhone (iOS/Safari):</strong> Toque no ícone de compartilhamento (um quadrado com uma seta para cima) e depois selecione "Adicionar à Tela de Início".</li>
              </ul>
              <p className="pt-2 text-sm text-muted-foreground">Depois de instalado, o painel funcionará como um aplicativo nativo, e as notificações de novos pedidos chegarão diretamente no seu dispositivo.</p>
          </CardContent>
      </Card>
    </div>
  );
}
