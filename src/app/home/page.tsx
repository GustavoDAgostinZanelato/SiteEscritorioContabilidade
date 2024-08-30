import Link from "next/link"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

// min-h-[100dvh]
export default function Component() {
  return (
    <div className="flex flex-col ">
      <header className="bg-primary text-primary-foreground px-4 lg:px-20 h-[50%]  flex items-center">
      <Link href="#" className="flex items-center justify-center" prefetch={false}>
        <h1>aaa</h1>
        <span className="sr-only">Marcelo Zanelato - Economista Perito</span>
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-10">
        <Link href="#" className="text-sm font-medium hover:underline underline-offset-6" prefetch={false}>
          Serviços
        </Link>
        <Link href="#" className="text-sm font-medium hover:underline underline-offset-6" prefetch={false}>
          Contato
        </Link>
        <Link href="#" className="text-sm font-medium hover:underline underline-offset-6" prefetch={false}>
          Entrar  
        </Link>
      </nav>
    </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Soluções contábeis de confiança
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Oferecemos serviços contábeis abrangentes para empresas de todos os tamanhos, desde a preparação de
                    declarações de imposto até a assessoria financeira estratégica.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link
                    href="#"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    prefetch={false}
                  >
                    Agende uma consulta
                  </Link>
                  <Link
                    href="#"
                    className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    prefetch={false}
                  >
                    Saiba mais
                  </Link>
                </div>
              </div>
              <img
                src="/placeholder.svg"
                width="550"
                height="550"
                alt="Hero"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
              />
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Conheça nossa equipe</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Nossa equipe de contadores experientes e dedicados está pronta para atender às suas necessidades
                  financeiras com eficiência e atenção personalizada.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="grid gap-1">
                  <h3 className="text-xl font-bold">João Silva</h3>
                  <p className="text-muted-foreground">Contador Sênior</p>
                  <p className="text-muted-foreground">Mais de 15 anos de experiência em contabilidade corporativa.</p>
                </div>
                <div className="grid gap-1">
                  <h3 className="text-xl font-bold">Maria Oliveira</h3>
                  <p className="text-muted-foreground">Contadora Gerente</p>
                  <p className="text-muted-foreground">
                    Especialista em planejamento tributário e assessoria financeira.
                  </p>
                </div>
                <div className="grid gap-1">
                  <h3 className="text-xl font-bold">Pedro Almeida</h3>
                  <p className="text-muted-foreground">Contador Júnior</p>
                  <p className="text-muted-foreground">Recém-formado, com habilidades em auditoria e contabilidade.</p>
                </div>
              </div>
              <img
                src="/placeholder.svg"
                width="550"
                height="310"
                alt="Equipe"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
              />
              <div className="flex flex-col justify-center space-y-4">
                <div className="grid gap-1">
                  <h3 className="text-xl font-bold">Ana Souza</h3>
                  <p className="text-muted-foreground">Contadora Sênior</p>
                  <p className="text-muted-foreground">Especialista em contabilidade de pequenas e médias empresas.</p>
                </div>
                <div className="grid gap-1">
                  <h3 className="text-xl font-bold">Lucas Ferreira</h3>
                  <p className="text-muted-foreground">Contador Gerente</p>
                  <p className="text-muted-foreground">
                    Líder de equipe com ampla experiência em assessoria financeira.
                  </p>
                </div>
                <div className="grid gap-1">
                  <h3 className="text-xl font-bold">Fernanda Rodrigues</h3>
                  <p className="text-muted-foreground">Contadora Júnior</p>
                  <p className="text-muted-foreground">Recém-formada, com habilidades em contabilidade e auditoria.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 sm:px-10 md:gap-16 md:grid-cols-2">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Contato</div>
                <h2 className="lg:leading-tighter text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl xl:text-[3.4rem] 2xl:text-[3.75rem]">
                  Fale conosco
                </h2>
                <form className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input id="name" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="m@example.com" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="message">Mensagem</Label>
                    <Textarea id="message" rows={4} required />
                  </div>
                  <Button type="submit" className="w-full">
                    Enviar
                  </Button>
                </form>
              </div>
              <div className="flex flex-col items-start space-y-4">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Credenciais</div>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                  Nossa equipe de contadores altamente qualificados possui certificações e experiência comprovadas,
                  garantindo que seus negócios recebam assessoria financeira de excelência.
                </p>
                <ul className="grid gap-3">
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-5 w-5 text-primary" />
                    <span>Certificação CPC (Contador Público Certificado)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-5 w-5 text-primary" />
                    <span>Membros da Ordem dos Contabilistas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-5 w-5 text-primary" />
                    <span>Experiência média de 10 anos no setor</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 Acme Accounting. Todos os direitos reservados.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Termos de Serviço
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacidade
          </Link>
        </nav>
      </footer>
    </div>
  )
}

import React from 'react';

// Define um tipo para as props
interface IconProps extends React.SVGProps<SVGSVGElement> {}

function ActivityIcon(props: IconProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
    </svg>
  );
}

function CheckIcon(props: IconProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export { ActivityIcon, CheckIcon };
