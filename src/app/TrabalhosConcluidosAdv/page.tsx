"use client";

import { Send } from 'lucide-react';
import { app } from '../firebase/firebase';
import { useEffect, useState } from 'react';
import { WorkList } from '@/components/WorkList';
import { useSearchParams } from 'next/navigation';
import { SearchBar } from '@/components/SearchBar';
import SideBarLayout from '@/components/SideBarLayout';
import { WorkDetails } from '@/components/WorkDetails';
import DocumentFilter from '@/components/DocumentFilter';
import { collection, query, where, getDocs, getFirestore, doc, getDoc } from "firebase/firestore";
import Navigation from '@/components/navigation/navigation';
import LoadingScreen from '@/components/LoadingScreen';
import dynamic from "next/dynamic";

const db = getFirestore(app);

export function TrabalhosConcluidosAdv() {
    //Puxando o ID do Advogado da URL
    const searchParams = useSearchParams();
    const uid = searchParams.get('uid');
    // Inicializando o componente de navegação
    const { NavegadorHome, RotasAdvogado } = Navigation({ uid });
    const { NavegadorPaginaInicial, NavegadorEnvioArquivo, NavegadorTrabalhosConcluidos, NavegadorTrabalhosEmProcesso, NavegadorArquivados } = RotasAdvogado();
    //Informações do Advogado
    const [nome, setNome] = useState('');
    const [sobrenome, setSobrenome] = useState('');
    const [email, setEmail] = useState('');
    const [cpf, setCpf] = useState('');
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
    };
    type DocumentDataEncapsulamento =  {
        data: DocumentData,
        docId: string,
    }

    // Função para recarregar a página
    const handleRefresh = () => {
        window.location.reload();
    };  
    const fetchDocumentData = async (docId: string) => {
        try {
          const docRef = doc(db, 'TrabalhosConcluidos', docId);
          const docSnapshot = await getDoc(docRef);
          if (docSnapshot.exists()) {
            const data = docSnapshot.data() as DocumentData;
            // Encapsulando os dados em uma propriedade 'data'
            setDocumentData({ data, docId }); // type 'DocumentData' is not assignabel to type 'string'
          } else {
            console.log('Documento não encontrado');
          }
        } catch (error) {
          console.error('Erro ao buscar documento:', error);
        }
      };

      useEffect(() => {
        const fetchNome = async () => {
            setLoading(true); //Inicia o carregamento
            try {
                //Pega as informações do Advogado com base no ID da URL
                const q = query(collection(db, "Advogado"), where("uid", "==", uid)); //Pega os dados da coleção "Advogado" com base no ID
                const querySnapshot = await getDocs(q); //Executa a consulta e retorna um snapshot contendo os documentos que correspondem à condição

                //Pega os arquivos no Banco de Dados caso querySnapshot não esteja vazio
                if (!querySnapshot.empty) {
                    console.log("Documento encontrado:", querySnapshot.docs[0].data());
                    const advogadoData = querySnapshot.docs[0].data();
                    setNome(advogadoData.nome);         
                    setSobrenome(advogadoData.sobrenome);
                    setEmail(advogadoData.email); //Colocando email, telefone e cpf em um estado para mandar pra coleção Orcamento
                    setCpf(advogadoData.cpf);
                    
                    // Após buscar o CPF, busca os orçamentos do advogado
                    const orcamentoQuery = query(collection(db, 'TrabalhosConcluidos'), 
                    where('cpfAdvogado', '==', advogadoData.cpf),
                    where('Indice', '==', 'Pronto pra o cliente'));
                    const orcamentoSnapshot = await getDocs(orcamentoQuery); //orcamentoSnapshot espera até todos os documentos serem buscados

                    const orcamentoList = orcamentoSnapshot.docs.map(doc => {
                      const data = doc.data() as DocumentData; //Realizando a tipagem de orcamentoList com DocumentData
                      return {
                        ...data,
                        id: doc.id,
                      };
                    });
                    setOrcamentos(orcamentoList);
                } else {
                  console.error("Advogado não encontrado!");
                }
            } catch (error) {
                console.error("Erro ao buscar o nome do advogado:", error);
                setNome('Erro ao carregar nome'); //Caso o nome do advogado não seja obtido, a mensagem é exibida no lugar da variável 'nome'
            } finally {
                setLoading(false); //Finaliza o estado de carregamento, independentemente da consulta ser um sucesso ou falhar
            }
        };
        if (uid) {
            fetchNome(); //Chama a função fetchNome(), que está dentro do hook. Ela pega informações do Firebase
        }
    }, [uid]); //Sempre que a variável 'uid' mudar, o useEffect será executado, pois ela está listada nas dependências do hook

    return(
        <>
        <div className="flex flex-col h-screen bg-[#2B3C56]">
            <SearchBar handleRefresh={handleRefresh} onHome={NavegadorHome} primeiraLetra={primeiraLetra} source="cliente">
                <DocumentFilter 
                orcamentos={orcamentos} 
                onFilterChange={setFilteredOrcamentos} 
                source="trabalhosConcluidosAdv" 
                />
            </SearchBar>
            <div className="flex flex-1 overflow-hidden">
                <SideBarLayout 
                    onRefresh={handleRefresh}
                    primeiraLetra={primeiraLetra}
                    documentData={documentData} 
                    orcamentos={orcamentos}
                    loading={loading}
                    DescricaoBtn1="Enviar Documento"
                    DescricaoBtn2="Arquivados"
                    source='advogado'
                    cadastrarFuncionarioIcon={<Send className="w-5 h-5" />}
                    onHome={NavegadorHome}
                    onPaginaInicial={NavegadorPaginaInicial}
                    onEnvioArquivo={NavegadorEnvioArquivo}
                    onTrabalhosConcluidos={NavegadorTrabalhosConcluidos}
                    onTrabalhosEmProcesso={NavegadorTrabalhosEmProcesso}
                    onArquivados={NavegadorArquivados}

                    onCadastrarFuncionario={NavegadorHome} //rota propria da empresa e que nao será usada aqui, por isso mandando qualquer caminho
                />
            
                <div className="flex flex-1 overflow-hidden p-6 gap-6">
                    {/* Aba Trabalhos em Processo */}
                    <WorkList 
                        orcamentos={filteredOrcamentos} 
                        fetchDocumentData={fetchDocumentData} 
                        titulo1={"Trabalhos Concluídos"}
                        titulo2={"Total"} 
                        id={documentData ? documentData.docId : ''}
                        source="trabalhosConcluidosAdv"
                    />
                    {/* Aba Datalhes do Envio */}
                    <WorkDetails
                        documentData={documentData}
                        loading={loading}
                        cpf={cpf}
                        source="ConcluidosAdv" 
                    />
                </div>
            </div>
        </div>
        </>   
    )
}

//Tela de Carregamento
const loadWithDelay = async () => {
    await new Promise((resolve) => setTimeout(resolve, 250));
    return TrabalhosConcluidosAdv;
  };
  
  const trabalhosConcluidosAdv = dynamic(() => loadWithDelay(), {
    ssr: false,
    loading: () => (
      <LoadingScreen source="advogado"/>
    ),
  });
  
  export default trabalhosConcluidosAdv