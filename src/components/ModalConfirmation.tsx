"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2 } from 'lucide-react';
import { collection, deleteDoc, doc, addDoc, getFirestore } from "firebase/firestore";
import { app } from '../app/firebase/firebase';

const db = getFirestore(app);

interface ConfirmationProps {
  dd: {
    id: string;
    cpfAdvogado: string;
    Nome: string;
    Sobrenome: string;
    Email: string;
    Telefone: string;
    Titulo: string;
    Descricao: string;
    DataEntrega: string;
    DataEnvio: string;
    CaminhoArquivo: string;
    Status: string;
  };
  source: string;
  titulo: string;
  descricao: string;
  nomeBtn: string;
}

const ConfirmarArquivamento: React.FC<ConfirmationProps> = ({ dd, source, titulo, descricao, nomeBtn }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Função para arquivar o orçamento
  const btnArquivar = async () => {

    if (source === 'arquivadosEmpresa') {
      //Excluindo o orçamento da coleção "OrcamentosArquivados"
      const OrcamentosDocRef = doc(db, "OrcamentosArquivados", dd.id);
      await deleteDoc(OrcamentosDocRef);
      setIsOpen(false);         //Fecha a Modal
      window.location.reload(); //Atualiza os orçamentos na tela


    } else if (source === 'advogado') {
      try {
        let statusParaArquivar = "Arquivado";
        if (dd.Status === "Arquivado pelo Escritório") {
          statusParaArquivar = "Arquivado pelo Escritório";
        }
        if (dd.Status === "Recusado") {
          statusParaArquivar = "Recusado pelo Escritório";
        }
  
        // Adicionando o documento à coleção de orçamentos arquivados
        const OrcamentosArquivadosADVCollectionRef = collection(db, "OrcamentosArquivados");
        await addDoc(OrcamentosArquivadosADVCollectionRef, {
          cpfAdvogado: dd.cpfAdvogado,
          cpfEmpresa: "null",
          Nome: dd.Nome,
          Sobrenome: dd.Sobrenome,
          Email: dd.Email,
          Telefone: dd.Telefone,
          Titulo: dd.Titulo,
          Descricao: dd.Descricao,
          DataEntrega: dd.DataEntrega,
          DataEnvio: dd.DataEnvio,
          CaminhoArquivo: dd.CaminhoArquivo,
          Status: statusParaArquivar,
        });
  
        // Excluindo o documento original da coleção "Orcamento"
        const OrcamentosEnviadosDocRef = doc(db, "Orcamento", dd.id);
        await deleteDoc(OrcamentosEnviadosDocRef);
  
        setIsOpen(false);         // Fecha a Modal
        window.location.reload(); // Atualiza a página
      } catch (error) {
        console.error("Erro ao arquivar o documento:", error);
      }
    }
  };

  // Função para cancelar o arquivamento
  const btnCancelar = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <Button variant="ghost" size="icon">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {titulo}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-6 text-center">
          <p className="text-gray-500">
            {descricao} "{dd.Titulo}"?
          </p>
        </div>
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
          <Button variant="destructive" onClick={btnArquivar}>
            {nomeBtn}
          </Button>
          <Button variant="outline" onClick={btnCancelar}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmarArquivamento;
