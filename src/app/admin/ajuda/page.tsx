
'use client';

import PageHeader from "@/components/page-header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, BarChart2, ShoppingCart, Truck, Package, Users, Gift } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const adminFaqs = [
  {
    icon: BarChart2,
    title: "Dashboard",
    content: "O Dashboard é a sua visão geral. Ele mostra métricas importantes como receita total, número de pedidos, total de clientes e a quantidade de produtos cadastrados. Use-o para ter um pulso rápido do seu negócio. O gráfico de visão geral mostra suas vendas mensais."
  },
  {
    icon: ShoppingCart,
    title: "Pedidos",
    content: "Nesta seção, você pode ver todos os pedidos feitos na sua loja, de todos os clientes. É aqui que você gerencia o ciclo de vida de um pedido, alterando seu status de 'Pendente' para 'Pago', 'Enviado', 'Entregue' ou 'Cancelado'."
  },
  {
    icon: Truck,
    title: "Entregas",
    content: "A aba Entregas é o seu centro de logística. Ela filtra automaticamente todos os pedidos que estão com status 'Pago' ou 'Enviado', mostrando o que precisa ser preparado e despachado. Aqui você encontra o endereço e contato do cliente para a entrega."
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
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <PageHeader
        title="Guia do Painel de Administração"
        description="Entenda o que cada seção do seu painel de controle faz."
      />
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="text-primary" />
              Funcionalidades do Painel
            </CardTitle>
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
        <div className="mt-8 text-center">
            <Button asChild>
                <Link href="/admin">Voltar para o Painel</Link>
            </Button>
        </div>
      </div>
    </div>
  );
}
