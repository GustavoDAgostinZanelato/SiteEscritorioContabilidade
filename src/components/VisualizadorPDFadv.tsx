import { useState } from 'react';
import { Tag } from 'lucide-react';
import { File } from 'lucide-react';
import { TriangleAlert } from 'lucide-react';
import { app } from '../app/firebase/firebase';
import { Button } from "@/components/ui/button";
import PdfViewer from '@/components/ui/PdfViewer';
import { Textarea } from "@/components/ui/textarea";
import { Dialog,  DialogContent, DialogHeader, DialogTrigger} from "@/components/ui/dialog";
import { updateDoc, doc, collection, addDoc, getDocs, query, getFirestore, deleteDoc} from "firebase/firestore";

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
    DataRecusado: string;
    respostaAdv: string;  
    Orcamento: string;
    TrabalhoFinalizado: string;
  }
  interface Property {
    documentData: DocumentData;
    id: string;
    source: string;
  }
  
  export function VisualizadorPDFadv({ documentData, id, source }: Property) {
    const [respostaAdv, setRespostaAdv] = useState('');
    const [isOpen, setIsOpen] = useState(false)
  
    const btnRecusar = async() => {
      try {
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
            cpfEmpresa: "562.596.482-48", //Arrumar essa gambiarra
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
      <>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <div className="absolute bottom-[20%]">
            <DialogTrigger asChild>
              {documentData.Status === 'Recusado' || documentData.Status === 'Arquivado' || documentData.Status === 'Recusado pelo Escritório' ? (
                <Button className="bg-[#007259] text-[#fff] hover:bg-[#005c47]"><File className='w-5 h-5 mr-2'/> Visualizar Trabalho</Button>
              ) : documentData.Status === 'Concluído' || documentData.Status === 'Aguardando Pagamento' ? (
                <Button className="bg-[#007259] text-[#fff] hover:bg-[#005c47]"><File className='w-5 h-5 mr-2'/> Visualizar Parecer</Button>
              ) : documentData.Status === 'Aprovado' && source === 'AndamentoAdv' ? (
                <Button className="bg-[#007259] text-[#fff] hover:bg-[#005c47]"><File className='w-5 h-5 mr-2'/> Visualizar Trabalho</Button>
              ) : (
                <Button className="bg-[#007259] text-[#fff] hover:bg-[#005c47]"><File className='w-5 h-5 mr-2'/> Visualizar Desenvolvimento do Trabalho</Button>
              )}
                
            </DialogTrigger>
          </div>

          {isOpen && (
            <div 
            className="fixed bg-[#000] bg-opacity-20 backdrop-blur-sm transition-opacity z-[50]" 
            style={{
              width: '102%',
              height: '100%', 
              top: 0,
              left: -24
            }}
          />
          )}

          <DialogContent className="max-w-[90vw] w-[1300px] max-h-[90vh] bg-[#F0F4F8] pl-12 pt-9">
              <DialogHeader>
                  <div className="flex items-center gap-4">
                      <div className="font-bold text-[#2B3C56] text-[28px] max-w-[80%]"> 
                        {documentData.Titulo} 
                      </div>
                      <div className="gap-5 justify-end">
                        <div className={`absolute top-11 right-12 px-2 py-1 rounded-md text-[12px] font-semibold ${
                          documentData.Status === "Resposta Recebida"
                            ? " text-[#3657BB] bg-[#B5D1F9]" 
                          : 
                          documentData.Status === "Aguardando Resposta"
                            ? " text-[#908946] bg-[#F6F7BB]"
                          :
                          documentData.Status === "Concluído"
                            ? " text-[#006972] bg-[#BBF7F6]"
                          :
                          documentData.Status === "Aguardando Pagamento"
                            ? "text-[#BB6B36] bg-[#F9D7B5]"
                          :
                          documentData.Status === "Arquivado" || documentData.Status === "Recusado" || documentData.Status === "Recusado pelo Escritório"
                            ? " text-[#BB3636] bg-[#F9B5B5]"
                          : "text-[#438d5f] bg-[#bbf7d0]"
                          }`}
                        >
                          <div className='flex'>
                            <Tag className='w-4 h-4 mr-1' /> 
                            {documentData.Status === "Aguardando Resposta" && source === "advogado"
                              ? "Aguardando Aprovação"
                              : documentData.Status === "Aprovado" && source === "AndamentoAdv"
                                ? "Em Andamento"
                                : documentData.Status
                            }   
                          </div> 
                        </div>
                      </div>
                  </div>
                  {(documentData.Status === "Recusado") ? (
                    <div className="flex space-x-2 pt-4">
                      <p className="px-2 py-1 rounded-md text-[12px] font-semibold text-[#469061] bg-[#E6F3F0]">Data Recusado: {documentData.DataRecusado} </p>
                    </div> 
                  ) : (
                    <div className="flex space-x-2 pt-4">
                      <p className="px-2 py-1 rounded-md text-[12px] font-semibold text-[#469061] bg-[#E6F3F0]">Prazo de entrega: {documentData.DataEntrega} </p>
                    </div> 
                  )}
              </DialogHeader>

              {/* Exibindo o preview do documento e sua descrição */}
              <div className="flex gap-4 h-[50vw] mt-8">
                <PdfViewer pdfPath={documentData.CaminhoArquivo} width={250} />
                <div className="w-1/3 flex flex-col">
                  <p className='font-bold text-[20px] text-[#2B3C56]'>Documento Anexado</p>
                  <div className='flex mt-4'>
                    <a
                      href={documentData.CaminhoArquivo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[16px] underline text-[#007259] hover:text-[#00AD87]"
                    >
                      Abrir no navegador
                    </a>
                  </div>
                  
                  {(documentData.Status === "Aprovado" || documentData.Status === "Resposta Recebida") && (
                    <>
                      <p className='font-bold text-[20px] text-[#2B3C56] mt-32'>Orçamento Recebido</p>
                      <div className='flex mt-4'>
                        <a
                          href={documentData.Orcamento}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[16px] underline text-[#007259] hover:text-[#00AD87]"
                        >
                          Abrir Orçamento
                        </a>
                      </div>
                      <div className="flex space-x-2 pt-4">
                        <div className="px-2 py-1 rounded-md text-[12px] font-semibold text-[#469061] bg-[#E6F3F0]">
                          Valor: {documentData.valor}
                        </div>
                      </div>
                    </>
                  )}
                </div>     

              {/* Verificações para os itens que aparecem no lado direito da tela */}
              {(documentData.Status === 'Aprovado' || documentData.Status === 'Em Andamento') && (
                  <>
                    <div className='pr-6 w-[55%] h-1/2'>
                      <div className='h-1/2'>
                        <p className="font-bold text-[20px] text-[#2B3C56]">Resposta da Empresa</p>
                        <div className='mt-4 max-h-[101px] overflow-y-auto text-[16px] text-justify pr-4'>{documentData.feedbackOrcamento}</div> 
                      </div>
                      <div className='h-1/2 mt-1'>
                        <p className="font-bold text-[20px] text-[#2B3C56]">Sua Resposta</p>
                        <div className='mt-4 h-[101px] overflow-y-auto text-[16px] text-justify pr-4'>{documentData.respostaAdv}</div> 
                      </div>
                      <div className='absolute bottom-[8%] right-12'>
                        <Button className="w-[400px] bg-[#007259] text-[#fff] hover:bg-[#005c47]" onClick={btnFechar}>Fechar</Button>
                      </div>
                    </div>
                  </>
                )}  
                {documentData.Status === 'Arquivado' && (
                  <>
                    <div className='pr-6 w-[55%]'>
                      <div className='absolute bottom-[8%] right-12'>
                        <Button className="w-[400px] bg-[#007259] text-[#fff] hover:bg-[#005c47]" onClick={btnFechar}>Fechar</Button>
                      </div>
                    </div>
                  </>
                )}  
                {(documentData.Status === 'Recusado' || documentData.Status === 'Recusado pelo Escritório') && (
                  <>
                    <div className='pr-6 w-[55%]'>
                      <div>
                        <p className="font-bold text-[20px] text-[#2B3C56]">Resposta da Empresa</p>
                        <div className='mt-4 max-h-[260px] overflow-y-auto text-[16px] text-justify pr-4'>{documentData.feedbackOrcamento}</div> 
                      </div>
                      <div className='absolute bottom-[8%] right-12'>
                        <Button className="w-[400px] bg-[#007259] text-[#fff] hover:bg-[#005c47]" onClick={btnFechar}>Fechar</Button>
                      </div>
                    </div>
                  </>
                )}
                {(documentData.Status === "Aguardando Resposta") && (
                  <>
                    <div className='pr-6'>
                      <div className='text-[#A2845A] bg-[#FFF4E5] p-4 rounded-md text-[16px] font-semibold flex'>
                        <TriangleAlert className='w-6 h-6 mr-4'/><span>Aguarde a aprovação do documento e visualize aqui o orçame- to proposto</span>
                      </div>
                      <div className='absolute bottom-[8%] right-12'>
                        <Button className="w-[400px] bg-[#007259] text-[#fff] hover:bg-[#005c47]" onClick={btnFechar}>Fechar</Button>
                      </div>
                    </div>
                  </>
                )}
                {(documentData.Status === 'Concluído' || documentData.Status === 'Aguardando Pagamento') && (
                  <>
                    <PdfViewer pdfPath={documentData.TrabalhoFinalizado} width={250} />
                    <div className=" flex flex-col w-[400px]">
                      <p className='font-bold text-[20px] text-[#2B3C56]'>Parecer Recebido</p>
                      <div className='flex mt-4'>
                        <a
                          href={documentData.TrabalhoFinalizado}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[16px] underline text-[#007259] hover:text-[#00AD87]"
                        >
                          Abrir Parecer
                        </a>
                      </div>
                    </div>
                    <div className='absolute bottom-[8%] right-12'>
                      <Button className="w-[400px] bg-[#007259] text-[#fff] hover:bg-[#005c47]" onClick={btnFechar}>Fechar</Button>
                    </div>
                  </>
                )}  
                {(documentData.Status === 'Resposta Recebida') && (
                  <>
                    <div className='pr-6 w-[55%] h-1/2'>
                      <div className='h-1/2'>
                        <p className="font-bold text-[20px] text-[#2B3C56]">Resposta da Empresa</p>
                        <div className='mt-4 max-h-[101px] overflow-y-auto text-[16px] text-justify pr-4'>{documentData.feedbackOrcamento}</div> 
                      </div>
                      <p className='font-bold text-[20px] text-[#2B3C56] mt-1 mb-3'>Envie uma Resposta</p>
                      <Textarea
                        id="respostaAdv"
                        placeholder="Envie um feedback do orçamento para a empresa"
                        className="flex-grow resize-none"
                        onChange={(e) => setRespostaAdv(e.target.value)}
                        value={respostaAdv}
                        required
                      />
                      <div className='flex absolute bottom-[8%] right-12 w-[31%] gap-4'>
                          <Button className="w-full bg-[#930000] text-[#fff] hover:bg-[#6A0000]" onClick={btnRecusar} disabled={!respostaAdv}>Recusar</Button>
                          <Button className="w-full bg-[#007259] text-[#fff] hover:bg-[#005c47]" onClick={btnAceitar} disabled={!respostaAdv}>Aceitar</Button>
                      </div>
                    </div>
                  </>
                )} 
            </div>
          </DialogContent> 
        </Dialog>
        </>
    )
}