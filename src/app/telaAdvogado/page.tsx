"use client";

import { Send } from 'lucide-react';
import { app } from '../firebase/firebase';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { WorkList } from '@/components/WorkList';
import { useSearchParams } from 'next/navigation';
import { SearchBar } from '@/components/SearchBar';
import SideBarLayout from '@/components/SideBarLayout';
import { WorkDetails } from '@/components/WorkDetails';
import { collection, query, where, getDocs, getFirestore, doc, getDoc } from "firebase/firestore";

const db = getFirestore(app);

export default function TelaAdvogado() {
    //Puxando o ID do Advogado da URL
    const searchParams = useSearchParams();
    const uid = searchParams.get('uid');
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
    const router = useRouter(); 
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

    //Redireciona para a tela 
    const NavegadorHome = () => {
      router.push(`/`);
    };
    const NavegadorPaginaInicial = () => {
      router.push(`/telaAdvogado?uid=${uid}`);
    }
    const NavegadorEnvioArquivo = () => {
      router.push(`/envioArquivo?uid=${uid}`);
    };
    const NavegadorArquivadosAdv = () => {
      router.push(`/ArquivadosAdv?uid=${uid}`);
    };

    const fetchDocumentData = async (docId: string) => {
      try {
        const docRef = doc(db, 'Orcamento', docId);
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
                    setTelefone(advogadoData.telefone);
                    setCpf(advogadoData.cpf);
                    
                    // Após buscar o CPF, busca os orçamentos do advogado
                    const orcamentoQuery = query(collection(db, 'Orcamento'), where('cpfAdvogado', '==', advogadoData.cpf));
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

    return (
      <>
        <div className="grid md:grid-cols-[260px_1fr] min-h-screen w-full">
          <SideBarLayout 
            onRefresh={handleRefresh}
            onNavigateHome={NavegadorHome}
            onCadastrarFuncionario={NavegadorEnvioArquivo}
            onTrabalhosArquivados={NavegadorArquivadosAdv}
            onPaginaInicial={NavegadorPaginaInicial}
            onEnvioArquivo={NavegadorEnvioArquivo}
            primeiraLetra={primeiraLetra}
            loading={loading}
            orcamentos={orcamentos}
            DescricaoBtn1="Solicitar Orçamento"
            DescricaoBtn2="Trabalhos Arquivados"
            cadastrarFuncionarioIcon={<Send className="w-5 h-5" />} // Passando o novo ícone
          />
          <div className="flex flex-col">
            <SearchBar handleRefresh={handleRefresh} primeiraLetra={primeiraLetra} />
              <div className="grid md:grid-cols-[1fr_400px] gap-4 p-4 flex-1">
                {/* Aba Trabalhos Enviados */}
                <WorkList 
                  orcamentos={orcamentos} 
                  fetchDocumentData={fetchDocumentData} 
                  titulo1={"Trabalhos Enviados"}
                  titulo2={"Total"} 
                  source="advogado"
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
                source="advogado" 
              />
              </div>
          </div>
        </div>
    </>
  )
}