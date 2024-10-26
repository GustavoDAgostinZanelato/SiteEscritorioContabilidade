'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { app } from '../app/firebase/firebase';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { collection, query, where, getDocs, getFirestore, doc, getDoc } from "firebase/firestore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const db = getFirestore(app);

export default function ModalChangeEnployee ({id}: {id: string}) {
  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [orcamento, setOrcamento] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const fetchOrcamento = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, "OrcamentosProcesso", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const docData = docSnap.data();
        setOrcamento(docData);
        await fetchFuncionarios(docData.cpfsFuncionarios);
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
  try {
    const cpfsArray = cpfsFuncionarios.match(/([0-9]{3}\.[0-9]{3}\.[0-9]{3}-[0-9]{2})/g); // Extrai os CPFs da string
    if (cpfsArray) {
      const promises = cpfsArray.map(async (cpf) => {
        const trimmedCpf = cpf.trim(); // Remove espaços em branco
        const q = query(collection(db, "Funcionarios"), where("cpf", "==", trimmedCpf));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data()); // Retorna os dados dos funcionários encontrados
      });
      const results = await Promise.all(promises);
      const funcionariosEncontrados = results.flat();
      setFuncionarios(funcionariosEncontrados); // Atualiza o estado com todos os funcionários encontrados
    }
  } catch (error) {
    console.error("Erro ao buscar funcionários:", error);
  }
};

  useEffect(() => {
    if (open && id) { // Busca os dados quando o modal é aberto e o ID está presente
      fetchOrcamento();
    }
  }, [id]); //Executa quando possuir um id para comparar

  useEffect(() => {
    if (orcamento) {
      const cpfsFuncionarios = Array.isArray(orcamento.cpfsFuncionarios)
        ? orcamento.cpfsFuncionarios.join('') // Converte o array em uma string, se necessário
        : orcamento.cpfsFuncionarios;
      fetchFuncionarios(cpfsFuncionarios); // Chama a função com cpfsFuncionarios
    }
  }, [orcamento]); // Executa quando orcamento mudar

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-[#007259] text-[#fff] hover:bg-[#005c47] hover:text-[#fff]">
          Visualizar Funcionários
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-[#f0f4f8]">
        <DialogHeader className="border-b border-[#d0d5dd] pb-5">
          <DialogTitle className="text-3xl font-bold text-[#2b3c56]">Funcionários Escalados</DialogTitle>
          <DialogDescription className="text-[#4a5b75]">
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