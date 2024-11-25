"use client";

import { useState } from 'react';
import { Tag } from 'lucide-react';
import { File } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TriangleAlert } from 'lucide-react';
import { app } from '../app/firebase/firebase';
import { Button } from "@/components/ui/button";
import PdfViewer from '@/components/ui/PdfViewer';
import { storage } from "../app/firebase/firebase";
import { Textarea } from "@/components/ui/textarea";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Dialog,  DialogContent, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { updateDoc, doc, collection, addDoc, getDocs, query, getFirestore } from "firebase/firestore";

const db = getFirestore(app);

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
  respostaAdv: string;
  valor: string;
  feedbackOrcamento: string;
  Orcamento: string
  DataRecusado: string;
  descricaoFuncionario: string;
}
interface Property {
  documentData: DocumentData;
  nomeBotao: string;
  cpf: string;
  id: string;
  source: string;
}

export function VisualizadorPDF({ documentData, cpf, id, nomeBotao, source }: Property) {
  const [feedbackOrcamento, setFeedbackOrcamento] = useState('');
  const [valorOrcamento, setValorOrcamento] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [arquivo, setArquivo] = useState<File | null>(null);

  const btnRecusar = async () => {
    // Obter a data atual
    const dataAtual = new Date();
    const dia = String(dataAtual.getDate()).padStart(2, "0");
    const mes = String(dataAtual.getMonth() + 1).padStart(2, "0");
    const ano = dataAtual.getFullYear();
    const dataBr = `${dia}/${mes}/${ano}`; // Formato DD/MM/YYYY

    try {
      if (feedbackOrcamento.length === 0) {
        alert("Coloque uma descrição para o cliente.");
        return;
      }

      // Busca a coleção 'Orcamento'
      const orcamentoQuery = query(collection(db, 'Orcamento'));
      const querySnapshot = await getDocs(orcamentoQuery);

      // Encontre o documento que deseja atualizar
      let docId = null;
      querySnapshot.forEach((docSnapshot) => {
        if (docSnapshot.id === id) {
          docId = docSnapshot.id;
        }
      });

      if (docId) {
        const docRef = doc(db, 'Orcamento', docId);
        await updateDoc(docRef, {
          status: 'Recusado',
          valor: 'R$ 0,00',
          feedbackOrcamento: feedbackOrcamento,
          DataRecusado: dataBr,
        });

        // Move o orçamento para a coleção de Arquivados
        const OrcamentosArquivadosCollectionRef = collection(db, "OrcamentosArquivados");
        await addDoc(OrcamentosArquivadosCollectionRef, {
          cpfAdvogado: documentData.cpfAdvogado,
          cpfEmpresa: cpf,
          Nome: documentData.Nome,
          Sobrenome: documentData.Sobrenome,
          Email: documentData.Email,  
          Telefone: documentData.Telefone,
          Titulo: documentData.Titulo,
          Descricao: documentData.Descricao,
          DataEntrega: documentData.DataEntrega,
          DataEnvio: documentData.DataEnvio,
          CaminhoArquivo: documentData.CaminhoArquivo,
          Status: "Recusado",
          valor: 'R$ 0,00',
          feedbackOrcamento: feedbackOrcamento,
          DataRecusado: dataBr,
        });

        // Atualizando o Status do orçamento para o Advogado
        await updateDoc(doc(db, "Orcamento", docId), {
          Status: "Recusado"
        });

        setIsOpen(false);         // Fecha a modal
        window.location.reload(); // Atualiza os orçamentos na tela
      } else {
        console.error("Documento não encontrado para o ID:", id);
      }
    } catch (error) {
      console.log("Erro ao verificar o preenchimento dos campos", error);
    }
  };  



  // Função para lidar com a seleção do arquivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setArquivo(file);
    } else {
        alert("Nenhum arquivo foi selecionado")
    }
  };

  //Lógica para o botao de Aprovar Orçamento
  const btnAprovar = async () => {
    try {
      if (!feedbackOrcamento || !valorOrcamento || !arquivo ) {
        alert("Preencha todos os campos e anexe um arquivo para prosseguir");
        return;
      };

      //Gerando uma URL para o arquivo que foi salvo no storage do Firebase
      const storageRef = ref(storage, `Documentos/${arquivo.name}`);
      await uploadBytes(storageRef, arquivo);
      const downloadURL = await getDownloadURL(storageRef);
        
    
      //O valor, feedback e downloadURL estão sendo adicionados em todos os documentos 
      const orcamentoQuery = query(collection(db, 'Orcamento')); // Busca a coleção 'Orcamento'
      const querySnapshot = await getDocs(orcamentoQuery);
  
      querySnapshot.forEach(async (docSnapshot) => {
        const docRef = doc(db, 'Orcamento', id);
        await updateDoc(docRef, {
          Status: 'Resposta Recebida',
          valor: valorOrcamento,
          feedbackOrcamento: feedbackOrcamento,
          Orcamento: downloadURL,
        });
        setIsOpen(false);
        window.location.reload(); //Atualiza os orçamentos na tela
      });
    } catch (error) {
      console.error('Erro ao aprovar o orçamento:', error);
    }
  };

  const btnFechar = () => {
    setIsOpen(false); //Fecha a modal
  };


  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
  
    // Remove todos os caracteres que não sejam números
    inputValue = inputValue.replace(/\D/g, '');
  
    // Se o campo estiver vazio após a remoção, atualiza o estado para string vazia
    if (inputValue === '') {
      setValorOrcamento(''); // Atualiza o estado para vazio
      return;
    }
  
    // Formata como moeda (R$ 0,00)
    const formattedValue = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(parseInt(inputValue, 10) / 100); // Divide por 100 para considerar centavos
  
    setValorOrcamento(formattedValue); // Atualiza o estado com o valor formatado
  };
  
  

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <div className="absolute bottom-[20%]">
          <DialogTrigger asChild>
            {(documentData.Status === 'Aguardando Resposta') ? (
               <Button className="bg-[#007259] text-[#fff] hover:bg-[#005c47]"><File className='w-5 h-5 mr-2'/>Visualizar e Aprovar Documento</Button>
              ) : (
                <Button className="bg-[#007259] text-[#fff] hover:bg-[#005c47]"><File className='w-5 h-5 mr-2'/>Visualizar Documento</Button>
              ) 
            }
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
                    documentData.Status === "Revisar"
                      ? "text-[#844690] bg-[#E5BBF7]"
                    :
                    documentData.Status === "Arquivado" || documentData.Status === "Recusado" || documentData.Status === "Recusado pelo Escritório"
                      ? " text-[#BB3636] bg-[#F9B5B5]"
                    : "text-[#438d5f] bg-[#bbf7d0]"
                    }`}
                  >
                    <div className='flex'>
                      <Tag className='w-4 h-4 mr-1' /> 
                      {documentData.Status === "Resposta Recebida" && source === "empresa"
                        ? "Resposta Enviada"
                        : documentData.Status === 'Aguardando Resposta' && source === "empresa"
                          ? "Doc Recebido"
                          : documentData.Status === 'Aprovado' && source === "EmAndamentoAdm"
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
                  {(documentData.Status === "Resposta Recebida" || documentData.Status === 'Concluído' || documentData.Status === 'Revisar' || documentData.Status === 'Aguardando Pagamento' || (documentData.Status === 'Aprovado' && source === 'empresa')) && (
                    <>
                      <p className='font-bold text-[20px] text-[#2B3C56] mt-32'>Orçamento Recebido</p>
                      <div className='flex mt-4'>
                        <a
                          href={documentData.Orcamento} //modificar
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
              {((documentData.Status === 'Aprovado' && source === 'empresa') || documentData.Status === 'Concluído') && (
                <>
                  <div className='pr-6 w-[55%]'>
                    <div>
                      <p className="font-bold text-[20px] text-[#2B3C56]">Resposta do Cliente</p>
                      <div className='mt-4 max-h-[260px] overflow-y-auto text-[16px] text-justify pr-4'>{documentData.respostaAdv}</div> 
                    </div>
                    <div className='absolute bottom-[8%] right-12'>
                      <Button className="w-[400px] bg-[#007259] text-[#fff] hover:bg-[#005c47]" onClick={btnFechar}>Fechar</Button>
                    </div>
                  </div>
                </>
              )}
              {(documentData.Status === 'Aprovado' && source == 'EmAndamentoAdm') && (
                <>
                  <div className='pr-6 w-[55%]'>
                    <div>
                      <p className="font-bold text-[20px] text-[#2B3C56]">Descrição Enviada ao Funcionário</p>
                      <div className='mt-4 max-h-[260px] overflow-y-auto text-[16px] text-justify pr-4'>{documentData.descricaoFuncionario}</div> 
                    </div>
                    <div className='absolute bottom-[8%] right-12'>
                      <Button className="w-[400px] bg-[#007259] text-[#fff] hover:bg-[#005c47]" onClick={btnFechar}>Fechar</Button>
                    </div>
                  </div>
                </>
              )}
              {(documentData.Status === 'Recusado') && (
                <>
                <div className='pr-6 w-[55%]'>
                  <div>
                    <p className="font-bold text-[20px] text-[#2B3C56]">Sua Resposta ao Documento</p>
                    <div className='mt-4 max-h-[260px] overflow-y-auto text-[16px] text-justify pr-4'>{documentData.feedbackOrcamento}</div> 
                  </div>
                  <div className='absolute bottom-[8%] right-12'>
                    <Button className="w-[400px] bg-[#007259] text-[#fff] hover:bg-[#005c47]" onClick={btnFechar}>Fechar</Button>
                  </div>
                </div>
              </>
              )}
              {(documentData.Status === "Resposta Recebida") && (
                <>
                  <div className='pr-6'>
                    <div className='text-[#A2845A] bg-[#FFF4E5] p-4 rounded-md text-[16px] font-semibold flex'>
                      <TriangleAlert className='w-6 h-6 mr-4'/><span>Aguarde a resposta do cliente para proseguir o trabalho</span>
                    </div>
                    <div className='absolute bottom-[8%] right-12'>
                      <Button className="w-[400px] bg-[#007259] text-[#fff] hover:bg-[#005c47]" onClick={btnFechar}>Fechar</Button>
                    </div>
                  </div>
                </>
              )}
              {documentData.Status === "Aguardando Resposta" && (
                <>
                  <div className='pr-6 w-[55%] h-1/2'>
                    <div className='h-1/2'>
                      <p className='font-bold text-[20px] text-[#2B3C56] mt-1 mb-3'>Análise do Trabalho</p>
                      <Textarea
                        id="feedbackOrcamento"
                        placeholder="Insira uma descrição"
                        className="flex-grow h-[110px] mb-4 mt-3 resize-none"
                        onChange={(e) => setFeedbackOrcamento(e.target.value)}
                        value={feedbackOrcamento}
                        required
                      />
                    </div>
                    <div className='flex'>
                      <div className="grid gap-4 mb-4 mr-8">
                        <Label className="font-bold text-[20px] text-[#2B3C56]">Valor</Label>
                        <Input
                          id="valorOrcamento"
                          type="text"
                          placeholder="R$0,00"
                          // onChange={(e) => handleValorChange(e.target.value)}
                          onChange={handleValorChange}
                          value={valorOrcamento}
                        />
                      </div>
                      <div className="grid gap-4 mb-4">
                        <Label className="font-bold text-[20px] text-[#2B3C56]">Anexar Orçamento</Label>
                        <Input
                            id="arquivo"
                            type="file"
                            accept=".pdf"
                            onChange={(e) => {
                              handleFileChange(e);
                              const selectedFile = e.target.files ? e.target.files[0] : null;
                              setArquivo(selectedFile);
                            }}
                            className="text-[#2B3C56] text-[12px]"
                            required
                        />
                      </div>
                    </div>
                    <div className='flex absolute bottom-[8%] right-12 w-[31%] gap-4'>
                      <Button className="w-full bg-[#930000] text-[#fff] hover:bg-[#6A0000]" onClick={btnRecusar} disabled={!feedbackOrcamento}>Recusar</Button>
                      <Button className="w-full bg-[#007259] text-[#fff] hover:bg-[#005c47]" onClick={btnAprovar} disabled={!feedbackOrcamento || !valorOrcamento || !arquivo }>Aprovar</Button>
                    </div>
                  </div>
                </>
              )}
            </div>
        </DialogContent> 
      </Dialog>
    </>
  );
}