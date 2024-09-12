"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { collection, query, where, getDocs, getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from '../firebase/firebase'; 
import { Label } from "@/components/ui/label";

const db = getFirestore(app);


export default function telaEmpresa() {
    //Puxando o email do usuário pela URL
    const searchParams = useSearchParams();
    const email = searchParams.get('email');
    //Informações do usuário conectado
    const [nome, setNome] = useState('');
    const [sobrenome, setSobrenome] = useState('');
    const primeiraLetra = nome.slice(0, 2);
    //Informações dos Advogados que enviaram trabalhos
    const [nomeAdvogado, setNomeAdvogado] = useState('');
    const [sobrenomeAdvogado, setSobrenomeAdvogado] = useState('');
    const [emailAdvogado, setEmailAdvogado] = useState('');
    const primeiraLetraAdv = nomeAdvogado.slice(0, 2);
    //Pegando os orçamentos no BD
    const [orcamentos, setOrcamentos] = useState<DocumentData[]>([]);
    const [documentData, setDocumentData] = useState<DocumentData | null>(null);
    const [descricao, setDescricaoOrcamento] = useState('');
    //Extras
    const [loading, setLoading] = useState(true); 
    const router = useRouter();   


    interface DocumentData {
      DataEnvio: string;
      DataEntrega: string;
      Descricao: string;
      CaminhoArquivo: string;
      Status: string;
      cpfAdvogado: string;
      Titulo: string;
      id: string;
    }
    

    // Função para o botão de recarregar a página
    const handleRefresh = () => {
      window.location.reload();
    };

    //Redireciona para a tela 
    const handleClick = () => {
      // router.push(`/envioArquivo?email=${email}`);
    };

    //Função para buscar os dados do advogado com base no CPF
    const fetchAdvogado = async (cpf: string) => {
      try {
          const q = query(collection(db, "Advogado"), where("cpf", "==", cpf));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
              const advogadoData = querySnapshot.docs[0].data();
              setNomeAdvogado(advogadoData.nome);           //Define o nome do advogado
              setSobrenomeAdvogado(advogadoData.sobrenome); //Define o sobrenome do advogado
              setEmailAdvogado(advogadoData.email);         //Define o email do advogado
          } else {
              console.log("Erro ao buscar dados");
          }
      } catch (error) {
          console.error("Erro", error);
      }
    };

    //Função para buscar os dados do documento no Firestore
    const fetchDocumentData = async (docId: string) => {
      try {
        const docRef = doc(db, 'Orcamento', docId);
        const docSnapshot = await getDoc(docRef);
        if (docSnapshot.exists()) {
          const data = docSnapshot.data() as DocumentData;
          setDocumentData(data);
          fetchAdvogado(data.cpfAdvogado); //Aproveitando para mandar o cpf do advogado (que tbm está na coleção Orcamento) para a função fetchAdvogado
        } else {
          console.log('Documento não encontrado');
        }
      } catch (error) {
        console.error('Erro ao buscar documento:', error);
      }
    };
    

    useEffect(() => {
      const fetchNome = async () => {
          setLoading(true); // Inicia o estado de carregamento

          try {
              //Pega as informações do ADM com base no email da URL
              const q = query(collection(db, "Empresa"), where("email", "==", email)); //Pega os dados da coleção "Empresa" com base no email
              const querySnapshot = await getDocs(q); //Executa a consulta e retorna um snapshot contendo os documentos que correspondem à condição

              //Pega os arquivos no Banco de Dados caso querySnapshot não esteja vazio
              if (!querySnapshot.empty) {
                  console.log("Dados do Usuário:", querySnapshot.docs[0].data());
                  const empresaData = querySnapshot.docs[0].data();
                  const orcamentoQuery = query(collection(db, 'Orcamento'));  //Pega todos os documentos da coleção "Orcamento"
                  const orcamentoSnapshot = await getDocs(orcamentoQuery);
                  
                  const orcamentoList = orcamentoSnapshot.docs.map(doc => {
                    const data = doc.data() as DocumentData; //Realizando a tipagem de orcamentoList com DocumentData
                    return {
                      ...data,
                      id: doc.id,
                    };
                  });

                  setOrcamentos(orcamentoList);        //Finaliza a busca pelos arquivos
                  setSobrenome(empresaData.sobrenome); //Sobrenome do ADM
                  setNome(empresaData.nome);           //Nome do ADM
              } else {
                console.error("Advogado não encontrado!");
              }
          } catch (error) {
              console.error("Ocorreu um erro oa buscar o nome no banco de dados");
              setNome('Erro ao carregar nome'); //Transforma a variável "nome" na mensagem: "Erro ao carregar nome"
          } finally {
              setLoading(false); //Finaliza o estado de carregamento, independentemente da consulta ser um sucesso ou falhar
          }
      };

      if (email) {
          fetchNome(); //Chama a função fetchNome(), que está dentro do hook. Ela pega informações do Firebase
      }
  }, [email]); //Sempre que a variável 'email' mudar, o useEffect será executado, pois ela está listada nas dependências do hook


    return (
      <>
        <div className="grid md:grid-cols-[260px_1fr] min-h-screen w-full">
            <div className="flex flex-col bg-background text-foreground border-r">
                <header className="flex items-center p-6 border-b">
                    <>
                      {loading ? (
                          <br></br> // Para deixar em branco enquanto carrega o nome do user
                      ) : (
                          <h1>Bem-vindo, {nome}</h1> 
                      )}
                    </>
                </header>

                <nav className="flex flex-col gap-1 p-2">
                    {/* A parte de enviar orçamento fazer na aba "Detalhes do envio", que terá um campo onde o ADM enviará uma mensagem para o Advogado */}
                    {/* <Button variant="ghost" className="justify-start gap-2 px-3 py-2 rounded-md hover:bg-muted" onClick={handleClick}>
                        <SendIcon className="w-5 h-5" />
                        Enviar Orçamento
                    </Button> */} 
                    <Button variant="ghost" className="justify-start gap-2 px-3 py-2 rounded-md hover:bg-muted">
                        <UsersIcon className="w-5 h-5" />
                        Gerenciar Colaborador
                    </Button>
                    <Button variant="ghost" className="justify-start gap-2 px-3 py-2 rounded-md hover:bg-muted">
                        <ArchiveIcon className="w-5 h-5" />
                        Trabalhos em processo
                    </Button>
                    <Button variant="ghost" className="justify-start gap-2 px-3 py-2 rounded-md hover:bg-muted">
                        <ArchiveIcon className="w-5 h-5" />
                        Trabalhos Concluídos
                    </Button>
                    <Button variant="ghost" className="justify-start gap-2 px-3 py-2 rounded-md hover:bg-muted">
                        <ArchiveIcon className="w-5 h-5" />
                        Lixeira
                    </Button>
                </nav>
            </div>

            <div className="flex flex-col">
                <header className="flex items-center gap-2 p-4 border-b">
                    <div className="flex-1">
                        <Input type="search" placeholder="Pesquisar trabalhos" className="rounded-50  " />
                    </div>
                    <h1>Filtros(data de envio)</h1>
                    <Button variant="ghost" size="icon" onClick={handleRefresh}>
                        <RefreshCcwIcon className="w-5 h-5" />
                    </Button>
                    <Avatar className="h-9 w-9">
                        <AvatarFallback> {primeiraLetra} </AvatarFallback>
                    </Avatar>
                </header>


                {/* Aba Seus Trabalhos */}
                <div className="grid md:grid-cols-[1fr_400px] gap-4 p-4 flex-1">
                    <div className=" rounded-md overflow-hidden flex-1">
                        <div className="border-b p-3 bg-background">
                            <div className="font-medium">Seus trabalhos</div>
                            <div className="text-muted-foreground text-sm"> Trabalhos pendentes: {orcamentos.length} </div>
                        </div>

                        <div className="divide-y">
                            {orcamentos.map((orcamento, index) => (
                                <div className="flex items-center gap-3 p-3 hover:bg-[#efefef]" key={index} onClick={() => fetchDocumentData(orcamento.id)}>
                                    <div className='h-3 w-3 rounded-full bg-[#e6df30]'/>
                                    <div className="flex items-center justify-between w-full p-3 hover:cursor-pointer ">
                                      
                                        <h1 className="cursor-pointer text-blue-500" >
                                            {orcamento.Titulo}
                                        </h1>
                                        <h1 className="text-muted-foreground text-sm">Status: {orcamento.Status}</h1>
                                    </div>
                                </div>  
                            ))}
                        </div>
                    </div>


                    {/* // Aba Datalhes do Envio */}
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
                                            <AvatarFallback>{primeiraLetraAdv}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="font-medium"> {nomeAdvogado} {sobrenomeAdvogado} </div>
                                            <div className="text-muted-foreground text-sm"> {emailAdvogado} </div> 
                                        </div>
                                          <div className="text-muted-foreground text-sm">{documentData.DataEnvio}</div>
                                    </div>
                                    
                                    <div className="prose">
                                        <p><br/> {documentData.Descricao}</p>
                                        <p className="text-muted-foreground text-sm"><br/> Prazo de Entrega: {documentData.DataEntrega}</p><br/>
                                        
                                        <a href={documentData.CaminhoArquivo} target="_blank" rel="noopener noreferrer">
                                          <Button>Abrir PDF</Button>
                                        </a>

                                        <div className='mt-7'>

                                        <Label htmlFor="descricao">Escreva ao cliente</Label>
                                        <Input
                                            id="descricao"
                                            type="text"
                                            placeholder="Informe o orçamento ao cliente"
                                            value={descricao}
                                            onChange={(e) => setDescricaoOrcamento(e.target.value)}
                                            required
                                        />
                                        </div>

                                    </div>  
                                </>

                                ) : ( // Caso documentData esteja vazio, as informações do usuário logado são exibidas
                                  <>
                                  <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback>{primeiraLetraAdv}</AvatarFallback>
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
 

function ArchiveIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="5" x="2" y="3" rx="1" />
      <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
      <path d="M10 12h4" />
    </svg>
  )
}


function RefreshCcwIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  )
}


function SendIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  )
}


function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}