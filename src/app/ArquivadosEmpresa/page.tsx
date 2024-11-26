"use client";

import { UsersRound } from 'lucide-react';
import { app } from '../firebase/firebase'; 
import { useEffect, useState } from 'react';
import { WorkList } from '@/components/WorkList';
import { useSearchParams } from 'next/navigation';
import { SearchBar } from '@/components/SearchBar';
import LoadingScreen from '@/components/LoadingScreen';
import { WorkDetails } from '@/components/WorkDetails';
import SideBarLayout from '@/components/SideBarLayout';
import DocumentFilter from '@/components/DocumentFilter';
import { collection, query, where, getDocs, getFirestore, doc, getDoc } from "firebase/firestore";
import Navigation from '@/components/navigation/navigation';
import dynamic from "next/dynamic";

const db = getFirestore(app);

export function ArquivadosEmpresa() {
  //Puxando o ID do usuário pela URL
  const searchParams = useSearchParams();
  const uid = searchParams.get('uid');
  // Inicializando o componente de navegação
  const { NavegadorHome, RotasEmpresa } = Navigation({ uid });
  const { NavegadorPaginaInicial, NavegadorCadastrarFuncionario, NavegadorTrabalhosConcluidos, NavegadorTrabalhosEmProcesso, NavegadorArquivados } = RotasEmpresa();
  //Informações do usuário conectado
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpfEmpresa] = useState('');
  const primeiraLetra = nome.slice(0, 2);
  //Pegando os orçamentos no BD
  const [orcamentos, setOrcamentos] = useState<any[]>([]);
  const [documentData, setDocumentData] = useState<DocumentDataEncapsulamento | null>(null);
  //Filtro de pesquisa
  const [filteredOrcamentos, setFilteredOrcamentos] = useState(orcamentos);
  //Extras
  const [loading, setLoading] = useState(true); 

  interface DocumentData {
    CaminhoArquivo: string;
    DataEntrega: string;
    DataEnvio: string;  
    Descricao: string;
    Email: string;
    Nome: string;
    Sobrenome: string;
    Status: string;
    Telefone: string;
    Titulo: string;
    cpfAdvogado: string;
    cpfEmpresa: string;
    id: string;
  };
  type DocumentDataEncapsulamento =  {
    data: DocumentData,
    docId: string,
  };
    
  // Função para o botão de recarregar a página
  const handleRefresh = () => {
    window.location.reload();
  };
    
  //Função para buscar os dados do documento PDF no Firestore
  const fetchDocumentData = async (docId: string) => { //Recebe o ID do documento como parâmetro
    try {
      const docRef = doc(db, 'OrcamentosArquivados', docId); //Localiza o documento com base no ID dele
      const docSnapshot = await getDoc(docRef);
      if (docSnapshot.exists()) {
        const data = docSnapshot.data() as DocumentData;
        setDocumentData({
          data: data,
          docId: docId,
        });
      } else {
        console.log('Documento não encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar documento:', error);
    }
  };
    
  //Hook com as consultas nas coleções Empresa e Orcamento
  useEffect(() => {
    const fetchInfo = async () => {
        setLoading(true); // Inicia o estado de carregamento
        try {
            //Pega as informações do ADM com base no ID da URL
            const q = query(collection(db, "Empresa"), where("uid", "==", uid));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const empresaData = querySnapshot.docs[0].data();
                setNome(empresaData.nome);
                setSobrenome(empresaData.sobrenome);
                setEmail(empresaData.email);
                setCpfEmpresa(empresaData.cpf);
                console.log("Dados do Usuário:", querySnapshot.docs[0].data());

                //Aproveitando para pegar os documentos do BD
                const OrcamentosArquivadosQuery = query(collection(db, 'OrcamentosArquivados'), where("cpfEmpresa", "==", empresaData.cpf));
                const OrcamentosArquivadosSnapshot = await getDocs(OrcamentosArquivadosQuery);
                const orcamentoList = OrcamentosArquivadosSnapshot.docs.map(doc => {
                  const data = doc.data() as DocumentData; //Realizando a tipagem de orcamentoList com DocumentData
                  return {
                    ...data,
                    id: doc.id,
                  };
                });
                setOrcamentos(orcamentoList); //Coloca os documentos em uma lista, que será posteriormente percorrida pelo map

            } else {
              console.error("Dados não encontrados");
            }
        } catch (error) {
            setNome('Erro ao carregar nome'); //Transforma a variável "nome" na mensagem: "Erro ao carregar nome"
        } finally {
            setLoading(false); //Finaliza o estado de carregamento, independentemente da consulta ser um sucesso ou falhar
        }
    };
    if (uid) {
      fetchInfo(); //Chama a função fetchNome(), que está dentro do hook. Ela pega informações do Firebase
    }
  }, [uid]); //Sempre que a variável 'uid' mudar, o useEffect será executado, pois ela está listada nas dependências do hook

  return (
    <>
      <div className="grid md:grid-cols-[260px_1fr] min-h-screen w-full bg-[#2B3C56]">
        <SideBarLayout 
          onRefresh={handleRefresh}
          primeiraLetra={primeiraLetra}
          orcamentos={orcamentos}
          loading={loading}
          DescricaoBtn1="Cadastrar Funcionário"
          DescricaoBtn2="Recusados"
          source='empresa'
          cadastrarFuncionarioIcon={<UsersRound className="h-5 w-5" />}
          onHome={NavegadorHome}
          onPaginaInicial={NavegadorPaginaInicial}
          onCadastrarFuncionario={NavegadorCadastrarFuncionario}
          onTrabalhosConcluidos={NavegadorTrabalhosConcluidos}
          onTrabalhosEmProcesso={NavegadorTrabalhosEmProcesso}
          onArquivados={NavegadorArquivados}

          onEnvioArquivo={NavegadorHome} //rota propria do advogado e que nao será usada aqui, por isso mandando qualquer caminho
        />
        <div className="flex flex-col">
          <SearchBar handleRefresh={handleRefresh} onHome={NavegadorHome} primeiraLetra={primeiraLetra} source="empresa">
            <DocumentFilter 
              orcamentos={orcamentos} 
              onFilterChange={setFilteredOrcamentos} 
              source="ArquivadosAdm" 
            />
          </SearchBar>
          <div className="flex flex-1 overflow-hidden p-6 gap-6">
            {/* Aba Trabalhos Recusados */}
            <WorkList 
              orcamentos={filteredOrcamentos} 
              fetchDocumentData={fetchDocumentData} 
              titulo1={"Trabalhos Recusados"} 
              titulo2={"Total"} 
              id={documentData ? documentData.docId : ''}
              source="ArquivadosAdm"
            />
            {/* Aba Datalhes do Envio */}
            <WorkDetails
              documentData={documentData}
              loading={loading}
              cpf={cpf}
              source="ArquivadosAdm"
            />
          </div>
        </div>
      </div>
    </>
  )
}

const loadWithDelay = async () => {
  await new Promise((resolve) => setTimeout(resolve, 250));
  return ArquivadosEmpresa;
};

const arquivadosEmpresa = dynamic(() => loadWithDelay(), {
  ssr: false,
  loading: () => (
      <LoadingScreen source="empresa"/>
  ),
});

export default arquivadosEmpresa;