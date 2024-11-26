import { ReactNode } from 'react';
import { Button } from "@/components/ui/button";
import { House, SquareCheckBig, Layers3, Archive } from 'lucide-react';
import { usePathname } from 'next/navigation';
import  SvgComponenttEscuro  from '@/components/ui/logoEscuro'

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
  
  const pathname = usePathname(); // Obtém a rota base da URL

  return (
    <>
      {source === 'advogado' ? (
        <div className="w-[260px] bg-[#007259]" style={{ boxShadow: "2px 0 12px rgba(0, 0, 0, 0.4)" }} >
          <header className="flex items-center p-3" />
          <nav className="flex flex-col gap-1 p-2">
            <Button 
              variant="ghost" 
              onClick={onPaginaInicial}
              className={`justify-start gap-4 px-4 py-8 rounded-md ${
                pathname === '/telaAdvogado'
                  ? 'text-[#007259] bg-[#fff]/95'
                  : 'text-[#fff] hover:bg-[#EBEDF0]/10 hover:text-[#fff]'
              } `}
            >
              <House className="w-5 h-5" />Página Inicial
            </Button>
            <Button 
              variant="ghost" 
              onClick={onEnvioArquivo}className={`justify-start gap-4 px-4 py-8 rounded-md ${
                pathname === '/envioArquivo'
                  ? 'text-[#007259] bg-[#fff]/95'
                  : 'text-[#fff] hover:bg-[#EBEDF0]/10 hover:text-[#fff]'
              } `}
            >
              {cadastrarFuncionarioIcon}{DescricaoBtn1}
            </Button>
            <Button 
              variant="ghost" 
              onClick={onTrabalhosConcluidos}
              className={`justify-start gap-4 px-4 py-8 rounded-md ${
              pathname === '/TrabalhosConcluidosAdv'
                  ? 'text-[#007259] bg-[#fff]/95'
                  : 'text-[#fff] hover:bg-[#EBEDF0]/10 hover:text-[#fff]'
              } `}
            >
              <SquareCheckBig className="w-5 h-5" />Concluídos
            </Button>
            <Button 
              variant="ghost" 
              onClick={onTrabalhosEmProcesso}
              className={`justify-start gap-4 px-4 py-8 rounded-md ${
              pathname === '/TrabalhosEmProcessoAdv'
                    ? 'text-[#007259] bg-[#fff]/95'
                    : 'text-[#fff] hover:bg-[#EBEDF0]/10 hover:text-[#fff]'
                } `}
            >
              <Layers3 className="w-5 h-5" />Em Andamento
            </Button>
            <Button 
              variant="ghost" onClick={onArquivados}
              className={`justify-start gap-4 px-4 py-8 rounded-md ${
              pathname === '/ArquivadosAdv'
                    ? 'text-[#007259] bg-[#fff]/95'
                    : 'text-[#fff] hover:bg-[#EBEDF0]/10 hover:text-[#fff]'
                } `}
            >
              <Archive className="w-5 h-5" />{DescricaoBtn2}
            </Button>
            <div className="fixed bottom-0 p-4 pb-8">
              <div className="text-[16px] text-[#fff]/60">Página do Cliente</div>
              <div className="text-[12px] text-[#fff]/60">Copyright 2024 ®</div>
            </div>
          </nav>
        </div>


      ) : source === 'empresa' ? (
        <div className="w-[260px] bg-[#2B3C56]" style={{ boxShadow: "2px 0 12px rgba(0, 0, 0, 0.4)" }} >
          <button className='p-6 pb-4 ml-1' onClick={onHome}>
            <SvgComponenttEscuro />
          </button>
          <header className="flex items-center p-3" />
          <nav className="flex flex-col gap-1 p-2">
            <Button 
              variant="ghost" 
              onClick={onPaginaInicial}
              className={`justify-start gap-4 px-4 py-8 rounded-md ${
                pathname === '/telaEmpresa'
                  ? 'text-[#2B3C56] bg-[#fff]/95 hover:text-[#2B3C56]'
                  : 'text-[#fff] hover:bg-[#EBEDF0]/10 hover:text-[#fff]'
              } `}
            >
              <House className="w-5 h-5"/>Página Inicial
            </Button>
            <Button 
              variant="ghost" 
              onClick={onCadastrarFuncionario}
              className={`justify-start gap-4 px-4 py-8 rounded-md ${
                pathname === '/cadastrarFuncionario'
                  ? 'text-[#2B3C56] bg-[#fff]/95 hover:text-[#2B3C56]'
                  : 'text-[#fff] hover:bg-[#EBEDF0]/10 hover:text-[#fff]'
                } `} 
            >
              {cadastrarFuncionarioIcon}{DescricaoBtn1}
            </Button>
            <Button 
              variant="ghost" 
              onClick={onTrabalhosConcluidos}
              className={`justify-start gap-4 px-4 py-8 rounded-md ${
                pathname === '/TrabalhosConcluidosAdm'
                  ? 'text-[#2B3C56] bg-[#fff]/95 hover:text-[#2B3C56]'
                  : 'text-[#fff] hover:bg-[#EBEDF0]/10 hover:text-[#fff]'
                } `} 
            >
              <SquareCheckBig className="h-5 w-5"/>Concluídos
            </Button>
            <Button 
              variant="ghost" 
              onClick={onTrabalhosEmProcesso}
              className={`justify-start gap-4 px-4 py-8 rounded-md ${
                pathname === '/TrabalhosEmProcessoAdm'
                  ? 'text-[#2B3C56] bg-[#fff]/95 hover:text-[#2B3C56]'
                  : 'text-[#fff] hover:bg-[#EBEDF0]/10 hover:text-[#fff]'
                } `} 
            >
              <Layers3 className="h-5 w-5"/>Em Andamento
            </Button>
            <Button 
              variant="ghost" 
              onClick={onArquivados}
              className={`justify-start gap-4 px-4 py-8 rounded-md ${
                pathname === '/ArquivadosEmpresa'
                  ? 'text-[#2B3C56] bg-[#fff]/95 hover:text-[#2B3C56]'
                  : 'text-[#fff] hover:bg-[#EBEDF0]/10 hover:text-[#fff]'
                } `} 
            >
              <Archive className="w-5 h-5"/>{DescricaoBtn2}
            </Button>
            <div className="fixed bottom-0 p-4 pb-8">
              <div className="text-[16px] text-[#fff]/60">Página do Adminstrador</div>
              <div className="text-[12px] text-[#fff]/60">Copyright 2024 ®</div>
            </div>
          </nav>
        </div>
        

      ) : (
        <div className="w-[260px] bg-[#007259]" style={{ boxShadow: "2px 0 12px rgba(0, 0, 0, 0.4)" }} >
          <header className="flex items-center p-3" />
          <nav className="flex flex-col gap-1 p-2">
            <Button
              variant="ghost" 
              onClick={onPaginaInicial}
              className={`justify-start gap-4 px-4 py-8 rounded-md ${
                pathname === '/telaFuncionario'
                  ? 'text-[#007259] bg-[#fff]/95'
                  : 'text-[#fff] hover:bg-[#EBEDF0]/10 hover:text-[#fff]'
              } `}
            >
              <House className="w-5 h-5"/>
              Página Inicial
            </Button>
            <Button 
              variant="ghost" 
              onClick={onTrabalhosConcluidos}
              className={`justify-start gap-4 px-4 py-8 rounded-md ${
                pathname === '/TrabalhosConcluidosFcn'
                  ? 'text-[#007259] bg-[#fff]'
                  : 'text-[#fff] hover:bg-[#EBEDF0]/10 hover:text-[#fff]'
              } `}
            >
              <SquareCheckBig className="h-5 w-5"/>Trabalhos Concluídos
            </Button>
            <div className="fixed bottom-0 p-4 pb-8">
              <div className="text-[16px] text-[#fff]/60">Página do Funcionário</div>
              <div className="text-[12px] text-[#fff]/60">Copyright 2024 ®</div>
            </div>
          </nav>
        </div>
      )}
    </> 
  )
}
          


        



        
          
          //Barra de navegação TelaFuncionario
      
      //   )}  
      // </div>
