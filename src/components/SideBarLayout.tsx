import { ReactNode } from 'react';
import { Button } from "@/components/ui/button";
import SvgComponentClaro from "@/components/ui/logoClaro";
import { House, UsersRound, SquareCheckBig, Layers3, Archive } from 'lucide-react'; // Importando os ícones

interface SideBarLayoutProps {
  children?: ReactNode;
  onRefresh?: () => void;
  onNavigateHome: () => void;
  onCadastrarFuncionario: () => void;
  onEnvioArquivo: () => void;
  onTrabalhosArquivados: () => void;
  onPaginaInicial: () => void;
  primeiraLetra?: string;
  orcamentos?: any[];
  loading: boolean;
  DescricaoBtn1?: string;
  DescricaoBtn2?: string;
  cadastrarFuncionarioIcon?: ReactNode;
}

export default function SideBarLayout({
  children,
  onNavigateHome,
  onCadastrarFuncionario,
  onTrabalhosArquivados,
  onPaginaInicial,
  onEnvioArquivo,
  loading,
  DescricaoBtn1 = "Cadastrar Funcionário", // Valor padrão
  DescricaoBtn2 = "Trabalhos Recusados",   // Valor padrão
  cadastrarFuncionarioIcon = <UsersRound className="h-5 w-5" />, // Ícone padrão
}: SideBarLayoutProps) {
  return (
    <div className="grid md:grid-cols-[260px_1fr] min-h-screen w-full">
      {/* Sidebar de navegação */}
      <div className="flex flex-col bg-background text-foreground border-r">
        <header className="flex items-center p-4">
          {loading ? (
            <div className="p-5" />
          ) : (
            <button onClick={onNavigateHome} className="pl-5 pt-1">
              <SvgComponentClaro />
            </button>
          )}
        </header>

        <nav className="flex flex-col gap-1 p-2">
          <Button variant="ghost" className="justify-start gap-2 px-3 py-2 rounded-md hover:bg-muted" onClick={onPaginaInicial}>
            <House className="w-5 h-5" />
            Página Inicial
          </Button>
          <Button variant="ghost" className="justify-start gap-2 px-3 py-2 rounded-md hover:bg-muted" onClick={onEnvioArquivo}>
            {cadastrarFuncionarioIcon} {/* Usando a nova propriedade para o ícone */}
            {DescricaoBtn1} {/* Usando a nova propriedade para o texto */}
          </Button>
          <Button variant="ghost" className="justify-start gap-2 px-3 py-2 rounded-md hover:bg-muted">
            <SquareCheckBig className="h-5 w-5" />
            Trabalhos Concluídos
          </Button>
          <Button variant="ghost" className="justify-start gap-2 px-3 py-2 rounded-md hover:bg-muted">
            <Layers3 className="h-5 w-5" />
            Trabalhos em Processo
          </Button>
          <Button variant="ghost" className="justify-start gap-2 px-3 py-2 rounded-md hover:bg-muted" onClick={onTrabalhosArquivados}>
            <Archive className="w-5 h-5" />
            {DescricaoBtn2}
          </Button>
        </nav>
      </div>

      {/* Conteúdo dinâmico */}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}
