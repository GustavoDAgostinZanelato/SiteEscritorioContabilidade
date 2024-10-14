"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSearchParams } from 'next/navigation';
import SvgComponentClaro from "@/components/ui/logoClaro";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog,  DialogContent, DialogHeader, DialogTitle, DialogTrigger,} from "@/components/ui/dialog"
import { collection, query, where, getDocs, deleteDoc, getFirestore, doc, getDoc, addDoc, DocumentData, updateDoc } from "firebase/firestore";
import { SquareCheckBig } from 'lucide-react';
import { RotateCw } from 'lucide-react';
import { Layers3 } from 'lucide-react';
import { Archive } from 'lucide-react';
import { Trash2 } from 'lucide-react';
import { House } from 'lucide-react';
import { Send } from 'lucide-react';
import { app } from '../firebase/firebase';
import SideBarLayout from '@/components/SideBarLayout';
import { SearchBar } from '@/components/SearchBar';
import { WorkList } from '@/components/WorkList';
import { WorkDetails } from '@/components/WorkDetails';



const db = getFirestore(app);


export default function ArquivadosAdv() {
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
    // const [documentData, setDocumentData] = useState<DocumentData | null>(null);
    //Extras
    const router = useRouter(); 
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

    //Navegadador entre as telas
    const NavegadorHome = () => {
      router.push(`/`);
    };
    const NavegadorPaginaInicial = () => {
      router.push(`/telaAdvogado?uid=${uid}`);
    };
    const NavegadorEnvioArquivo  = () => {
      router.push(`/envioArquivo?uid=${uid}`);
    };
    const NavegadorTrabalhosArquivados = () => {
      router.push(`/ArquivadosAdv?uid=${uid}`);
    }
    const NavegadorCadastrarFuncionario = () => {
      router.push(`/cadastrarFuncionario?uid=${uid}`);
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
              onNavigateHome={NavegadorHome}
              onPaginaInicial={NavegadorPaginaInicial}
              onCadastrarFuncionario={NavegadorCadastrarFuncionario}
              onEnvioArquivo={NavegadorEnvioArquivo}
              onTrabalhosArquivados={NavegadorTrabalhosArquivados}
              primeiraLetra={primeiraLetra}
              loading={loading}
              orcamentos={orcamentos}
              DescricaoBtn1='Solicitar Orçamento'
              DescricaoBtn2='Trabahos Arquivados'
              cadastrarFuncionarioIcon={<Send className="w-5 h-5" />}
          />
          

          <div className="flex flex-col">
            <SearchBar handleRefresh={handleRefresh} primeiraLetra={primeiraLetra} />
              <div className="grid md:grid-cols-[1fr_400px] gap-4 p-4 flex-1">
                {/* Aba Trabalhos Recusados */}
                <WorkList 
                  orcamentos={orcamentos} 
                  fetchDocumentData={fetchDocumentData} 
                  titulo1={"Trabalhos Recusados"} 
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
                  id={documentData ? documentData.docId : ''}
                  source="arquivadosEmpresa"
                />
                </div>
            </div>
        </div>
    </>
  )
}


interface ConfirmationDeleteDocProps {
  dd: DocumentData;
}

// Função com uma Modal de confirmação para deletar os orçamentos do Advogado
export function ConfirmationDeleteDoc({ dd }: ConfirmationDeleteDocProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  //Botão para confirmar a exclusão
  const btnDeletar = async() => {
    try {
      const OrcamentosDocRef = doc(db, "OrcamentosArquivados", dd.id);
      await updateDoc(OrcamentosDocRef, {
        Status: "Documento Deletado"
      });
      setIsOpen(false);         // Fecha a Modal
      window.location.reload(); // Atualiza os orçamentos na tela
    } catch (error) {
      console.error("Erro ao atualizar o status do documento arquivado:", error);
    }
  };
  

  //Botão para cancelar a exclusão
  const btnCancelar = () => {
    setIsOpen(false); //Fecha a Modal
  }

  return(
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <Button variant="ghost" size="icon">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w[425px]">
        <DialogHeader>
          <DialogTitle className='text-2x1 font-bold text-center'> 
            Deletar Orçamento
          </DialogTitle>
        </DialogHeader>
        <div className='mt-6 text-center'>
          <p className='text-gray-500'>O arquivo "{dd.Titulo}" será deletado permanentemente. Deseja prosseguir?</p>
        </div>
        <div className='mt-6 flex flex-col sm:flex-row justify-center gap-4'>
          <Button variant="destructive" onClick={btnDeletar}>
            Deletar
          </Button>
          <Button variant="outline" onClick={btnCancelar}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}


interface ConfirmationRestoreDocProps {
  dd: DocumentData;
  cpf: string;
  nome: string;
  sobrenome: string;
  email: string;
  telefone: string;
}

// Função com uma Modal de confirmação para restaurar o documento arquivado
export function ConfirmationRestoreDoc({ dd, cpf, nome, sobrenome, email, telefone}: ConfirmationRestoreDocProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  //Botão para confirmar a ação
  const btnRestaurar = async() => {
    try {
      // Verifica se o status do documento no DocumentData é "Arquivado\n(Arquivado pelo Escritório)"
      if (dd.Status === "Arquivado pelo Escritório") {
        alert("Seu trabalho não pode ser restaurando pois foi arquivado pelo escritório.");
        setIsOpen(false); //Fecha a Modal
        return;
      }
      if (dd.Status === "Recusado pelo Escritório") {
        alert("Seu trabalho não pode ser restaurando pois foi recusado pelo escritório.");
        setIsOpen(false); //Fecha a Modal
        return;
      }
    //Enviando para a coleção Orcamento
    const OrcamentoRef = collection(db, "Orcamento");
    await addDoc(OrcamentoRef, {
      cpfAdvogado: cpf,
      Nome: nome,
      Sobrenome: sobrenome,
      Email: email,
      Telefone: telefone,
      Titulo: dd.Titulo,
      Descricao: dd.Descricao,
      DataEntrega: dd.DataEntrega,
      DataEnvio: dd.DataEnvio,
      CaminhoArquivo: dd.CaminhoArquivo,
      Status: "Aguardando Aprovação",
    });

    //Excluindo o orçamento arquivado da coleção OrcamentosArquivados
    const OrcamentosArquivadosDocRef = doc(db, "OrcamentosArquivados", dd.id);
    await deleteDoc(OrcamentosArquivadosDocRef);
    setIsOpen(false);         //Fecha a Modal
    window.location.reload(); //Atualiza os orçamentos na tela
    
    } catch (error) {
      console.log("Ação inesperada", error);
    }
  } 

  //Botão para cancelar o arquivamento
  const btnCancelar = () => {
    setIsOpen(false); //Fecha a Modal
  }


  return(
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <Button variant="ghost" size="icon">
          <RotateCw className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w[425px]">
        <DialogHeader>
          <DialogTitle className='text-2x1 font-bold text-center'> 
            Restaurar Orçamento
          </DialogTitle>
        </DialogHeader>
        <div className='mt-6 text-center'>
          <p className='text-gray-500'>Deseja restaurar "{dd.Titulo}"?</p>
        </div>
        <div className='mt-6 flex flex-col sm:flex-row justify-center gap-4'>
          <Button variant="default" onClick={btnRestaurar}>
            Restaurar
          </Button>
          <Button variant="outline" onClick={btnCancelar}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
