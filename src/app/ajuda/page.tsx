'use client';

import PageHeader from "@/components/page-header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LifeBuoy, MessageSquare, Book, HeartHandshake } from "lucide-react";

const faqs = [
  {
    question: "Como faço para criar uma conta?",
    answer: "É fácil! Clique no ícone de perfil no canto superior direito do site e selecione 'Cadastre-se'. Preencha suas informações e você estará pronto para fazer seu primeiro pedido. Ter uma conta permite que você acompanhe seus pedidos e tenha uma experiência de compra mais rápida."
  },
  {
    question: "Como faço um pedido?",
    answer: "Navegue pelas nossas categorias de produtos na página inicial. Ao encontrar um item que goste, clique no botão 'Adicionar'. Quando terminar de escolher, clique no ícone do carrinho de compras no topo da página para revisar seus itens e finalizar a compra."
  },
  {
    question: "Quais são as formas de pagamento aceitas?",
    answer: "Aceitamos Pix, dinheiro (para pagamento na entrega) e todos os principais cartões de crédito e débito. Suas informações de pagamento são processadas com segurança."
  },
  {
    question: "Como posso acompanhar meu pedido?",
    answer: "Após finalizar a compra, você pode acompanhar o status do seu pedido em tempo real na página 'Meus Pedidos'. Assim que o status for atualizado (por exemplo, de 'Pendente' para 'Enviado'), você verá a mudança lá."
  },
  {
    question: "Qual é o tempo estimado de entrega?",
    answer: "O tempo de entrega varia dependendo da sua localização. Em geral, os pedidos são entregues em até 60 minutos após a confirmação do pagamento. Você receberá uma notificação quando seu pedido sair para entrega."
  },
  {
    question: "Posso cancelar meu pedido?",
    answer: "Sim, você pode cancelar seu pedido diretamente na página 'Meus Pedidos', mas apenas enquanto o status do pedido ainda for 'Pendente'. Após o pedido ser marcado como 'Pago' ou 'Enviado', ele não poderá mais ser cancelado."
  },
];

const policies = [
    {
      question: "Qual é a política de troca?",
      answer: "Se você receber um item errado ou danificado, por favor, entre em contato com nosso suporte ao cliente imediatamente. Faremos a troca por um novo produto sem custos adicionais. É importante que o produto não tenha sido consumido."
    },
    {
      question: "E se eu me arrepender da compra?",
      answer: "Para produtos perecíveis como os nossos, o direito de arrependimento é limitado. Se o seu pedido ainda não foi enviado (status 'Pendente'), você pode cancelá-lo na página 'Meus Pedidos'. Após o envio, não podemos aceitar devoluções por arrependimento."
    }
]

export default function HelpPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <PageHeader
        title="Central de Ajuda"
        description="Precisa de ajuda? Encontre as respostas aqui."
      />
      <div className="mt-8 grid gap-8">
        {/* FAQ Section */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <LifeBuoy className="text-primary" />
                    Perguntas Frequentes (FAQ)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full space-y-4">
                    {faqs.map((faq, index) => (
                        <AccordionItem value={`item-faq-${index}`} key={index} className="rounded-lg border bg-background/50 px-4">
                        <AccordionTrigger className="text-left font-semibold hover:no-underline">
                            {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                            {faq.answer}
                        </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>

        {/* Policy Section */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Book className="text-primary" />
                    Política de Trocas e Devoluções
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full space-y-4">
                    {policies.map((policy, index) => (
                        <AccordionItem value={`item-policy-${index}`} key={index} className="rounded-lg border bg-background/50 px-4">
                        <AccordionTrigger className="text-left font-semibold hover:no-underline">
                            {policy.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                            {policy.answer}
                        </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>

        {/* Contact Section */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <HeartHandshake className="text-primary" />
                    Ainda precisa de ajuda?
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-4">
                    Se você não encontrou a resposta para sua pergunta, nossa equipe de suporte está pronta para ajudar.
                </p>
                <Button>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Entrar em Contato
                </Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
