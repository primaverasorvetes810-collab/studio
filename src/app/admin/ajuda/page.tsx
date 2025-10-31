
'use client';

import PageHeader from "@/components/page-header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, BarChart2, ShoppingCart, Truck, Package, Users, Gift, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

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
    const { toast } = useToast();
    
    const handleTestNotification = () => {
        if (!("Notification" in window)) {
          toast({
            variant: "destructive",
            title: "Navegador não suportado",
            description: "Este navegador não suporta notificações de desktop.",
          });
          return;
        }
    
        if (Notification.permission === "granted") {
          new Notification("Primavera Delivery", {
            body: "Este é um alarme de teste! Novos pedidos podem ser notificados assim.",
            icon: "/favicon.ico", 
          });
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
              new Notification("Permissão concedida!", {
                body: "Agora você pode receber notificações.",
              });
            } else {
                toast({
                    title: 'Permissão negada',
                    description: 'Você não receberá notificações.'
                });
            }
          });
        } else {
            toast({
                variant: "destructive",
                title: 'Permissão de notificação bloqueada',
                description: 'Você precisa permitir notificações nas configurações do seu navegador.'
            });
        }
    };

  return (
    <>
      <PageHeader
        title="Guia do Painel de Administração"
        description="Entenda o que cada seção do seu painel de controle faz."
      />
      <div className="mt-8 space-y-6">
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

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bell className="text-primary" />
                    Notificações Push (Alarmes)
                </CardTitle>
                <CardDescription>
                    Permita notificações em seu navegador para receber alertas, como quando um novo pedido chegar.
                    Clique no botão para pedir permissão e enviar uma notificação de teste para o seu dispositivo.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={handleTestNotification}>
                    Testar Alarme
                </Button>
            </CardContent>
        </Card>

      </div>
    </>
  );
}
