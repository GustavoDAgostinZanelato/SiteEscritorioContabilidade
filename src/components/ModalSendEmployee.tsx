'use client'

import { UsersRound } from 'lucide-react';
import { useState, useEffect } from 'react'
import { Badge } from "@/components/ui/badge";
import { app } from '../app/firebase/firebase';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { doc, collection, addDoc, getDocs, getFirestore, deleteDoc} from "firebase/firestore";
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
    
    // Obter a data atual
    const dataAtual = new Date();
    const dia = String(dataAtual.getDate()).padStart(2, "0");
    const mes = String(dataAtual.getMonth() + 1).padStart(2, "0");
    const ano = dataAtual.getFullYear();
    const dataBr = `${dia}/${mes}/${ano}`; // Formato DD/MM/YYYY

    //Colocando os CPFs dos Funcionarios selecionados em um Array para conseguir armazenar mais de um no BD
    const cpfsSelecionados = selecionarPessoa.map(funcionarioId => {
      const funcionario = funcionarios.find(f => f.id === funcionarioId);
      return funcionario?.cpf;
    }).filter(cpf => cpf); // Filtra para remover valores undefined

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
      dataFuncionario: dataBr,
    });
    const orcamentoDel = doc(db, "Orcamento", dd.id);
    await deleteDoc(orcamentoDel);
  
    setIsOpen(false);         //Fecha a Modal
    window.location.reload(); //Atualiza os orçamentos na tela
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="text-[12px] text-[#007259] hover:text-[#00AD87] font-semibold flex border-b border-[#007259] mb-2">
          <UsersRound className="h-4 w-4 mr-1"/>Delegar ao Funcionário
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

      <DialogContent className="sm:max-w-[1000px] w-4/5 bg-[#f0f4f8]">
        <DialogHeader>
          <DialogTitle className='text-3xl font-bold text-[#2b3c56]'>Delegar ao Funcionário</DialogTitle>
          <DialogDescription className='text-[#53647C] text-[12px] font-semibold'>
            Selecione os funcionários e adicione uma descrição
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-4 py-4">
          <div className="flex-1">
            <div className="text-[#2B3C56] text-[16px] font-bold mb-2">Selecionar Funcionários</div>
            <ScrollArea className="h-[300px] pr-4">
              {funcionarios.map((funcionario) => (
                <div key={funcionario.id} className="grid grid-cols-1 py-1">
                  <Card key={funcionario.id} className="bg-[#fff] shadow-md rounded-[16px]">
                    <CardContent className="p-3 flex items-center space-x-4">
                      {/* Avatar */}
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={funcionario.avatar} alt={funcionario.nome} />
                        <AvatarFallback className="bg-[#E6F3F0] text-[16px] text-[#2B3C56] font-bold">
                          {funcionario.nome.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Informações do funcionário */}
                      <div className="space-y-1 flex-1">
                        <h3 className="text-[16px] font-bold text-[#2b3c56]">
                          {funcionario.nome} {funcionario.sobrenome}
                        </h3>
                        <Badge className="bg-[#e6f3f0] text-[#007259] hover:bg-[#e6f3f0] hover:text-[#007259]">
                          {funcionario.email}
                        </Badge>
                      </div>

                      {/* Checkbox */}
                      <div className="flex items-center pr-2">
                        <Checkbox
                          id={`funcionario-${funcionario.id}`}
                          checked={selecionarPessoa.includes(funcionario.id)}
                          onCheckedChange={() => pessoasSelecionadas(funcionario.id)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </ScrollArea>
          </div>


          <div className="flex-1">
            <div className="text-[#2B3C56] text-[16px] font-bold mb-2">Descrição</div>
            <Textarea
              id="descricao"
              placeholder="Descreva o que precisa ser feito"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="h-[300px] resize-none w-full border border-gray-300 rounded-md p-2 placeholder:text-gray-400 placeholder:text-base text-[14px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button className="bg-[#007259] text-[#fff] hover:bg-[#005c47]" onClick={enviarDocumento} disabled={selecionarPessoa.length === 0 || descricao.length === 0}>
            Enviar ao Funcionário
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ModalSendEmployee;