'use client'

import { UsersRound } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { app } from '../app/firebase/firebase';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { collection, getDocs, getFirestore, query, where, doc, getDoc, updateDoc } from "firebase/firestore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";

interface Funcionario {
  id: string;
  nome: string;
  sobrenome: string;
  email: string;
  cpf: string;
}

const db = getFirestore(app);

export default function ModalChangeEmployee({ id }: { id: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orcamento, setOrcamento] = useState<any>(null);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [funcionariosComFuncao, setFuncionariosComFuncao] = useState<string[]>([]);

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
      const cpfsArray = cpfsFuncionarios.match(/([0-9]{3}\.[0-9]{3}\.[0-9]{3}-[0-9]{2})/g);
      if (cpfsArray) {
        const promises = cpfsArray.map(async (cpf) => {
          const trimmedCpf = cpf.trim();
          const q = query(collection(db, "Funcionarios"), where("cpf", "==", trimmedCpf));
          const querySnapshot = await getDocs(q);
          return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }) as Funcionario);
        });
        const results = await Promise.all(promises);
        const funcionariosEncontrados = results.flat();
        setFuncionarios(funcionariosEncontrados);
        setFuncionariosComFuncao(funcionariosEncontrados.map(funcionario => funcionario.id));
      }
    } catch (error) {
      console.error("Erro ao buscar funcionários:", error);
    }
  };

  const fetchAllFuncionarios = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Funcionarios"));
      const allFuncionarios = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }) as Funcionario);
      setFuncionarios(allFuncionarios);
    } catch (error) {
      console.error("Erro ao buscar todos os funcionários:", error);
    }
  };

  useEffect(() => {
    if (isOpen && id) {
      fetchOrcamento();
      fetchAllFuncionarios(); // Buscando todos os funcionários ao abrir o modal
    }
  }, [id]);

  useEffect(() => {
    if (orcamento) {
      const cpfsFuncionarios = Array.isArray(orcamento.cpfsFuncionarios)
        ? orcamento.cpfsFuncionarios.join('')
        : orcamento.cpfsFuncionarios;
      fetchFuncionarios(cpfsFuncionarios);
    }
  }, [orcamento]);

  const handleTrabalhoFuncionario = (funcionarioId: string) => {
    const isAssigned = funcionariosComFuncao.includes(funcionarioId);
    setFuncionariosComFuncao(prev =>
      isAssigned
        ? prev.filter(id => id !== funcionarioId)
        : [...prev, funcionarioId]
    );
  };
  

  const renderEmployeeCard = (funcionario: Funcionario, isAssigned: boolean) => (
    <Card key={funcionario.id} className="bg-[#fff] shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="w-12 h-12">
            <AvatarImage alt={funcionario.nome} />
            <AvatarFallback className="bg-[#e6f3f0] text-white">
              {funcionario.nome.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold text-[#2b3c56]">{funcionario.nome} {funcionario.sobrenome}</h3>
            <Badge className="mt-1 bg-[#e6f3f0] text-[#007259] hover:bg-[#e6f3f0] hover:text-[#007259]">
              {funcionario.email}
            </Badge>  
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => handleTrabalhoFuncionario(funcionario.id)} className={isAssigned ? "bg-[#007259] text-[#fff] hover:bg-[#005c47] hover:text-[#fff]" : ""}>
          {isAssigned ? "Remover" : "Escalar"}
        </Button>
      </CardContent>
    </Card>
  )

  const SalvarModificacoes = async () => {
    const cpfsEscalados = funcionarios
      .filter(funcionario => funcionariosComFuncao.includes(funcionario.id))
      .map(funcionario => funcionario.cpf);
    const docRef = doc(db, 'OrcamentosProcesso', id);
    if(cpfsEscalados.length === 0) {
      alert("Não é possivel finalizar a ação sem nenhum funcionário selecionado. Por favor, selecione pelo menos um.");
      return;
    }
    try {
      // Espera a atualização ser concluída
      await updateDoc(docRef, {
        cpfsFuncionarios: cpfsEscalados,
      });
    } catch (error) {
      console.error("Erro ao utualizar funcionários: ", error);
    } finally {
      setIsOpen(false);
      window.location.reload();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="text-[12px] text-[#007259] hover:text-[#00AD87] font-semibold flex border-b border-[#007259] mb-2">
          <UsersRound className="h-4 w-4 mr-1"/>Editar Funcionários
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
        <DialogHeader className="border-b border-[#d0d5dd] pb-4">
          <DialogTitle className="text-3xl font-bold text-[#2b3c56]">Editar Funcionários</DialogTitle>
          <DialogDescription className="text-[#4a5b75]">
            Modifique a função dos colaboradores da empresa
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="escalado" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="escalado">Funcionários Escalados</TabsTrigger>
            <TabsTrigger value="naoEscalado" onClick={fetchAllFuncionarios} >Funcionários Disponíveis</TabsTrigger>
          </TabsList>
          <TabsContent value="escalado">
            <ScrollArea className="h-[400px] w-full pr-4">
              <div className="space-y-4 py-4">
                {funcionarios
                  .filter(employee => funcionariosComFuncao.includes(employee.id))
                  .map(employee => renderEmployeeCard(employee, true))}
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="naoEscalado">
            <ScrollArea className="h-[400px] w-full pr-4">
              <div className="space-y-4 py-4">
                {funcionarios
                  .filter(employee => !funcionariosComFuncao.includes(employee.id))
                  .map(employee => renderEmployeeCard(employee, false))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
        <div className="mt-4 flex justify-end space-x-2">
          <Button variant="outline" className='text-[#2b3c56] border-[#2b3c56]' onClick={() => setIsOpen(false)}>Cancelar</Button>
          <Button className="bg-[#007259] text-[#fff] hover:bg-[#005c47]" onClick={SalvarModificacoes}>Salvar Modificações</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
