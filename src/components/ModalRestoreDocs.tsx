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
      //Mensagens de Alerta
      if (dd.Status === "Arquivado pelo Escritório") {
        alert("Seu trabalho não pode ser restaurado pois foi arquivado pelo escritório")
        setIsOpen(false);
        return;
      }
      if (dd.Status === "Recusado pelo Escritório") {
        alert("Seu trabalho não pode ser restaurado pois foi arquivado pelo escritório")
        setIsOpen(false);
        return;
      }
      if (dd.Status === "Recusado pelo Cliente") {
        alert("Seu trabalho não pode ser restaurado pois foi arquivado pelo cliente")
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
        
        // Caso 3 - Para o advogado restaurar o documento que ele mesmo arquivou
        const queryOrcamentoSnapshot = await getDocs(qOrcamento);
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
            Status: "Aguardando Resposta",
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
                    Status: "Aguardando Resposta"
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
          Status: "Aguardando Resposta",
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
    <>
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <Button variant="ghost" size="icon">
          <RotateCw className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      {isOpen && (
        <div 
        className="fixed bg-[#000] bg-opacity-20 backdrop-blur-sm transition-opacity z-[50]" 
        style={{
          width: '100%',
          height: '100%', 
          top: 0,
          left: -24
        }}
      />
      )}

      <DialogContent className="sm:max-w-[425px] bg-[#F0F4F8]">
        <DialogHeader>
          <DialogTitle className="font-bold text-[28px] text-[#2B3C56] text-center">Restaurar Orçamento</DialogTitle>
        </DialogHeader>
        <div className="mt-6 text-center">
          <p className="text-gray-500">Deseja restaurar "<span className="font-semibold">{dd.Titulo}</span>"?</p>
        </div>
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
          <Button variant='outline' className="text-[#2b3c56] border-[#2b3c56]" onClick={btnCancelar}>
            Cancelar
          </Button>
          <Button className="bg-[#007259] text-[#fff] hover:bg-[#005c47]" onClick={btnRestaurar}>
            Restaurar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default ConfirmationRestoreDoc;