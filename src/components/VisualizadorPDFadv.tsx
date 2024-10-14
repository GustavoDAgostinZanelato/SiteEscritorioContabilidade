import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog,  DialogContent, DialogHeader, DialogTrigger} from "@/components/ui/dialog";
import { updateDoc, doc, collection, addDoc, getDocs, query, getFirestore, deleteDoc} from "firebase/firestore";
import { app } from '../app/firebase/firebase';

const db = getFirestore(app);

//Sistema de modal para o usuário vizualizar o documento PDF
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
    id: string;
    valor: string;
    feedbackOrcamento: string;
  }
  interface Property {
    documentData: DocumentData;
    id: string;
  }
  
  export function VisualizadorPDFadv({ documentData, id }: Property) {
    const [respostaAdv, setRespostaAdv] = useState('');
    const [isOpen, setIsOpen] = useState(false)
  
    const btnRecusar = async() => {
      try {
        if(respostaAdv.length === 0) {
          alert("Preencha o campo de resposta para proseguir")
          return
        }
          const OrcamentosDocRef = doc(db, "Orcamento", id);
          await deleteDoc(OrcamentosDocRef);
          // Adicionando o documento à coleção de orçamentos arquivados
          const OrcamentosArquivadosADVCollectionRef = collection(db, "OrcamentosArquivados");
          await addDoc(OrcamentosArquivadosADVCollectionRef, {
            cpfAdvogado: documentData.cpfAdvogado,
            cpfEmpresa: "null",
            Nome: documentData.Nome,
            Sobrenome: documentData.Sobrenome,
            Email: documentData.Email,
            Telefone: documentData.Telefone,
            Titulo: documentData.Titulo,
            Descricao: documentData.Descricao,
            DataEntrega: documentData.DataEntrega,
            DataEnvio: documentData.DataEnvio,
            CaminhoArquivo: documentData.CaminhoArquivo,
            Status: "Arquivado",
          });
          // Move o orçamento para a coleção de Arquivados
          const OrcamentosArquivadosCollectionRef = collection(db, "OrcamentosArquivados");
          await addDoc(OrcamentosArquivadosCollectionRef, {
            cpfAdvogado: documentData.cpfAdvogado,
            cpfEmpresa: "562.596.482-48",
            Nome: documentData.Nome,
            Sobrenome: documentData.Sobrenome,
            Email: documentData.Email,  
            Telefone: documentData.Telefone,
            Titulo: documentData.Titulo,
            Descricao: documentData.Descricao,
            DataEntrega: documentData.DataEntrega,
            DataEnvio: documentData.DataEnvio,
            CaminhoArquivo: documentData.CaminhoArquivo,
            Status: "Recusado pelo Cliente",
          });
          setIsOpen(false);
          window.location.reload();
      
      } catch(error) {
        console.error('Erro ao atualizar o documento:', error);
      }
    };
  
    const btnAceitar = async() => {
      try {
        if(respostaAdv.length === 0) {
          alert("Preencha o campo de resposta para proseguir");
          return
        }
        const orcamentoQuery = query(collection(db, 'Orcamento'));
        const querySnapshot = await getDocs(orcamentoQuery);
        querySnapshot.forEach(async (docSnapshot) => {
          const docRef = doc(db, 'Orcamento', id);
          await updateDoc(docRef, {
            Status: 'Aprovado',
            respostaAdv: respostaAdv,
          });
          setIsOpen(false);
          window.location.reload();
        });
      } catch (error) {
          console.error('Erro ao atualizar o documento:', error);
      }
    };
  
    const btnFechar = () => {
      setIsOpen(false); //Fecha a modal
    }
  
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>Visualizar Documento</Button>
            </DialogTrigger>

            <DialogContent className="max-w-[90vw] w-[1500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                        <AvatarFallback>{documentData.Nome ? documentData.Nome.slice(0, 2) : ''}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="font-medium"> {documentData.Nome} {documentData.Sobrenome} </div>
                        <div className="text-muted-foreground text-sm"> {documentData.Email}</div> 
                    </div>
                    </div>
                    <div className="prose">
                        <p className='font-bold'><br/> {documentData.Titulo}</p>
                        <p className='mt-5'>{documentData.Descricao}</p>
                        <p className="text-muted-foreground text-sm"><br/> Solicitado dia {documentData.DataEnvio}, com prazo de entrega em {documentData.DataEntrega}. </p>
                    </div> 
                </DialogHeader>
                <div className="flex gap-4 h-[70vh]">
                <iframe
                    src={`${documentData.CaminhoArquivo}#toolbar=0`}
                    className="w-1/2 h-full border rounded"
                />
                <div className="w-1/2 flex flex-col">
                    {/* Texto e botão Fechar são exibidos apenas quando o status NÃO é "Aguardando resposta do cliente" ou "Recusado" ou "Aprovado" */}
                    {(documentData.Status !== "Aguardando resposta do cliente" && documentData.Status !== "Recusado" && documentData.Status !== "Aprovado") && (
                    <>
                      <p className='font-bold mb-10'>
                        Após a verificação do escritório, visualize aqui o valor e a análise do orçamento solicitado.
                      </p>
                      <div className='flex'>
                        <div className='border p-2 rounded-md mb-2 flex'>
                          <div className='text-muted-foreground text-sm'>Status: {documentData.Status}</div>
                        </div>
                      </div>
                      <div className='mt-10'>
                        <Button className="w-full" onClick={btnFechar}>Fechar</Button>
                      </div>
                    </>
                    )}  

                    {/* Exibir os botões Aceitar e Recusar apenas se o status for "Aguardando resposta do cliente" */}
                    {(documentData.Status == "Aguardando resposta do cliente") && (
                    <div className="flex flex-col gap-4 h-full">
                        <div className='space-y-1 mb-2'>
                            <p className='font-bold mb-3'>Resposta do Escritório</p>
                            <div className='w-full text-muted-foreground text-sm'>{documentData.feedbackOrcamento}</div> 
                        </div>
                        <div className='flex mb-1'>
                          <div className='border p-2 rounded-md mb-2 mr-3'>
                            <div className='text-muted-foreground text-sm w-full'>
                              Valor: {documentData.valor} reais
                            </div>
                          </div>
                          <div className='border p-2 rounded-md mb-2'>
                            <div className='text-muted-foreground text-sm w-full'>
                              Status: {documentData.Status}
                            </div>
                          </div>
                        </div>
                      
                        <p className='font-bold'>Envie uma Resposta</p>
                        <Textarea
                          id="respostaAdv"
                          placeholder="Finalize o orçamento dando a sua resposta ao escritório"
                          className="flex-grow resize-none"
                          onChange={(e) => setRespostaAdv(e.target.value)}
                          value={respostaAdv}
                          required
                        />

                        <div className="flex gap-2 mt-2">
                            <Button className="w-full" variant="destructive" onClick={btnRecusar}>Recusar</Button>
                            <Button className="w-full" variant="default" onClick={btnAceitar}>Aceitar</Button>
                        </div>
                    </div>
                    )}

                    {/* Exibir os botões Aceitar e Recusar apenas se o status for "Recusado" */}
                    {(documentData.Status == "Recusado" || documentData.Status == "Aprovado") && (
                    <div className="flex flex-col gap-4 h-full">
                        <div className='space-y-1 mb-2'>
                            <p className='font-bold mb-1'>Resposta do Escritório</p>
                            <div className='w-full text-muted-foreground text-sm'>{documentData.feedbackOrcamento}</div> 
                        </div>
                        <div className='flex mt-2'>
                          <div className='border p-2 rounded-md mb-2 mr-3'>
                            <div className='text-muted-foreground text-sm'>
                              Status: {documentData.Status}
                            </div>
                          </div>
                          <>
                            {documentData.Status == "Aprovado" && (
                              <div className='border p-2 rounded-md mb-2'>
                                <div className='text-muted-foreground text-sm'>
                                  Valor: {documentData.valor} reais
                                </div>
                              </div>
                            )} 
                          </>
                        </div>
                        <div className='mt-5'>
                          <Button className="w-full" onClick={btnFechar}>Fechar</Button>
                        </div>
                    </div>
                    )}
                </div>      
                </div>
            </DialogContent> 
        </Dialog>
    )
}