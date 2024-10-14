"use client";

import { useState } from 'react';
import { RotateCw } from 'lucide-react';
import { app } from '../app/firebase/firebase';
import { Button } from "@/components/ui/button";
import { Dialog,  DialogContent, DialogHeader, DialogTitle, DialogTrigger,} from "@/components/ui/dialog";
import { collection, deleteDoc, getFirestore, addDoc, DocumentData, query, getDocs, where, updateDoc } from "firebase/firestore";

const db = getFirestore(app);

interface ConfirmationRestoreDocProps {
  dd: DocumentData;
  cpf: string;
  nome: string;
  sobrenome: string;
  email: string;
  telefone: string;
  descricao: string;
}

const ConfirmationRestoreDoc: React.FC<ConfirmationRestoreDocProps> = ({ dd, cpf, nome, sobrenome, email, telefone }) => {
  const [isOpen, setIsOpen] = useState(false);

  const btnRestaurar = async () => {
    try {
      if (dd.Status === "Arquivado pelo Escritório") {
        alert("Seu trabalho não pode ser restaurado pois foi arquivado pelo escritório.");
        setIsOpen(false);
        return;
      }
      if (dd.Status === "Recusado pelo Escritório") {
        alert("Seu trabalho não pode ser restaurado pois foi recusado pelo escritório.");
        setIsOpen(false);
        return;
      }
      if (dd.Status === "Recusado pelo Cliente") {
        alert("Seu trabalho não pode ser restaurado pois foi recusado pelo cliente.");
        setIsOpen(false);
        return;
      }

      const OrcamentosArquivadosRef = collection(db, "OrcamentosArquivados");
      const q = query(OrcamentosArquivadosRef, where("Titulo", "==", dd.Titulo), where("Descricao", "==", dd.Descricao));
      const querySnapshot = await getDocs(q);

      //Caso 2 - trabalho recusado pelo escritório mas NÃO arquivado pelo advogado
      if (querySnapshot.size  < 2) {
        const OrcamentosRef = collection(db, "Orcamento");
        const qOrcamento = query(OrcamentosRef, 
          where("Titulo", "==", dd.Titulo), 
          where("Descricao", "==", dd.Descricao), 
          where("Status", "==", "Recusado")
        );
        
        const queryOrcamentoSnapshot = await getDocs(qOrcamento);

        // Caso 3 - Para o advogado restaurar o documento que ele mesmo arquivou
        if (queryOrcamentoSnapshot.empty) {
          const OrcamentoRef = collection(db, "Orcamento");
          await addDoc(OrcamentoRef, {
            cpfAdvogado: cpf,
            Nome: nome,
            Sobrenome: sobrenome,
            Email: email,
            Telefone: telefone,
            Titulo: dd.Titulo,
            Descricao: dd.Descricao,
            DataEntrega: dd.DataEntrega,
            DataEnvio: dd.DataEnvio,
            CaminhoArquivo: dd.CaminhoArquivo,
            Status: "Aguardando Aprovação",
          });
          querySnapshot.forEach(async (docSnapshot) => {
            await deleteDoc(docSnapshot.ref);
          });
          setIsOpen(false);
          window.location.reload();
          return;
        }

        // Criar um array de promessas para as atualizações
        const updatePromises: Promise<void>[] = [];
        if (!queryOrcamentoSnapshot.empty) {
            queryOrcamentoSnapshot.forEach((docSnapshot) => {
                // Adiciona a promessa de atualização ao array
                updatePromises.push(updateDoc(docSnapshot.ref, {
                    Status: "Aguardando Aprovação"
                }));
            });
        }

        // Criar um array de promessas para as exclusões
        const deletePromises = querySnapshot.docs.map((docSnapshot) => deleteDoc(docSnapshot.ref));

        // Espera todas as atualizações e exclusões serem concluídas
        await Promise.all([...updatePromises, ...deletePromises]);

        //Após as promessas concluidas, fecha a modal e atualiza a página
        setIsOpen(false);
        window.location.reload();
      }

      //Caso 1 - trabalho recusado pelo escritório e arquivado pelo advogado
      else {
        const OrcamentoRef = collection(db, "Orcamento");
        await addDoc(OrcamentoRef, {
          cpfAdvogado: cpf,
          Nome: nome,
          Sobrenome: sobrenome,
          Email: email,
          Telefone: telefone,
          Titulo: dd.Titulo,
          Descricao: dd.Descricao,
          DataEntrega: dd.DataEntrega,
          DataEnvio: dd.DataEnvio,
          CaminhoArquivo: dd.CaminhoArquivo,
          Status: "Aguardando Aprovação",
        });

        // Deleta todos os documentos encontrados com o mesmo Titulo e Descricao
        querySnapshot.forEach(async (docSnapshot) => {
          await deleteDoc(docSnapshot.ref);
        });
        setIsOpen(false);
        window.location.reload();
      }
    } catch (error) {
      console.log("Ação inesperada", error);
    }
  };
  
  const btnCancelar = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <Button variant="ghost" size="icon">
          <RotateCw className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Restaurar Orçamento</DialogTitle>
        </DialogHeader>
        <div className="mt-6 text-center">
          <p className="text-gray-500">Deseja restaurar "{dd.Titulo}"?</p>
        </div>
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
          <Button variant="default" onClick={btnRestaurar}>
            Restaurar
          </Button>
          <Button variant="outline" onClick={btnCancelar}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationRestoreDoc;