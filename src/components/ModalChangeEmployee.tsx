'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { collection, getDocs, getFirestore, query, where, doc, getDoc, updateDoc } from "firebase/firestore";
import { app } from '../app/firebase/firebase';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Funcionario {
  id: string;
  nome: string;
  sobrenome: string;
  email: string;
  cpf: string;
}

const db = getFirestore(app);

export default function ModalChangeEmployee({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
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
    if (open && id) {
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
  fetchAllFuncionarios();
  

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
          {isAssigned ? "Remove" : "Assign"}
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
      setOpen(false);
      window.location.reload();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#007259] text-[#fff] hover:bg-[#005c47]">
          Editar Funcionários
        </Button>
      </DialogTrigger>
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
            <TabsTrigger value="naoEscalado">Funcionários Disponíveis</TabsTrigger>
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
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button className="bg-[#007259] text-[#fff] hover:bg-[#005c47]" onClick={SalvarModificacoes}>Salvar Modificações</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};






//Modal antiga
    // <Dialog open={open} onOpenChange={setOpen}>
    //   <DialogTrigger asChild>
    //     <Button variant="outline">
    //       Editar Funcionários
    //     </Button>
    //   </DialogTrigger>
    //   <DialogContent className="sm:max-w-[600px] bg-[#f0f4f8]">
    //     <DialogHeader className="border-b border-[#d0d5dd] pb-5">
    //       <DialogTitle className="text-3xl font-bold text-[#2b3c56]">Editar Funcionários</DialogTitle>
    //       <DialogDescription className="text-[#4a5b75]">
    //         Modifique as funções dos colaboradores
    //       </DialogDescription>
    //     </DialogHeader>
    //     <ScrollArea className="h-[400px] w-full pr-4">
    //       <div className="grid grid-cols-1 gap-2 py-2">
    //         {funcionarios.map((funcionario) => (
    //           <Card key={funcionario.id} className="bg-[#fff] shadow-sm hover:shadow-md transition-shadow">
    //             <CardContent className="p-4 flex items-center justify-between">
    //               <div>
    //                 <Avatar className="w-16 h-16 mr-4">
    //                   <AvatarImage src={funcionario.avatar} alt={funcionario.nome} />
    //                   <AvatarFallback className="bg-[#eaeaea] text-xl">
    //                     {funcionario.nome.slice(0, 2)}
    //                   </AvatarFallback>
    //                 </Avatar>
    //               </div>
    //               <div> 
    //                 <div className="space-y-1">
    //                   <h3 className="text-lg font-semibold text-[#2b3c56]">{funcionario.nome} {funcionario.sobrenome}</h3>
    //                   <Badge className="bg-[#e6f3f0] text-[#007259] hover:bg-[#e6f3f0] hover:text-[#007259]">
    //                     {funcionario.email}
    //                   </Badge>
    //                 </div>
    //               </div>
    //               <div className="flex items-center space-x-2 ml-auto">
    //                 <Checkbox className='h-5 w-5 mr-5'
    //                   // id={`assign-${funcionario.id}`}
    //                   // checked={assignedEmployees.includes(funcionario.id)}
    //                   // onCheckedChange={() => handleAssignment(funcionario.id)}
    //                 />
    //                 {/* <Label className="text-[#2b3c56]">
    //                   Atribuir
    //                 </Label> */}
    //               </div>
    //             </CardContent>
    //           </Card>
    //         ))}
    //       </div>
    //     </ScrollArea>
    //     <div className="mt-4 flex justify-end space-x-2">
    //       <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
    //       <Button className="bg-[#007259] text-[#fff] hover:bg-[#005c47]">Salvar Alterações</Button>
    //     </div>
    //   </DialogContent>
    // </Dialog>

