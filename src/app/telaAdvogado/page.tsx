"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSearchParams } from 'next/navigation';
import SvgComponentClaro from "@/components/ui/logoClaro";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog,  DialogContent, DialogHeader, DialogTitle, DialogTrigger,} from "@/components/ui/dialog"
import { collection, query, where, getDocs, deleteDoc, getFirestore, doc, getDoc, addDoc, DocumentData } from "firebase/firestore";
import { SquareCheckBig } from 'lucide-react';
import { RotateCw } from 'lucide-react';
import { Layers3 } from 'lucide-react';
import { Archive } from 'lucide-react';
import { Trash2 } from 'lucide-react';
import { Send } from 'lucide-react';
import { app } from '../firebase/firebase';


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
    const [documentData, setDocumentData] = useState<DocumentData | null>(null);
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
    }
    

    // Função para recarregar a página
    const handleRefresh = () => {
        window.location.reload();
    };

    //Redireciona para a tela 
    const handleClick = () => {
      router.push(`/envioArquivo?uid=${uid}`);
    }

    const NavegadorHome = () => {
      router.push(`/`);
    }

    // Função para buscar os dados do documento no Firestore
    const fetchDocumentData = async (docId: string) => {
      try {
        const docRef = doc(db, 'Orcamento', docId);
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
    

    useEffect(() => {
        const fetchNome = async () => {
            setLoading(true); //Inicia o carregamento
            try {
                //Pega as informações do Advogado com base no ID da URL
                const q = query(collection(db, "Advogado"), where("uid", "==", uid)); //Pega os dados da coleção "Empresa" com base no ID
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
            <div className="flex flex-col bg-background text-foreground border-r">
                <header className="flex items-center p-4 ">
                    <>
                    {loading ? (
                      <div className="p-5"/>
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
                    <Button variant="ghost" className="justify-start gap-2 px-3 py-2 rounded-md hover:bg-muted" onClick={handleClick}>
                        <Send className="w-5 h-5" />
                        Solicitar um Orçamento
                    </Button>
                    <Button variant="ghost" className="justify-start gap-2 px-3 py-2 rounded-md hover:bg-muted">
                        <SquareCheckBig className="w-5 h-5" />
                        Trabalhos Concluídos
                    </Button>
                    <Button variant="ghost" className="justify-start gap-2 px-3 py-2 rounded-md hover:bg-muted">
                        <Layers3 className='h-5 w-5' />
                        Trabalhos em Processo
                    </Button>
                    <Button variant="ghost" className="justify-start gap-2 px-3 py-2 rounded-md hover:bg-muted">
                        <Archive className="w-5 h-5" />
                        Trabalhos Arquivados 
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
                        <AvatarFallback> {primeiraLetra} </AvatarFallback>
                    </Avatar>
                </header>


                {/* Aba Seus Envios */}
                <div className="grid md:grid-cols-[1fr_400px] gap-4 p-4 flex-1">
                    <div className=" rounded-md overflow-hidden flex-1">
                        <div className="border-b p-3 bg-background">
                            <div className="font-medium">Seus envios</div>
                            <div className="text-muted-foreground text-sm"> Trabalhos enviados: {orcamentos.length} </div>
                        </div>

                        <div className="divide-y">
                            {orcamentos.map((orcamento, index) => (
                                <div className="flex items-center gap-3 p-3 hover:bg-[#efefef]" key={index} onClick={() => fetchDocumentData(orcamento.id)}>
                                    <div className='h-3 w-3 rounded-full bg-[#e6df30]'/>
                                    <div className="flex items-center w-full p-3 hover:cursor-pointer ">
                                      <h1 className="cursor-pointer text-blue-500" >
                                          {orcamento.Titulo}
                                      </h1>
                                      <div className="ml-auto flex items-center space-x-6">
                                        <h1 className="text-muted-foreground text-sm">Status: {orcamento.Status}</h1>
                                        <Confirmation dd={orcamento} cpf={cpf} nome={nome} sobrenome={sobrenome} email={email} telefone={telefone}/>
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
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback>{primeiraLetra}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="font-medium"> {nome} {sobrenome} </div>
                                            <div className="text-muted-foreground text-sm"> {email} </div> 
                                        </div>
                                        {documentData ? (
                                          <div className="text-muted-foreground text-sm">{documentData.DataEnvio}</div>
                                        ) : (
                                          <h1></h1>
                                        )}
                                    </div>
                                    
                                    <div className="prose">
                                        {documentData ? (
                                            <>
                                                <p><br/> {documentData.Descricao}</p>
                                                <p className="text-muted-foreground text-sm"><br/> Prazo de Entrega: {documentData.DataEntrega}</p><br/>
                                                <a href={documentData.CaminhoArquivo} target="_blank" rel="noopener noreferrer">
                                                  <Button>Abrir PDF</Button>
                                                </a>
                                            </>
                                        ) : (
                                            <h1 className="text-muted-foreground text-sm"><br/>Clique no título do envio para ver mais detalhes</h1>
                                        )}
                                    </div>
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


interface ConfirmationProps {
  dd: DocumentData;
  cpf: string;
  nome: string;
  sobrenome: string;
  email: string;
  telefone: string;
}

// Função com uma Modal de confirmação para arquivar os orçamentos do Advogado
export function Confirmation({ dd, cpf, nome, sobrenome, email, telefone }: ConfirmationProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  //Botão para confirmar o arquivamento
  const btnArquivar = async() => {
    //Enviando para a coleção OrcamentosArquivadosADV
    const OrcamentosArquivadosADVCollectionRef = collection(db, "OrcamentosArquivadosADV");
    await addDoc(OrcamentosArquivadosADVCollectionRef, {
      cpf: cpf,
      Nome: nome,
      Sobrenome: sobrenome,
      Email: email,
      Telefone: telefone,
      Titulo: dd.Titulo,
      Descricao: dd.Descricao,
      DataEntrega: dd.DataEntrega,
      DataEnvio: dd.DataEnvio,
      CaminhoArquivo: dd.CaminhoArquivo,
      Status: "Arquivado"
    });

    //Excluindo o orçamento arquivado da coleção Orcamento
    const OrcamentosEnviadosDocRef = doc(db, "Orcamento", dd.id);
    await deleteDoc(OrcamentosEnviadosDocRef);
    setIsOpen(false);         //Fecha a Modal
    window.location.reload(); //Atualiza os orçamentos na tela
  } 

  //Botão para cancelar o arquivamento
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
            Arquivar Orçamento
          </DialogTitle>
        </DialogHeader>
        <div className='mt-6 text-center'>
          <p className='text-gray-500'>Tem certeza que deseja arquivar {dd.Titulo}?</p>
        </div>
        <div className='mt-6 flex flex-col sm:flex-row justify-center gap-4'>
          <Button variant="destructive" onClick={btnArquivar}>
            Arquivar
          </Button>
          <Button variant="outline" onClick={btnCancelar}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}