'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, BarChart2, ShoppingCart, Truck, Package, Users, Gift, Bell, AlertTriangle } from "lucide-react";
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
            body: "Este é um alarme de teste! Você está pronto para receber notificações.",
            icon: "/icons/icon-192x192.png",
          });
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
              new Notification("Permissão concedida!", {
                body: "Agora você pode receber notificações.",
                icon: "/icons/icon-192x192.png",
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
                  <Bell className="text-primary" />
                  Testar Notificações
              </CardTitle>
              <CardDescription>
                  Permita notificações em seu navegador para receber alertas, como quando um novo pedido chegar.
                  Clique no botão para pedir permissão e enviar uma notificação de teste para o seu dispositivo.
              </CardDescription>
          </CardHeader>
          <CardContent>
              <Button onClick={handleTestNotification}>
                  Testar Notificação
              </Button>
          </CardContent>
      </Card>

      <Card className="border-amber-500/50 bg-amber-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
            <AlertTriangle />
            Solucionando Problemas: Cadastro de Produtos
          </CardTitle>
          <CardDescription className="text-amber-700/80 dark:text-amber-500/80">
            Entenda quais ações podem interromper um cadastro em andamento e como o sistema te protege.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <p className="text-muted-foreground">
                Quando você cadastra um novo produto e envia uma imagem, o sistema inicia um processo de upload que pode levar alguns segundos. Para te proteger contra a perda de dados, implementamos uma trava de segurança.
            </p>
            <p className="font-semibold">As seguintes ações irão interromper o envio de um produto:</p>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                <li><strong>Sair da sua conta (Logout):</strong> O sistema irá exibir um alerta de confirmação antes de permitir que você saia.</li>
                <li><strong>Fechar a aba ou janela do navegador:</strong> Seu navegador exibirá um alerta padrão, perguntando se você tem certeza que deseja sair da página.</li>
                <li><strong>Recarregar a página (F5 ou Cmd+R):</strong> Assim como fechar a aba, o navegador pedirá uma confirmação antes de recarregar.</li>
            </ul>
            <p className="text-muted-foreground mt-2">
                Se você confirmar qualquer uma dessas ações, o envio do produto em andamento será **cancelado**, e a "ficha de espera" desaparecerá. Para garantir o cadastro, aguarde a conclusão do progresso antes de realizar essas ações.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
