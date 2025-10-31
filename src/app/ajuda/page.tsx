'use client';

import PageHeader from "@/components/page-header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Quais são as formas de pagamento aceitas?",
    answer: "Aceitamos Pix, dinheiro (para pagamento na entrega) e todos os principais cartões de crédito e débito. Suas informações de pagamento são processadas com segurança."
  },
  {
    question: "Como posso acompanhar meu pedido?",
    answer: "Você pode acompanhar o status do seu pedido em tempo real na página 'Meus Pedidos'. Assim que o status for atualizado (por exemplo, de 'Pendente' para 'Enviado'), você verá a mudança lá."
  },
  {
    question: "Qual é o tempo estimado de entrega?",
    answer: "O tempo de entrega varia dependendo da sua localização. Em geral, os pedidos são entregues em até 60 minutos após a confirmação do pagamento. Você receberá uma notificação quando seu pedido sair para entrega."
  },
  {
    question: "Posso cancelar meu pedido?",
    answer: "Sim, você pode cancelar seu pedido diretamente na página 'Meus Pedidos', mas apenas enquanto o status do pedido ainda for 'Pendente'. Após o pedido ser marcado como 'Pago' ou 'Enviado', ele não poderá mais ser cancelado."
  },
  {
    question: "O que faço se houver um problema com meu pedido?",
    answer: "Se você receber um item errado, danificado ou se houver qualquer outro problema com seu pedido, por favor, entre em contato com nosso suporte ao cliente o mais rápido possível através do nosso chat ou telefone. Teremos prazer em resolver a questão para você."
  },
  {
    question: "Como me registro para uma conta?",
    answer: "É fácil! Clique no ícone de perfil no canto superior direito e selecione 'Cadastre-se'. Preencha suas informações e você estará pronto para fazer seu primeiro pedido."
  }
];

export default function HelpPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <PageHeader
        title="Central de Ajuda"
        description="Encontre respostas para as perguntas mais comuns."
      />
      <div className="mt-8">
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem value={`item-${index}`} key={index} className="rounded-lg border bg-card px-4">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
