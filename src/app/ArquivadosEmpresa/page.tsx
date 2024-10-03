"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSearchParams } from 'next/navigation';
import SvgComponentClaro from "@/components/ui/logoClaro";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog,  DialogContent, DialogHeader, DialogTitle, DialogTrigger,} from "@/components/ui/dialog"
import { collection, query, where, getDocs, deleteDoc, getFirestore, doc, getDoc, updateDoc, addDoc, DocumentData, writeBatch  } from "firebase/firestore";
import { SquareCheckBig } from 'lucide-react';
import { UsersRound } from 'lucide-react';
import { RotateCw } from 'lucide-react';
import { Layers3 } from 'lucide-react';
import { Archive } from 'lucide-react';
import { Trash2 } from 'lucide-react';
import { House } from 'lucide-react';
import { app } from '../firebase/firebase'; 


const db = getFirestore(app);


export default function telaEmpresa() {
    //Puxando o ID do usuário pela URL
    const searchParams = useSearchParams();
    const uid = searchParams.get('uid');
    //Informações do usuário conectado
    const [nome, setNome] = useState('');
    const [sobrenome, setSobrenome] = useState('');
    const [email, setEmail] = useState('');
    const [telefone, setTelefone] = useState('');
    const [cpf, setCpfEmpresa] = useState('');
    const primeiraLetra = nome.slice(0, 2);
    //Pegando os orçamentos no BD
    const [orcamentos, setOrcamentos] = useState<DocumentData[]>([]);
    const [documentData, setDocumentData] = useState<DocumentData | null>(null);
    // const [caminhoArquivo, setCaminhoArquivo] = useState<string>('');
    //Extras
    const [loading, setLoading] = useState(true); 
    const router = useRouter(); 


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
    

    // Função para o botão de recarregar a página
    const handleRefresh = () => {
      window.location.reload();
    };

   //Navegadador entre as telas
    const NavegadorHome = () => {
      router.push(`/`);
    };
    const NavegadorCadastrarFuncionario = () => {
      router.push(`/cadastrarFuncionario?uid=${uid}`);
    };
    const NavegadorTelaEmpresa = () => {
        router.push(`/telaEmpresa?uid=${uid}`);
    }
  
    //Função para buscar os dados do documento PDF no Firestore
    const fetchDocumentData = async (docId: string) => { //Recebe o ID do documento como parâmetro
      try {
        const docRef = doc(db, 'OrcamentosArquivados', docId); //Localiza o documento com base no ID dele
        const docSnapshot = await getDoc(docRef);
        if (docSnapshot.exists()) {
          const data = docSnapshot.data() as DocumentData;
          setDocumentData(data);
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
                  setTelefone(empresaData.telefone);
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
        <div className="grid md:grid-cols-[260px_1fr] min-h-screen w-full">
            <div className="flex flex-col bg-background text-foreground border-r">
                <header className="flex items-center p-4">
                    <>
                      {loading ? (
                        <>
                           <div className="p-5"/>
                        </>
                      ) : (
                        <>
                          <button onClick={NavegadorHome} className='pl-5 pt-1'>
                            <SvgComponentClaro />
                          </button>
                        </>
                      )} 
                    </>
                </header>

                <nav className="flex flex-col gap-1 p-2">
                    <Button variant="ghost" className="justify-start gap-2 px-3 py-2 rounded-md hover:bg-muted" onClick={NavegadorTelaEmpresa}>
                        <House className="w-5 h-5" />
                        Página Inicial
                    </Button>
                    <Button variant="ghost" className="justify-start gap-2 px-3 py-2 rounded-md hover:bg-muted" onClick={NavegadorCadastrarFuncionario}>
                        <UsersRound className='h-5 w-5' />
                        Cadastrar Funcionario
                    </Button>
                    <Button variant="ghost" className="justify-start gap-2 px-3 py-2 rounded-md hover:bg-muted">
                        <SquareCheckBig className='h-5 w-5' />
                        Trabalhos Concluídos
                    </Button>
                    <Button variant="ghost" className="justify-start gap-2 px-3 py-2 rounded-md hover:bg-muted">
                        <Layers3 className='h-5 w-5' />
                        Trabalhos em Processo
                    </Button>
                    <Button variant="ghost" className="justify-start gap-2 px-3 py-2 rounded-md hover:bg-muted">
                        <Archive className="w-5 h-5" />
                        Trabalhos Recusados
                    </Button>
                </nav>
            </div>

            <div className="flex flex-col">
                <header className="flex items-center gap-2 p-4 border-b">
                    <div className="flex-1">
                        <Input type="search" placeholder="Pesquisar trabalhos" className="rounded-50  " />
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleRefresh}>
                        <RotateCw className="w-5 h-5" />
                    </Button>
                    <Avatar className="h-9 w-9">
                        <AvatarFallback> {primeiraLetra}  </AvatarFallback>
                    </Avatar>
                </header>


                {/* Aba Seus Trabalhos */}
                <div className="grid md:grid-cols-[1fr_400px] gap-4 p-4 flex-1">
                    <div className=" rounded-md overflow-hidden flex-1">
                        <div className="border-b p-3 bg-background">
                            <div className="font-medium">Documentos Arquivados</div>
                            <div className="text-muted-foreground text-sm"> Trabalhos arquivados: {orcamentos.length} </div>
                        </div>

                        <div className="divide-y">
                            {orcamentos.map((orcamentosArquivados, index) => (
                                <div className="flex items-center gap-3 p-3 hover:bg-[#efefef]" key={index} onClick={() => fetchDocumentData(orcamentosArquivados.id)}>
                                    <div className='h-3 w-3 rounded-full bg-[#e63330]'/>
                                    <div className="flex items-center w-full p-3 hover:cursor-pointer ">
                                        <h1 className="cursor-pointer text-blue-500" >
                                          <div>
                                            {orcamentosArquivados.Titulo}
                                          </div>
                                          <div className='text-muted-foreground text-sm'>
                                            Adv. {orcamentosArquivados.Nome} {orcamentosArquivados.Sobrenome}
                                          </div>
                                        </h1> 
                                        <div className="ml-auto flex items-center space-x-6">
                                          <h1 className="text-muted-foreground text-sm">Status: {orcamentosArquivados.Status}</h1>

                                          <ConfirmationRestoreDoc dd={orcamentosArquivados} />
                                          <ConfirmationDeleteDoc dd={orcamentosArquivados} />

                                        </div>
                                    </div>
                                </div>  
                            ))}
                        </div>
                    </div>


                    {/* Aba Datalhes do Envio */}
                    <div className="bg-muted rounded-md overflow-hidden flex-1">
                        <div className="border-b p-3 bg-background">
                            <div className="font-medium pb-5">Detalhes do envio</div>
                        </div>
                            <>
                              {loading ? (
                              <br></br>
                              ) : (
                                <div className="p-4 flex flex-col gap-4">
                                {documentData ? ( 
                                  <>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback>{documentData.Nome ? documentData.Nome.slice(0, 2) : ''}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="font-medium"> {documentData.Nome} {documentData.Sobrenome} </div>
                                            <div className="text-muted-foreground text-sm"> {documentData.Email} </div> 
                                        </div>
                                          <div className="text-muted-foreground text-sm">{documentData.DataEnvio}</div>
                                    </div>
                                    
                                    <div className="prose">
                                        <p><br/> {documentData.Descricao}</p>
                                        <p className="text-muted-foreground text-sm"><br/> Prazo de Entrega: {documentData.DataEntrega}</p><br/>
                                        <PDFViewer pdfUrl={documentData.CaminhoArquivo} />
                                    </div>  
                                </>

                                ) : ( // Caso documentData esteja vazio, as informações do usuário logado são exibidas
                                  <>
                                  <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback>{primeiraLetra}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="font-medium"> {nome} {sobrenome} </div>
                                            <div className="text-muted-foreground text-sm"> {email} </div> 
                                        </div>
                                    </div>
                                  </div>
                                  <h1 className="text-muted-foreground text-sm"><br/>Abra um documento para ver mais detalhes</h1>
                                </>
                              )}
                              </div>
                              )}
                          </>
                    </div>
                </div>
            </div>
        </div>
      </>
    )
  }



interface Property {
  pdfUrl: string
}

export function PDFViewer({ pdfUrl }: Property) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Visualizar PDF</Button>
      </DialogTrigger>

      <DialogContent className="max-w-7xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Visualizador de PDF</DialogTitle>
        </DialogHeader>

        <div className='flex-auto'>
          <div className=" h-[calc(90vh-100px)]">
            <iframe
              src={`${pdfUrl}#toolbar=0`}
              width="70%"
              height="100%"
              style={{ border: 'none' }}
            >
            </iframe> 
          </div>
        </div>
      </DialogContent>
    </Dialog>
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
      //Excluindo o orçamento da coleção "OrcamentosArquivados"
      const OrcamentosDocRef = doc(db, "OrcamentosArquivados", dd.id);
      await deleteDoc(OrcamentosDocRef);
      setIsOpen(false);         //Fecha a Modal
      window.location.reload(); //Atualiza os orçamentos na tela
    } 
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
  }
  
  // Função com uma Modal de confirmação para restaurar o documento arquivado
  export function ConfirmationRestoreDoc({ dd }: ConfirmationRestoreDocProps) {
    const [isOpen, setIsOpen] = useState(false);
    
    const btnRestaurar = async () => {
    try {
        // Verifica se existem documentos duplicados na coleção OrcamentosArquivados com o mesmo Titulo e Descricao
        const orcamentosDuplicadosQuery = query(
          collection(db, "OrcamentosArquivados"),
          where("Titulo", "==", dd.Titulo),
          where("Descricao", "==", dd.Descricao)
        );
        const duplicadosSnapshot = await getDocs(orcamentosDuplicadosQuery);

        // Se mais de um documento for encontrado com o mesmo Titulo e Descricao, exibe o alert
        if (duplicadosSnapshot.size > 1) {
        // alert("Existem documentos duplicados com o mesmo Título e Descrição.");
          
          const OrcamentoRef = collection(db, "Orcamento");
          await addDoc(OrcamentoRef, {
            cpfAdvogado: dd.cpfAdvogado,
            Nome: dd.Nome,
            Sobrenome: dd.Sobrenome,
            Email: dd.Email,  
            Telefone: dd.Telefone,
            Titulo: dd.Titulo,
            Descricao: dd.Descricao,
            DataEntrega: dd.DataEntrega,
            DataEnvio: dd.DataEnvio,
            CaminhoArquivo: dd.CaminhoArquivo,
            Status: "Aguardando Aprovação",
          });
          
          // Deleta todos os documentos duplicados
          const batch = writeBatch(db); // Inicia um batch para realizar múltiplas operações de escrita
          duplicadosSnapshot.forEach((doc) => {
            batch.delete(doc.ref); // Adiciona cada documento duplicado para ser deletado
          });
          await batch.commit(); // Executa a operação de batch para deletar os documentos duplicados

          setIsOpen(false);         // Fecha a Modal
          window.location.reload(); // Atualiza os orçamentos na tela 
          return;
        }


        // Buscar na coleção "Orcamento" onde a descrição é igual à do documento arquivado
        const orcamentoQuery = query(
          collection(db, "Orcamento"),
          where("Descricao", "==", dd.Descricao) // Usando dd.Descricao para comparar diretamente
        );
        
        const querySnapshot = await getDocs(orcamentoQuery);
        
        // Atualizar o campo "Status" para cada documento encontrado
        querySnapshot.forEach(async (docSnap) => {
          const OrcamentoDocRef = doc(db, "Orcamento", docSnap.id);
          await updateDoc(OrcamentoDocRef, {
            Status: "Aguardando Aprovação"
          });
        });

        // Excluindo o orçamento arquivado da coleção OrcamentosArquivados
        const OrcamentosArquivadosDocRef = doc(db, "OrcamentosArquivados", dd.id);
        await deleteDoc(OrcamentosArquivadosDocRef);

        //Finalizando o processo
        setIsOpen(false);         // Fecha a Modal
        window.location.reload(); // Atualiza os orçamentos na tela
      } catch (error) {
      console.error("Erro ao restaurar o documento:", error);
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
  