"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { collection, query, where, getDocs, getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from '../firebase/firebase'; 


const db = getFirestore(app);


export default function TelaAdvogado() {
    const searchParams = useSearchParams();
    const email = searchParams.get('email');
    const [nome, setNome] = useState('');
    const [cpf, setCpf] = useState('');
    const [sobrenome, setSobrenome] = useState('');
    const [loading, setLoading] = useState(true); 
    const [orcamentos, setOrcamentos] = useState<any[]>([]);
    const primeiraLetra = nome.slice(0, 2);
    const [documentData, setDocumentData] = useState<DocumentData | null>(null);

    //Definição das variáveis que armaazenam as informações no BD
    interface DocumentData {
      DataEnvio: string;
      DataEntrega: string;
      Descricao: string;
      CaminhoArquivo: string;
      Status: string;
    }
    

    // Função para recarregar a página
    const handleRefresh = () => {
        window.location.reload();
    };
    // // Formata as datas para o padrão BR
    // const formatDateToBR = (date: string) => {
    //     const localDate = new Date(date);
    //     // Ajusta a data para o fuso horário local
    //     const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        
    //     // Retorna a data formatada no padrão BR
    //     return new Intl.DateTimeFormat('pt-BR', options).format(localDate);
    // };


    // Função para buscar os dados do documento no Firestore
    const fetchDocumentData = async (docId: string) => {
      try {
        const docRef = doc(db, 'Orcamento', docId);
        const docSnapshot = await getDoc(docRef);
        if (docSnapshot.exists()) {
          const data = docSnapshot.data() as DocumentData; // Afirmação de tipo
          setDocumentData(data); // Agora o TypeScript não dará erro aqui
        } else {
          console.log('Documento não encontrado');
        }
      } catch (error) {
        console.error('Erro ao buscar documento:', error);
      }
    };
    

    useEffect(() => {
        const fetchNome = async () => {
            setLoading(true); // Inicia o carregamento
            try {
                console.log("Buscando o nome do advogado para o email:", email);
                const q = query(collection(db, "Advogado"), where("email", "==", email));
                const querySnapshot = await getDocs(q);
                
                //Pega algumas informações do BD
                if (!querySnapshot.empty) {
                    console.log("Documento encontrado:", querySnapshot.docs[0].data());
                    const advogadoData = querySnapshot.docs[0].data();
                    setNome(advogadoData.nome);
                    setCpf(advogadoData.cpf);
                    setSobrenome(advogadoData.sobrenome);
                    
                    // Após buscar o CPF, busca os orçamentos do advogado
                    const orcamentoQuery = query(collection(db, 'Orcamento'), where('cpfAdvogado', '==', advogadoData.cpf));
                    const orcamentoSnapshot = await getDocs(orcamentoQuery);
                    const orcamentoList = orcamentoSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                        Status: doc.data().Status
                    }));
                    setOrcamentos(orcamentoList);

                } else {
                    console.error("Advogado não encontrado!");
                    setNome('Advogado não encontrado'); 
                }
            } catch (error) {
                console.error("Erro ao buscar o nome do advogado:", error);
                setNome('Erro ao carregar nome');
            } finally {
                setLoading(false); 
            }
        };

        if (email) {
            fetchNome();
        }
    }, [email]);


    return (
        <div className="grid md:grid-cols-[260px_1fr] min-h-screen w-full">
            <div className="flex flex-col bg-background text-foreground border-r">
                <header className="flex items-center p-6 border-b">
                    <>
                    {loading ? ( // Verifica se está carregando
                        <h1>Carregando...</h1>
                    ) : (
                        <h1>Bem-vindo, {nome} </h1> 
                    )}
                    </>
                </header>
                <nav className="flex flex-col gap-1 p-2">

                    <Button variant="ghost" className="justify-start gap-2 px-3 py-2 rounded-md hover:bg-muted">
                        <SendIcon className="w-5 h-5" />
                        <Link href={`/envioArquivo?email=${email}`}>
                        Faça um orçamento
                        </Link>
                    </Button>
                    
                    <Button variant="ghost" className="justify-start gap-2 px-3 py-2 rounded-md hover:bg-muted">
                        <UsersIcon className="w-5 h-5" />
                        Entre em contato
                    </Button>
                    
                    <Button variant="ghost" className="justify-start gap-2 px-3 py-2 rounded-md hover:bg-muted">
                        <ArchiveIcon className="w-5 h-5" />
                        Trabalhos Concluídos
                    </Button>

                </nav>
            </div>
            <div className="flex flex-col">
                <header className="flex items-center gap-2 p-4 border-b">

                    <div className="flex-1">
                        <Input type="search" placeholder="Pesquisar trabalhos" className="rounded-50  " />
                    </div>

                    <Button variant="ghost" size="icon" onClick={handleRefresh}>
                        <RefreshCcwIcon className="w-5 h-5" />
                    </Button>

                    <Avatar className="h-9 w-9">
                        <AvatarFallback> {primeiraLetra} </AvatarFallback>
                    </Avatar>

                </header>

                <div className="grid md:grid-cols-[1fr_400px] gap-4 p-4 flex-1">
                    <div className="bg-muted rounded-md overflow-hidden flex-1">
                        <div className="border-b p-3 bg-background">
                            <div className="font-medium">Seus envios</div>
                            <div className="text-muted-foreground text-sm"> Trabalhos enviados: {orcamentos.length} </div>
                        </div>

                        {/* Aba Seus Envios */}
                        <div className="divide-y">
                            {orcamentos.map((orcamento, index) => (
                                <div className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer" key={index}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-4">
                                      <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                    </svg>

                                    <div className="flex items-center justify-between w-full p-3">
                                        <h1 className="cursor-pointer text-blue-500" onClick={() => fetchDocumentData(orcamento.id)}>
                                            {orcamento.Titulo}
                                        </h1>
                                        <h1 className="text-muted-foreground text-sm">Status: {orcamento.Status}</h1>
                                    </div>
                                </div>  
                            ))}
                        </div>
                    </div>

                    <div className="bg-muted rounded-md overflow-hidden flex-1">
                        <div className="border-b p-3 bg-background">
                            <div className="font-medium pb-5">Detalhes do envio</div>
                        </div>


                          {/* Aba Datalhes do Envio */}
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
                                          {/* <p className="text-muted-foreground text-sm">Data de Envio: {formatDateToBR(documentData.DataEnvio)}</p> */}
                                          <p><br/> {documentData.Descricao}</p>
                                          <a href={documentData.CaminhoArquivo} target="_blank" rel="noopener noreferrer">
                                            <p className="text-muted-foreground text-sm"><br/> Prazo de Entrega: {documentData.DataEntrega}</p><br/>
                                            <Button>Abrir PDF</Button>
                                          </a>
                                          
                                      </>
                                  ) : (
                                      <h1 className="text-muted-foreground text-sm"><br/>Clique no título do envio para ver mais detalhes</h1>
                                  )}
                              </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
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