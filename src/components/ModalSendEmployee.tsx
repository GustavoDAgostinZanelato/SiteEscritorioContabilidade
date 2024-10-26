'use client'

import { useState, useEffect } from 'react'
import { app } from '../app/firebase/firebase';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { updateDoc, doc, collection, addDoc, getDocs, getFirestore, deleteDoc} from "firebase/firestore";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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
    feedbackOrcamento: string;
    respostaAdv: string;
    valor: string;
  };
}

const ModalSendEmployee: React.FC<ConfirmationProps> = ({dd} ) => {
  const [selecionarPessoa, setPessoasSelecionadas] = useState<number[]>([]);
  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [descricao, setDescricao] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchFuncionarios = async () => {
      const funcionariosCollection = collection(db, 'Funcionarios');
      const funcionariosSnapshot = await getDocs(funcionariosCollection);
      const funcionariosList = funcionariosSnapshot.docs.map(doc => ({
        id: doc.id,   // Captura o ID do documento
        ...doc.data() // Pega os dados de cada documento
      }));
      setFuncionarios(funcionariosList);
    };
    fetchFuncionarios();
  }, []);

  const pessoasSelecionadas = (funcionarioId: number) => {
    setPessoasSelecionadas(prev =>
      prev.includes(funcionarioId)
        ? prev.filter(id => id !== funcionarioId)
        : [...prev, funcionarioId]
    )
  }

  const enviarDocumento = async () => {

    //Colocando os CPFs dos Funcionarios selecionados em um Array para conseguir armazenar mais de um no BD
    const cpfsSelecionados = selecionarPessoa.map(funcionarioId => {
      const funcionario = funcionarios.find(f => f.id === funcionarioId);
      return funcionario?.cpf;
    }).filter(cpf => cpf); // Filtra para remover valores undefined
  
    if (cpfsSelecionados.length > 0) {
      const orcamentoRef = doc(db, 'Orcamento', dd.id);
  
      await updateDoc(orcamentoRef, {
        descricaoFuncionario: descricao,
        cpfsFuncionarios: cpfsSelecionados, // Armazena os CPFs em um array
      });
    }

    //Enviado o orçamentos para a tela de Orçamentos em Processo
    const OrcamentoRef = collection(db, "OrcamentosProcesso");
    await addDoc(OrcamentoRef, {
      cpfAdvogado: dd.cpfAdvogado,
      Nome: dd.Nome,
      Sobrenome: dd.Sobrenome,
      Email: dd.Email,
      Telefone: dd.Telefone,
      Titulo: dd.Titulo,
      Descricao: dd.Descricao,
      DataEntrega: dd.DataEntrega,
      DataEnvio: dd.DataEnvio,
      CaminhoArquivo: dd.CaminhoArquivo,
      Status: "Aprovado",
      descricaoFuncionario: descricao,
      cpfsFuncionarios: cpfsSelecionados,
      feedbackOrcamento: dd.feedbackOrcamento,
      respostaAdv: dd.respostaAdv,
      valor: dd.valor,
    });
    const orcamentoDel = doc(db, "Orcamento", dd.id);
    await deleteDoc(orcamentoDel);
    
    setIsOpen(false);         //Fecha a Modal
    window.location.reload(); //Atualiza os orçamentos na tela
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Delegar ao Funcionário</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[1000px] w-4/5">
        <DialogHeader>
          <DialogTitle>Delegar ao Funcionário</DialogTitle>
          <DialogDescription>
            Selecione o(s) trabalho(s) que deseja delegar aos funcionários e adicione uma descrição
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-4 py-4">
          <div className="flex-1">
            <h4 className="mb-2 text-sm font-medium">Selecionar Funcionários</h4>
            <ScrollArea className="h-[300px] rounded-md border p-4">

              {funcionarios.map((funcionario) => (
                <div key={funcionario.id} className="flex items-center space-x-2 mb-5">
                  <Checkbox
                    id={`funcionario-${funcionario.id}`}
                    checked={selecionarPessoa.includes(funcionario.id)}
                    onCheckedChange={() => pessoasSelecionadas(funcionario.id)}
                  />
                  <label htmlFor={`funcionario-${funcionario.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    <p className='font-bold'>{funcionario.nome} {funcionario.sobrenome}</p>
                    <p className='text-muted-foreground text-sm'>{funcionario.email}</p>
                  </label>
                </div>
              ))}
             
            </ScrollArea>
          </div>
          <Separator orientation="vertical" className="h-auto" />
          <div className="flex-1">
            <h4 className="mb-2 text-sm font-medium">Descrição</h4>
            <Textarea
              id="descricao"
              placeholder="Adicione uma descrição ao funcionário sobre o que precisa ser feito"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="h-[300px] resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={enviarDocumento} disabled={selecionarPessoa.length === 0 || descricao.length === 0}>
            Enviar ao Funcionário
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ModalSendEmployee;