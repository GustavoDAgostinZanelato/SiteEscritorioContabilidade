'use client'

import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { app } from '../app/firebase/firebase';
import { Button } from "@/components/ui/button";
import { CreditCard, QrCode } from 'lucide-react';
import  QrCodePix  from "@/components/ui/QrCodePix";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { collection, doc, addDoc, getFirestore, getDocs, query, where, updateDoc, arrayUnion, deleteDoc } from "firebase/firestore";

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
    Valor: string;
  };
}


const ModalPayment: React.FC<ConfirmationProps> = ({ dd }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState("");
  const [Ncartao, setNcartao] = useState("");
  const [cvc, setCvc] = useState("");
  const [parcelas, setParcelas] = useState('');
  const [valorComJuros, setValorComJuros] = useState(dd.Valor);
  const [abaAtiva, setAbaAtiva] = useState("cartao");

  //Formatação do Número do Cartão
  const handleNumeroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNcartao(formatNcartao(e.target.value));
  };
  const formatNcartao = (value: string): string => {
    // Remove tudo que não for número
    const numericValue = value.replace(/\D/g, "");
    const formattedValue = numericValue
      .replace(/(\d{4})/g, "$1 ")
      .trim();
    return formattedValue.slice(0, 19); // Limita a 19 caracteres
  };

  //Formatação do CVC
  const handleCVCChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCvc(formatCvc(e.target.value));
  };
  const formatCvc = (value: string): string => {
    const numericValue = value.replace(/\D/g, "");
    return numericValue.slice(0, 3); // Limita a 3 caracteres
  };

  //Formatação da data inserida
  const handleDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(formatarData(e.target.value));
  };
  const formatarData = (value: string): string => {
    const numericValue = value.replace(/\D/g, "");
    // Aplica a máscara: DD/MM/AA
    if (numericValue.length <= 2) return numericValue; // Até 2 caracteres: DD
    if (numericValue.length <= 4) return `${numericValue.slice(0, 2)}/${numericValue.slice(2)}`; // Até 4: DD/MM
    return `${numericValue.slice(0, 2)}/${numericValue.slice(2, 4)}/${numericValue.slice(4, 6)}`; // Final: DD/MM/AA
  };

  //Função copiar chave pix
  const CopyKey = () => {
    alert('Chave Pix copiada');
  };

  // Função para limpar o valor do BD e o transforma em número
  const limparValor = (valor: string): number => {
    return parseFloat(valor.replace(/[R$,\s]/g, '').replace('.', '').replace(',', '.'));
  };
  // Função para aplicar juros
  const aplicarJuros = (valor: string, parcelas: string): number => {
    const valorNum = limparValor(valor);
    let valorFinal = valorNum;
    const numParcelas = parseInt(parcelas);
    if (numParcelas == 4) {
      valorFinal = valorNum * 1.05;
    }
    if (numParcelas == 8) {
      valorFinal = valorNum * 1.07;
    }
    if (numParcelas == 12) {
      valorFinal = valorNum * 1.10;
    }
    return valorFinal;
  };
  const formatarValorComVirgula = (valor: number): string => {
    const valorString = (valor / 100).toFixed(2); // Divide por 100 para ajustar a vírgula
    const [inteiro, decimal] = valorString.split('.');
    const parteInteiraFormatada = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${parteInteiraFormatada},${decimal}`;
  };
  const handleValueChange = (value: string) => {
    setParcelas(value); // Define o valor das parcelas com o valor recebido
    const novoValor = aplicarJuros(dd.Valor, value); // Aplica juros de acordo com a seleção
    const novoValorFormatado = formatarValorComVirgula(novoValor);
    setValorComJuros(novoValorFormatado); // Atualiza o estado com o novo valor com juros formatado
  };

  //Função para realizar o pagamento
  const EfetuarPagamento = async () => {
    try{
      const orcamentoDocRef = doc(db, "TrabalhosConcluidos", dd.id);
      await updateDoc(orcamentoDocRef, {
        Status: "Concluído",
    });
    setIsOpen(false);
    window.location.reload();
    } catch (error) {
      console.error("Erro ao atualizar o status:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="text-[12px] text-[#007259] hover:text-[#00AD87] font-semibold flex border-b border-[#007259] mb-2">
          <CreditCard className="mr-2 h-4 w-4" />Realizar Pagamento
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

      <DialogContent className="sm:max-w-[425px] bg-[#f0f4f8]">
        <DialogHeader>
          <div className=' flex flex-col'>
            <p className="text-[12px] font-semibold text-[#007259]">Valor</p>
            <p className="text-[32px] font-bold text-[#2b3c56]">{dd.Valor}</p>
            {abaAtiva === "cartao" && (
              <div className="flex">
                <p className="text-[12px] font-semibold text-[#007259]">Valor final:</p>
                <p className="text-[12px] font-semibold text-[#2b3c56] ml-1">{valorComJuros}</p>
              </div>
            )}
          </div>
          
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Tabs defaultValue="cartao" className="w-full max-w-md" onValueChange={(value) => setAbaAtiva(value)}>
            <TabsList className="grid w-full grid-cols-2 bg-[#F0F4F8] shadow-md">
              <TabsTrigger value="cartao" className="text-[#2B3C56] text-[12px]">
                <CreditCard className="mr-3 h-5 w-5" />Cartão
              </TabsTrigger> 
              <TabsTrigger value="pix" className="text-[#2B3C56] text-[12px]">
                <QrCode className="mr-3 h-5 w-5" />Pix
              </TabsTrigger>
            </TabsList>

            {/* Aba Cartão */}
            <TabsContent value="cartao" className='space-y-4 mt-8'> 
              <div className='space-y-2'>
                <Label className="text-[#2B3C56] text-[12px] font-bold">Número do Cartão</Label>
                <Input 
                  id="Ncartao" 
                  name="Ncartao" 
                  placeholder="1234 5678 9012 3456"
                  value={Ncartao}
                  onChange={handleNumeroChange}
                  required 
                />
              </div>
              <div className='flex space-x-4'>
                <div className='space-y-2'>
                  <Label className="text-[#2B3C56] text-[12px] font-bold mt-2">Data de Validade</Label>
                  <Input 
                    id="DataValidade" 
                    name="DataValidade" 
                    placeholder="DD/MM/AA" 
                    value={date}
                    onChange={handleDataChange}
                    required
                  /> 
                </div>
                <div className='space-y-2'>
                  <Label className="text-[#2B3C56] text-[12px] font-bold mt-2">CVC</Label>
                  <Input 
                    id="cvc" 
                    name="cvc" 
                    placeholder="123" 
                    value={cvc}
                    onChange={handleCVCChange}
                    required
                  />
                </div>
              </div>
              <div className='space-y-2'>
                <Label className="text-[#2B3C56] text-[12px] font-bold mt-2">Nome do Titular</Label>
                <Input 
                  id="nome" 
                  name="nome" 
                  placeholder="Insira o nome" 
                  required 
                />
              </div>
              <div className='space-y-2'>
                <Label className="text-[#2B3C56] text-[12px] font-bold mt-2">Parcelas</Label>
                  <Select onValueChange={handleValueChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Opções de Parcelamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1x">1x sem juros</SelectItem>
                      <SelectItem value="2x">2x sem juros</SelectItem>
                      <SelectItem value="4x">4x com juros (5%)</SelectItem>
                      <SelectItem value="8x">8x com juros (7%)</SelectItem>
                      <SelectItem value="12x">12x com juros (10%)</SelectItem>
                    </SelectContent>
                  </Select>
              </div>
            </TabsContent>

            {/* Aba Pix */}
            <TabsContent value="pix" className='space-y-8 mt-8'> 
              <div className='space-y-2'>
                <Label className="text-[#2B3C56] text-[12px] font-bold mt-2">Chave Pix</Label>
                <div className='flex space-x-4'>
                  <Input 
                    id="chavePix" 
                    name="chavePix"
                    placeholder="Your PIX key" 
                    value={"48 99624957"} 
                    required 
                  />
                  <button className="text-[12px] text-[#007259] hover:text-[#00AD87] font-semibold min-w-20" onClick={CopyKey}>Copiar Chave</button>
                </div>
              </div>
              
              <div className='space-y-1 flex flex-col items-center'>
                <Label className="text-[#2B3C56] text-[12px] font-bold">Ou pague pelo QR Code</Label>
                <QrCodePix />
              </div>
            </TabsContent>  
          </Tabs>
          <DialogFooter className='mt-8'>
            <Button className="bg-[#007259] text-[#fff] hover:bg-[#005c47]" onClick={EfetuarPagamento}>Efetuar Pagamento</Button>
          </DialogFooter>
        </div>  
      </DialogContent>
    </Dialog>
  )
}

export default ModalPayment