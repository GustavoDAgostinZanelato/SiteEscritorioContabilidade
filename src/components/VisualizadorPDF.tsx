"use client";

import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { app } from '../app/firebase/firebase';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
}
interface Property {
  documentData: DocumentData;
  nomeBotao: string;
  cpf: string;
  id: string;
}

export function VisualizadorPDF({ documentData, cpf, id, nomeBotao }: Property) {
  const [feedbackOrcamento, setFeedbackOrcamento] = useState('');
  const [valorOrcamento, setValorOrcamento] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const btnRecusar = async () => {
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

  //Lógica para o botao de Aprovar Orçamento
  const btnAprovar = async () => {
    try {
      if (feedbackOrcamento.length === 0 || valorOrcamento.length === 0) {
        alert("Preencha todos os campos para prosseguir.");
        return;
      }
      
      //O valor e feedback estão sendo adicionados em todos os documentos 
      const orcamentoQuery = query(collection(db, 'Orcamento')); // Busca a coleção 'Orcamento'
      const querySnapshot = await getDocs(orcamentoQuery);
  
      querySnapshot.forEach(async (docSnapshot) => {
        const docRef = doc(db, 'Orcamento', id);
        await updateDoc(docRef, {
          Status: 'Aguardando resposta do cliente',
          valor: valorOrcamento,
          feedbackOrcamento: feedbackOrcamento,
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>{nomeBotao}</Button>
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

          {documentData.Status === "Recusado" || documentData.Status === "Arquivado" || documentData.Status === "Recusado pelo Escritório" ? (
            <>
              <iframe
                src={`${documentData.CaminhoArquivo}#toolbar=0`}
                className="w-[85%] h-full mx-auto"
              />
            </>
          ) : (
            <>
              <iframe
                src={`${documentData.CaminhoArquivo}#toolbar=0`}
                className="w-1/2 h-full border rounded"
              />
              <div className="w-1/2 flex flex-col">
                {(documentData.Status === "Aprovado") ? (
                  <div className="flex flex-col gap-4 h-full">
                    <div className='space-y-1 mb-2'>
                        <p className='font-bold mb-1'>Resposta do Cliente</p>
                        <div className='w-full text-muted-foreground text-sm'>{documentData.respostaAdv}</div> 
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
                ) : (
                  <>
                    <Label htmlFor="register-mensagem">Analise do Orçamento Solicitado</Label>
                    <Textarea
                      id="feedbackOrcamento"
                      placeholder="Encaminhe uma resposta ao cliente sobre o arquivo enviado"
                      className="flex-grow resize-none mb-4 mt-3"
                      onChange={(e) => setFeedbackOrcamento(e.target.value)}
                      value={feedbackOrcamento}
                      required
                    />
                    <div className="grid gap-4 mb-4">
                      <Label htmlFor="register-value">Valor do Orçamento</Label>
                      <Input
                        id="register-value"
                        type="text"
                        placeholder="R$ 0,00"
                        onChange={(e) => setValorOrcamento(e.target.value)}
                        value={valorOrcamento}
                      />
                      <p className="text-muted-foreground text-sm">
                        O valor do orçamento será preenchido automaticamente como zero caso o trabalho seja recusado.
                      </p>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="destructive" className="w-full" onClick={btnRecusar}>
                        Recusar
                      </Button>
                      <Button variant="default" className="w-full" onClick={btnAprovar}>
                        Aprovar
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </>
           )}
        </div>
      </DialogContent> 
    </Dialog>
  );
}