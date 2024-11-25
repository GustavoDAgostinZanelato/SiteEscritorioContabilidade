"use client";

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { CalendarDays } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CircleCheckBig } from 'lucide-react';
import { app } from '../app/firebase/firebase';
import { Button } from "@/components/ui/button";
import { useSearchParams } from 'next/navigation';
import { storage } from "../app/firebase/firebase";
import { Textarea } from "@/components/ui/textarea";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, doc, addDoc, getFirestore, getDocs, query, where, updateDoc, arrayUnion, deleteDoc } from "firebase/firestore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";

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
    dataFuncionario: string;
    cpfsFuncionarios: string[];
    valor: string;
    respostaAdv: string;
  };
}

const ConfirmarArquivamento = ({ dd }: ConfirmationProps) => {
  //Puxando o ID do Funcionario da URL
  const searchParams = useSearchParams();
  const uid = searchParams.get('uid');
  const [descricao, setDescricao] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [cpfFuncionario, setCpfFuncionario] = useState('')

  const documentoAnexado = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setArquivo(file);
    };
  };

  useEffect(() => {
    const fetchCpf = async () => {
      try {
        // Pega o CPF do Funcionário com base no ID da URL
        const q = query(collection(db, "Funcionarios"), where("uid", "==", uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const funcionarioData = querySnapshot.docs[0].data();
          setCpfFuncionario(funcionarioData.cpf);
        } else {
          console.error("Nenhum funcionário encontrado");
        }
      } catch {
        console.error("Erro ao buscar CPF do funcionário:");
      }
    };
    fetchCpf();
  });
  
  //Botão Cancelar
  const btnCancelar = async () => {
    setIsOpen(false);
  };

  //Botão Concluir
  const btnConcluir = async () => {
    if (!arquivo) {
      console.error("Nenhum arquivo selecionado.");
      return;
    };

    //Obter a data atual
    const dataAtual = new Date();
    const dia = String(dataAtual.getDate()).padStart(2, "0");
    const mes = String(dataAtual.getMonth() + 1).padStart(2, "0");
    const ano = dataAtual.getFullYear();

    const dataBr = `${dia}/${mes}/${ano}`; // Formato DD/MM/YYYY

    //Gerando uma URL para o arquivo que foi salvo no storage do Firebase
    const storageRef = ref(storage, `Documentos/${arquivo.name}`);
    await uploadBytes(storageRef, arquivo);
    const downloadURL = await getDownloadURL(storageRef);

    try {
      //Verificando se já existe um documento com o mesmo Titulo e Descricao
      const orcamentoRef = collection(db, "TrabalhosConcluidos");
      const querySnapshot = await getDocs(
        query(orcamentoRef, where("Titulo", "==", dd.Titulo), where("Descricao", "==", dd.Descricao))
      );

      const novoParecer = { uid, downloadURL, descricao }; //Novo documento a ser adicionada em CaminhoParecer
      const novaDescricao = { uid, descricao }; //Nova descricao a ser adicionada em DescriçãoFuncionario

      if (!querySnapshot.empty) {
        const documentId = querySnapshot.docs[0].id;
        const docRef = doc(db, "TrabalhosConcluidos", documentId);
        await updateDoc(docRef, {
          Parecer: arrayUnion(novoParecer), //Adicionando o novo objeto
          DescriçãoFuncionario: arrayUnion(novaDescricao),
          FuncionariosConcluiram: arrayUnion(cpfFuncionario),
        });

      //Atualiza o documento correspondente em `OrcamentosProcesso` com o `uid`
      const orcamentoProcessoRef = collection(db, "OrcamentosProcesso");
      const orcamentoProcessoSnapshot = await getDocs(
          query(orcamentoProcessoRef, where("Titulo", "==", dd.Titulo), where("Descricao", "==", dd.Descricao))
      );

      orcamentoProcessoSnapshot.forEach(async (doc) => {
          const orcamentoDocRef = doc.ref;
          // await deleteDoc(orcamentoDocRef);
          await updateDoc(orcamentoDocRef, {
            FuncionariosConcluiram: arrayUnion(cpfFuncionario),
          });
      });

      setIsOpen(false);
      window.location.reload();
      return;
    }
    
    await addDoc(orcamentoRef, {
      Parecer: [{uid, downloadURL, descricao}],
      DataEnvio: dd.DataEnvio,
      DataEntrega: dd.DataEntrega,
      Descricao: dd.Descricao,
      Email: dd.Email,
      Nome: dd.Nome,
      Sobrenome: dd.Sobrenome,
      Titulo: dd.Titulo,
      cpfAdvogado: dd.cpfAdvogado,
      Status: "Revisar",
      DataConclusao: dataBr,
      cpfsFuncionarios: dd.cpfsFuncionarios,
      FuncionariosConcluiram: [cpfFuncionario],
      valor: dd.valor,
      CaminhoArquivo: dd.CaminhoArquivo,
      respostaAdv: dd.respostaAdv,
    });

    const orcamentoProcessoRef = collection(db, "OrcamentosProcesso");
    const orcamentoProcessoSnapshot = await getDocs(
        query(orcamentoProcessoRef, where("Titulo", "==", dd.Titulo), where("Descricao", "==", dd.Descricao))
    );

    orcamentoProcessoSnapshot.forEach(async (doc) => {
      const orcamentoDocRef = doc.ref;
      await updateDoc(orcamentoDocRef, {
          FuncionariosConcluiram: arrayUnion(cpfFuncionario),
      });
    });

    setIsOpen(false);
    window.location.reload();

    } catch (error) {
      console.error("Erro ao concluir o trabalho: ", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        {(dd.Status != 'Revisar' && dd.Status != 'Aguardando Pagamento' && dd.Status != 'Concluído') && (
          <button className="text-[12px] text-[#007259] hover:text-[#00AD87] font-semibold flex border-b border-[#007259] mb-2">
            <CircleCheckBig className='h-4 w-4 mr-1' /> Concluir Trabalho
          </button>
        )}
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

      <DialogContent className="sm:max-w-[600px] bg-[#f0f4f8]">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-[#2b3c56]">
            Concluir Trabalho
          </DialogTitle>
          <DialogDescription className="text-[#4a5b75] pb-4">
            O documento será enviado para revisão e estará disponível na aba "Concluídos"
          </DialogDescription>
        </DialogHeader>

        <div className="bg-[#fff] p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold text-[#2b3c56] mb-2">{dd.Titulo}</h3>
            <div className="flex justify-start text-sm text-[#4a5b75]">
              <div className="flex items-center">
                <Badge className="mt-1 mr-4 bg-[#e6f3f0] text-[#007259] hover:bg-[#e6f3f0] hover:text-[#007259]">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  <span>Recebimento: {dd.dataFuncionario}</span>
                </Badge>
              </div>
              <div className="flex items-center">
                <Badge className="mt-1 bg-[#e6f3f0] text-[#007259] hover:bg-[#e6f3f0] hover:text-[#007259]">
                  <Clock className="mr-2 h-4 w-4" />
                  <span>Prazo Entrega: {dd.DataEntrega}</span>
                </Badge>
              </div>
            </div>
          </div>

        <div className='space-y-2 mt-4'>
          <Label className="text-sm font-medium text-[#2b3c56] mb-5 ml-1">
              Descrição do Trabalho
          </Label>
          <Textarea 
            value={descricao}
            placeholder='Insira uma descrição'
            className="flex-grow resize-none h-20 w-full border- border-[#d0d5dd]"
            onChange={(e) => setDescricao(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-[#2b3c56] mb-5 ml-1">Anexar Parecer</Label>

          <Input
              id="arquivo"
              type="file"
              accept=".pdf"
              onChange={documentoAnexado}
          />

        </div>
        <div className="mt-8 flex justify-end space-x-2">
          <Button variant="outline" className="text-[#2b3c56] border-[#2b3c56]" onClick={btnCancelar}>
            Cancelar
          </Button>
          <Button className="bg-[#007259] text-[#fff] hover:bg-[#005c47]" disabled={descricao.length === 0 || !arquivo} onClick={btnConcluir}>
            Concluir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmarArquivamento;