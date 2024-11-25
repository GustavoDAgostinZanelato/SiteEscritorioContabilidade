import { useState } from 'react';
import { Tag } from 'lucide-react';
import { File } from 'lucide-react';
import { app } from '../app/firebase/firebase';
import { Button } from "@/components/ui/button";
import PdfViewer from '@/components/ui/PdfViewer';
import { Dialog,  DialogContent, DialogHeader, DialogTrigger} from "@/components/ui/dialog";
import { getFirestore} from "firebase/firestore";

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
    descricaoFuncionario: string;
    TrabalhoFinalizado: string;
  }
  interface Property {
    documentData: DocumentData;
    source: string;
  }
  
  export function VisualizadorPDFFcn({ documentData, source }: Property) {
    const [isOpen, setIsOpen] = useState(false);
      
    const btnFechar = () => {
      setIsOpen(false); //Fecha a modal
    }

    return(
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <div className="absolute bottom-[20%]">
                <DialogTrigger asChild>
                    <Button className="bg-[#007259] text-[#fff] hover:bg-[#005c47]"><File className='w-5 h-5 mr-2'/> Visualizar Documento Anexado</Button>    
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
                                documentData.Status === "Arquivado" || documentData.Status === "Recusado" || documentData.Status === "Recusado pelo Escritório"
                                    ? " text-[#BB3636] bg-[#F9B5B5]"
                                : "text-[#438d5f] bg-[#bbf7d0]"
                                }`}
                            >
                                <div className='flex'>
                                    <Tag className='w-4 h-4 mr-1' />{documentData.Status}
                                </div> 
                            </div>
                            
                        </div>
                    </div>
                    <div className="flex space-x-2 pt-4">
                        <p className="px-2 py-1 rounded-md text-[12px] font-semibold text-[#469061] bg-[#E6F3F0]">Prazo de entrega: {documentData.DataEntrega} </p>
                    </div> 
                </DialogHeader>

                {/* Exibindo o preview do documento e sua descrição */}
                <div className="flex gap-4 h-[50vw] mt-8">
                    {source === 'funcionario' ? (
                        <PdfViewer pdfPath={documentData.CaminhoArquivo} width={250} />
                    ) : (
                        <PdfViewer pdfPath={documentData.TrabalhoFinalizado} width={250} />
                    )}
                    
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
                    </div>     
                    
                    {/* Verificações para os itens que aparecem no lado direito da tela */}
                    {(source === 'funcionario') ? (
                        <>
                            <div className='pr-6 w-[55%] h-1/2'>
                            <div className='h-1/2'>
                                <p className="font-bold text-[20px] text-[#2B3C56]">O que precisa ser feito</p>
                                <div className='mt-4 max-h-[101px] overflow-y-auto text-[16px] text-justify pr-4'>{documentData.descricaoFuncionario}</div> 
                            </div>
                            <div className='absolute bottom-[8%] right-12'>
                                <Button className="w-[400px] bg-[#007259] text-[#fff] hover:bg-[#005c47]" onClick={btnFechar}>Fechar</Button>
                            </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className='pr-6 w-[55%] h-1/2'>
                            <div className='h-1/2'>
                                <p className="font-bold text-[20px] text-[#2B3C56]">O q</p>
                                <div className='mt-4 max-h-[101px] overflow-y-auto text-[16px] text-justify pr-4'>{documentData.descricaoFuncionario}</div> 
                            </div>
                            <div className='absolute bottom-[8%] right-12'>
                                <Button className="w-[400px] bg-[#007259] text-[#fff] hover:bg-[#005c47]" onClick={btnFechar}>Fechar</Button>
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