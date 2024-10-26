"use client";

import { Send } from 'lucide-react';
import { app } from '../firebase/firebase';
import { useEffect, useState } from 'react';
import { WorkList } from '@/components/WorkList';
import { useSearchParams } from 'next/navigation';
import { SearchBar } from '@/components/SearchBar';
import SideBarLayout from '@/components/SideBarLayout';
import { WorkDetails } from '@/components/WorkDetails';
import { collection, query, where, getDocs, getFirestore, doc, getDoc } from "firebase/firestore";
import Navigation from '@/components/navigation/navigation';

const db = getFirestore(app);

export default function ArquivadosAdv() {
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
    const [telefone, setTelefone] = useState('');
    const [cpf, setCpf] = useState('');
    const primeiraLetra = nome.slice(0, 2);
    //Pegando os orçamentos no BD
    const [orcamentos, setOrcamentos] = useState<any[]>([]);
    const [documentData, setDocumentData] = useState<DocumentDataEncapsulamento | null>(null);
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
      cpf: string;
      id: string;
    }
    type DocumentDataEncapsulamento =  {
      data: DocumentData,
      docId: string,
    }
    
    // Função para recarregar a página
    const handleRefresh = () => {
        window.location.reload();
    };
   
    // Função para buscar os dados do documento no Firestore
    const fetchDocumentData = async (docId: string) => {
      try {
        const docRef = doc(db, 'OrcamentosArquivados', docId);
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
                    setEmail(advogadoData.email); //Colocando email, telefone e cpf em um estado para mandar pra coleção OrcamentosArquivadosCPF
                    setTelefone(advogadoData.telefone);
                    setCpf(advogadoData.cpf);
                    
                    // Após buscar o CPF, busca os orçamentos do advogado
                    const OrcamentosArquivadosQuery = query(collection(db, 'OrcamentosArquivados'), 
                    where('cpfAdvogado', '==', advogadoData.cpf), 
                    where("cpfEmpresa", "==", "null"),
                    // where('Status', '==', "Arquivado")
                  );
                    const OrcamentosArquivadosSnapshot = await getDocs(OrcamentosArquivadosQuery); //orcamentoSnapshot espera até todos os documentos serem buscados
                    const orcamentoList = OrcamentosArquivadosSnapshot.docs.map(doc => {
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

    
    return (
      <>
        <div className="grid md:grid-cols-[260px_1fr] min-h-screen w-full">
          <SideBarLayout 
              onRefresh={handleRefresh}
              primeiraLetra={primeiraLetra}
              orcamentos={orcamentos}
              loading={loading}
              DescricaoBtn1='Solicitar Orçamento'
              DescricaoBtn2='Trabalhos Arquivados'
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
        
          <div className="flex flex-col">
            <SearchBar handleRefresh={handleRefresh} primeiraLetra={primeiraLetra} />
              <div className="grid md:grid-cols-[1fr_400px] gap-4 p-4 flex-1">
                {/* Aba Trabalhos Recusados */}
                <WorkList 
                  orcamentos={orcamentos} 
                  fetchDocumentData={fetchDocumentData} 
                  titulo1={"Trabalhos Arquivados"} 
                  titulo2={"Total"} 
                  source="trabalhosArquivados"
                />
                {/* Aba Datalhes do Envio */}
                <WorkDetails
                  documentData={documentData}
                  loading={loading}
                  cpf={cpf}
                  primeiraLetra={primeiraLetra}
                  nome={nome}
                  sobrenome={sobrenome}
                  email={email}
                  resposta={"Resposta do Escritório"}
                  id={documentData ? documentData.docId : ''}
                  source="arquivadosEmpresa"
                />
                </div>
            </div>
        </div>
    </>
  )
};