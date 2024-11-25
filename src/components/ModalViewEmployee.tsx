'use client'

import { UsersRound } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { app } from '../app/firebase/firebase';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { collection, query, where, getDocs, getFirestore, doc, getDoc } from "firebase/firestore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";

const db = getFirestore(app);

export default function ModalViewEmployee ({id}: {id: string}) {
  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [orcamento, setOrcamento] = useState<any>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [funcionariosLoaded, setFuncionariosLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const fetchOrcamento = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, "OrcamentosProcesso", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const docData = docSnap.data();
        setOrcamento(docData);
      } else {
        console.log("Documento não encontrado!");
      }
    } catch (error) {
      console.error("Erro ao buscar documento:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFuncionarios = async (cpfsFuncionarios: string) => {
    if (funcionariosLoaded) return; // Evita múltiplas chamadas desnecessárias
    console.log("Buscando funcionários...");

    try {
      const cpfsArray = cpfsFuncionarios.match(/([0-9]{3}\.[0-9]{3}\.[0-9]{3}-[0-9]{2})/g); // Extrai os CPFs da string
      if (cpfsArray) {
        const promises = cpfsArray.map(async (cpf) => {
          const trimmedCpf = cpf.trim();
          const q = query(collection(db, "Funcionarios"), where("cpf", "==", trimmedCpf));
          const querySnapshot = await getDocs(q);
          return querySnapshot.docs.map(doc => doc.data());
        });
        const results = await Promise.all(promises);
        const funcionariosEncontrados = results.flat();
        setFuncionarios(funcionariosEncontrados);
        setFuncionariosLoaded(true); // Marca os funcionários como carregados
      }
    } catch (error) {
      console.error("Erro ao buscar funcionários:", error);
    }
  };

  useEffect(() => {
    if (isOpen && id && !dataLoaded) {
      fetchOrcamento();
      setDataLoaded(true);
    }
  }, [id, dataLoaded]);

  useEffect(() => {
    if (orcamento && !funcionariosLoaded) {
      const cpfsFuncionarios = Array.isArray(orcamento.cpfsFuncionarios)
        ? orcamento.cpfsFuncionarios.join('')
        : orcamento.cpfsFuncionarios;
      fetchFuncionarios(cpfsFuncionarios);
    }
  }, [orcamento, funcionariosLoaded]);

  useEffect(() => {
    setDataLoaded(false);
    setFuncionariosLoaded(false); // Reseta a verificação de funcionários quando o ID muda
  }, [id]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="text-[12px] text-[#007259] hover:text-[#00AD87] font-semibold flex border-b border-[#007259] mb-2">
          <UsersRound className="h-4 w-4 mr-1"/>Visualizar Funcionários
        </button>
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
          <DialogTitle className="text-3xl font-bold text-[#2b3c56]">Funcionários Escalados</DialogTitle>
          <DialogDescription className="text-[#53647C] text-[12px] font-semibold">
            Veja os colaboradores que estão desenvolvendo seu trabalho
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[400px] w-full pr-4">
          <div className="grid grid-cols-1 gap-2 py-2">
            {funcionarios.map((funcionario) => (
              <Card key={funcionario.id} className="bg-[#fff] shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-start space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={funcionario.avatar} alt={funcionario.nome} />
                    <AvatarFallback className="bg-[#eaeaea] text-xl">
                      {funcionario.nome.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-[#2b3c56]">{funcionario.nome} {funcionario.sobrenome}</h3>
                    <Badge className="bg-[#e6f3f0] text-[#007259] hover:bg-[#e6f3f0] hover:text-[#007259]">
                      {funcionario.email}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
};