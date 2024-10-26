import { ReactNode } from 'react';
import { Button } from "@/components/ui/button";
import SvgComponentClaro from "@/components/ui/logoClaro";
import { House, SquareCheckBig, Layers3, Archive } from 'lucide-react';

interface DocumentData {
  CaminhoArquivo: string;
  DataEntrega: string;
  DataEnvio: string;
  Descricao: string;
  Status: string;
  Titulo: string;
  Nome: string;
  Sobrenome: string;
  Telefone: string;
  Email: string;
  cpfAdvogado: string;
  docId: string;
  valor: string;
  feedbackOrcamento: string;
  data: string;
}

interface DocumentDataEncapsulamento {
  data: DocumentData;
  docId: string;
}

interface SideBarLayoutProps {
  children?: ReactNode;
  source: string;
  DescricaoBtn1?: string;
  DescricaoBtn2?: string;
  primeiraLetra?: string;
  orcamentos?: any[];
  loading: boolean;
  cadastrarFuncionarioIcon?: ReactNode;
  documentData?: DocumentDataEncapsulamento | null;
  onRefresh?: () => void;
  onHome: () => void;
  onPaginaInicial: () => void;
  onEnvioArquivo: () => void;         //rota única do Advogado
  onCadastrarFuncionario: () => void; //rota única da empresa
  onTrabalhosConcluidos: () => void;
  onTrabalhosEmProcesso: () => void;
  onArquivados: () => void;
}

export default function SideBarLayout({
  children,
  source,
  loading,
  DescricaoBtn1,
  DescricaoBtn2,
  cadastrarFuncionarioIcon,
  onHome,
  onPaginaInicial,
  onEnvioArquivo,         //rota única do Advogado
  onCadastrarFuncionario, //rota única da empresa
  onTrabalhosConcluidos,
  onTrabalhosEmProcesso,
  onArquivados,
}: SideBarLayoutProps) {


  return (
    <div className="grid md:grid-cols-[260px_1fr] min-h-screen w-full">
      <div className="flex flex-col bg-background text-foreground border-r">
        <header className="flex items-center p-4">
          {loading ? (
            <div className="p-5" />
          ) : (
            <button onClick={onHome} className="pl-5 pt-1">
              <SvgComponentClaro />
            </button>
          )}
        </header>

        {source === 'advogado' ? (
        //Barra de navegação TelaAdvogado
          <nav className="flex flex-col gap-1 p-2">
            <Button variant="ghost" className="justify-start gap-2 px-3 py-2 rounded-md hover:bg-muted" onClick={onPaginaInicial}>
              <House className="w-5 h-5" />
              Página Inicial
            </Button>
            <Button variant="ghost" className="justify-start gap-2 px-3 py-2 rounded-md hover:bg-muted" onClick={onEnvioArquivo}>
              {cadastrarFuncionarioIcon}
              {DescricaoBtn1}
            </Button>
            <Button variant="ghost" className="justify-start gap-2 px-3 py-2 rounded-md hover:bg-muted" onClick={onTrabalhosConcluidos}>
              <SquareCheckBig className="h-5 w-5" />
              Trabalhos Concluídos
            </Button>
            <Button variant="ghost" className="justify-start gap-2 px-3 py-2 rounded-md hover:bg-muted" onClick={onTrabalhosEmProcesso}>
              <Layers3 className="h-5 w-5" />
              Trabalhos em Processo
            </Button>
            <Button variant="ghost" className="justify-start gap-2 px-3 py-2 rounded-md hover:bg-muted" onClick={onArquivados}>
              <Archive className="w-5 h-5" />
              {DescricaoBtn2}
            </Button>
          </nav>

        //Barra de navegação TelaEmpresa
        ) : source === 'empresa' ? (
          <nav className="flex flex-col gap-1 p-2">
            <Button variant="ghost" className="justify-start gap-2 px-3 py-2 rounded-md hover:bg-muted" onClick={onPaginaInicial}>
              <House className="w-5 h-5" />
              Página Inicial
            </Button>
            <Button variant="ghost" className="justify-start gap-2 px-3 py-2 rounded-md hover:bg-muted" onClick={onCadastrarFuncionario}>
              {cadastrarFuncionarioIcon}
              {DescricaoBtn1}
            </Button>
            <Button variant="ghost" className="justify-start gap-2 px-3 py-2 rounded-md hover:bg-muted" onClick={onTrabalhosConcluidos}>
              <SquareCheckBig className="h-5 w-5" />
              Trabalhos Concluídos
            </Button>
            <Button variant="ghost" className="justify-start gap-2 px-3 py-2 rounded-md hover:bg-muted" onClick={onTrabalhosEmProcesso}>
              <Layers3 className="h-5 w-5" />
              Trabalhos em Processo
            </Button>
            <Button variant="ghost" className="justify-start gap-2 px-3 py-2 rounded-md hover:bg-muted" onClick={onArquivados}>
              <Archive className="w-5 h-5" />
              {DescricaoBtn2}
            </Button>
          </nav>
        ) : (

          //Barra de navegação TelaFuncionario
          <nav className="flex flex-col gap-1 p-2">
            <Button variant="ghost" className="justify-start gap-2 px-3 py-2 rounded-md hover:bg-muted" onClick={onPaginaInicial}>
              <House className="w-5 h-5" />
              Página Inicial
            </Button>
            <Button variant="ghost" className="justify-start gap-2 px-3 py-2 rounded-md hover:bg-muted" onClick={onTrabalhosConcluidos}>
              <SquareCheckBig className="h-5 w-5" />
              Trabalhos Concluídos
            </Button>
          </nav>
        )}  
      </div>

      {/* Conteúdo dinâmico */}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}