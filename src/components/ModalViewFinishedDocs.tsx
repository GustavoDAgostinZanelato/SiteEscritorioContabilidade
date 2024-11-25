'use client';

import { File } from 'lucide-react';
import { UsersRound } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { app } from '../app/firebase/firebase';
import { Button } from "@/components/ui/button";
import { storage } from "../app/firebase/firebase";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { collection, query, where, getDocs, getFirestore, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
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
    cfpsFuncionarios: string[];
    downloadURL: string;
  };
}
 
const ModalViewEmployee: React.FC<ConfirmationProps> = ({ dd }) => {
  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [parecer, setParecer] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const documentoAnexado = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setArquivo(file);
    };
  };

  const fetchTrabalhoConcluido = async () => {
    try {
      const docRef = doc(db, 'TrabalhosConcluidos', dd.id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.Parecer) {
          setParecer(data.Parecer);
        }
      } else {
        console.log("Documento não encontrado");
      }
    } catch (error) {
      console.error("Erro ao buscar o documento:", error);
    }
  };

  const fetchFuncionarios = async (dadosArray: string[]) => {
    try {
      const funcionariosQuery = query(
        collection(db, 'Funcionarios'),
        where('uid', 'in', dadosArray)
      );
      const querySnapshot = await getDocs(funcionariosQuery);

      const funcionariosData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFuncionarios(funcionariosData);
    } catch (error) {
      console.error("Erro ao buscar funcionários:", error);
    }
  };

  // UseEffect que depende de isOpen para buscar dados apenas ao abrir a modal
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        await fetchTrabalhoConcluido();
      };
      fetchData();
    }
  }, [isOpen]);

  // UseEffect que depende de parecer para buscar funcionários quando parecer é atualizado
  useEffect(() => {
    if (parecer.length > 0) {
      const uidArray = parecer.map(item => item.uid);
      fetchFuncionarios(uidArray);
    }
  }, [parecer]);



  //Botão Cancelar
  const btnCancelar = () => {
    setIsOpen(false);
  };

  //Botão Enviar Cliente
  const btnEnviaCliente = async () => {

    if (!arquivo) {
      alert("Por favor, selecione um arquivo");
      return;
    };

    // Gerando uma URL para o arquivo que foi salvo no storage do Firebase
    const storageRef = ref(storage, `Documentos/${arquivo.name}`);
    await uploadBytes(storageRef, arquivo);
    const downloadURL = await getDownloadURL(storageRef);

    
    try {
      const docRef = doc(db, "TrabalhosConcluidos", dd.id);
      await updateDoc(docRef, {
        TrabalhoFinalizado: downloadURL,
        Indice: "Pronto pra o cliente",
        Status: "Aguardando Pagamento"
      });

      // Localiza o documento correspondente na coleção "OrcamentosProcesso"
      const orcamentoProcessoRef = collection(db, "OrcamentosProcesso");
      const querySnapshot = await getDocs(
        query(orcamentoProcessoRef, where("Titulo", "==", dd.Titulo), where("Descricao", "==", dd.Descricao))
      );

      // Exclui o documento encontrado
      querySnapshot.forEach(async (doc) => {
        const orcamentoDocRef = doc.ref;
        await deleteDoc(orcamentoDocRef);
      });

    } catch (error) {
      console.error("Erro ao atualizar o documento:", error);
    }
    setIsOpen(false);
    window.location.reload();
  };


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {(dd.Status != 'Aguardando Pagamento' && dd.Status != 'Concluído') && (
          <button className="text-[12px] text-[#007259] hover:text-[#00AD87] font-semibold flex border-b border-[#007259] mb-2">
            <UsersRound className="h-4 w-4 mr-1"/>Enviar ao Cliente 
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
        <DialogHeader className="border-b border-[#d0d5dd] pb-5">
          <DialogTitle className="text-3xl font-bold text-[#2b3c56]"> {dd.Titulo} </DialogTitle>
          <DialogDescription className="text-[#53647C] text-[12px] font-semibold">
            Visualize o trabalho feito pelos funcionários
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[350px] w-full pr-4">
          <div className="grid grid-cols-1 gap-2 py-2">
            {funcionarios.map((funcionario) => {
              const parecerFuncionario = parecer.find((p) => p.uid === funcionario.uid);
              return (
                <Card key={funcionario.id} className="bg-[#fff] shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4 mb-3">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={funcionario.avatar} alt={funcionario.nome} />
                        <AvatarFallback className="bg-[#eaeaea] text-xl">
                          {funcionario.nome.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold text-[#2b3c56]">
                          {funcionario.nome} {funcionario.sobrenome}
                        </h3>
                        <Badge className="bg-[#e6f3f0] text-[#007259] hover:bg-[#e6f3f0] hover:text-[#007259]">
                          {funcionario.email}
                        </Badge>
                      </div>
                    </div> 
                    <div>
                      <p className="text-[#4a5b75] text-sm">
                        {parecerFuncionario?.descricao || "Descrição não disponível"}
                      </p>
                      <div className="max-w-[105px]">
                        {parecerFuncionario?.downloadURL && (
                          <a
                            href={parecerFuncionario.downloadURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#007259] text-sm flex items-center mt-3"
                          >
                            <File size={15}/>
                            <span>Abrir Arquivo</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
        <div className="space-y-2">
          <Label className="text-[#2B3C56] text-[12px] font-bold">Anexar Parecer Finalizado</Label>
          <Input
              id="arquivo"
              type="file"
              accept=".pdf"
              onChange={documentoAnexado}
          />
        </div>
        <div className='flex justify-end space-x-2'>
          <Button variant='outline' className="text-[#2b3c56] border-[#2b3c56]" onClick={btnCancelar}>Cancelar</Button>
          <Button className="bg-[#007259] text-[#fff] hover:bg-[#005c47]" onClick={btnEnviaCliente}>Enviar ao Cliente</Button>
        </div>
      </DialogContent> 
    </Dialog>
  );
};

//olhar no console o pq de estar monstrando tanto info

export default ModalViewEmployee;
