"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { Tabs } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { addDoc, collection, query, where, getDocs } from "firebase/firestore"; 
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase/firebase";
import { db } from "../firebase/firebase";


export default function EnvioArquivo() {
    
    //Informações do Advogado
    const searchParams = useSearchParams();
    const uid = searchParams.get("uid");
    const [nome, setNome] = useState('');
    const [sobrenome, setSobrenome] = useState('');
    const [telefone, setTelefone] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    //Informações do Documento
    const [cpf, setCpf] = useState('');
    const [titulo, setTitulo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [data, setData] = useState('');
    const [dataAtual, setDataAtual] = useState(''); 
    const [dataComparacao, setDataComparacao] = useState('');
    const [dataEscolhidaBr, setDataEscolhidaBr] = useState('');
    const [arquivo, setArquivo] = useState<File | null>(null);
    //Extra
    const router = useRouter(); 


    // Pega os dados do Advogado a partir do ID da URL
    useEffect(() => {
        async function fetchCpf() {
            if (uid) {
                const q = query(collection(db, "Advogado"), where("uid", "==", uid));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const advogadoDoc = querySnapshot.docs[0];
                    const advogadoData = advogadoDoc.data();
                    setCpf(advogadoData.cpf);
                    setNome(advogadoData.nome);
                    setSobrenome(advogadoData.sobrenome);
                    setTelefone(advogadoData.telefone);
                    setEmail(advogadoData.email);
                    setSenha(advogadoData.senha);
                }
            }
        }
        fetchCpf();  // Chama a função para buscar o CPF
    }, [uid]);  // Como o useEffect recebe o ID como parâmetro, o hook será disparado quando o ID mudar 
   

    // Função para obter a data atual
    useEffect(() => {
        const dataAtual = new Date();
        const dia = String(dataAtual.getDate()).padStart(2, '0');      // Garantir dois dígitos
        const mes = String(dataAtual.getMonth() + 1).padStart(2, '0'); // Janeiro é identificado com mês 0, então soma 1 a lista
        const ano = dataAtual.getFullYear();
    
        const dataComparacao = `${ano}-${mes}-${dia}`; // Formato DD/MM/YYYY
        const dataBr = `${dia}/${mes}/${ano}`;         // Formato DD/MM/YYYY
        setDataAtual(dataBr);             //Data no padrão BR que será enviada pro BD
        setDataComparacao(dataComparacao) //Data no padrao US que será comparada com a data de entrega escolhida pelo usuário
        console.log(dataBr);
    }, []);


    // Função para o usuário selecionar a data de entrega do orçamento
    const handleDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dataEscolhida = e.target.value; // Formato YYYY-MM-DD
        if (dataEscolhida <= dataComparacao) {
            alert("Por favor, escolha uma data que seja posterior à data atual.");
            setData(""); // Limpa o estado se a data não for válida
        } else {
            const [ano, mes, dia] = dataEscolhida.split("-"); // Separa a string de data
            const dataEscolhidaBr = `${dia}/${mes}/${ano}`;   // Junta no formato brasileiro DD/MM/YYYY
            setData(dataEscolhida) // Precisa estar no padrão US para mostrar no campo de seleção de datas
            setDataEscolhidaBr(dataEscolhidaBr); //O que é enviado pro BD
            console.log("dataEscolhidaBr:", dataEscolhidaBr);
            console.log("dataEscolhida:", dataEscolhida);
        }
    };


    // Função para lidar com a seleção do arquivo
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setArquivo(file);
        } else {
            alert("Nenhum arquivo foi selecionado.");
        }
    };

        //Enviando para o Banco de Dados
        const handleUpload = async () => {

            //Gerando uma URL para o arquivo que foi salvo no storage do Firebase
            if (!arquivo) {
                alert("Por favor, selecione um arquivo.");
                return;
            }
            const storageRef = ref(storage, `Documentos/${arquivo.name}`);
            try {
                await uploadBytes(storageRef, arquivo);
                const downloadURL = await getDownloadURL(storageRef);
                

                //Envia os dados para a coleção 'OrcamentosEnviados'
                const orcamentoCollectionRef = collection(db, "Orcamento");
                await addDoc(orcamentoCollectionRef, {
                    cpfAdvogado: cpf,
                    Nome: nome,
                    Sobrenome: sobrenome,
                    Email: email,
                    Telefone: telefone,
                    Titulo: titulo,
                    Descricao: descricao,
                    DataEntrega: dataEscolhidaBr,
                    DataEnvio: dataAtual,
                    CaminhoArquivo: downloadURL,
                    Status: "Aguardando Aprovação",
                });

            alert("Orçamento solicitado com sucesso!");
            router.push(`/telaAdvogado?uid=${uid}`);
        } catch (error) {
            alert("Erro ao solicitar o orçamento: " + error);
        }
    };

    const handleDescricaoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDescricao(e.target.value);
        e.target.style.height = "auto"; // Redefine a altura para calcular a nova altura
    };


    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <Tabs className="w-full max-w-md">
                <Card>
                    <CardHeader>
                        <CardTitle>Solicite um orçamento</CardTitle>
                        <CardDescription>Envie seu arquivo para análise</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="titulo">Título</Label>
                            <Input
                                id="titulo"
                                type="text"
                                placeholder="Título do trabalho"
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                                required
                                className="w-full border border-gray-300 rounded-md p-2 placeholder:text-gray-400 placeholder:text-base, text-sm" 
                            />  
                        </div> 
                        <div className="space-y-2">
                            <Label htmlFor="descricao">Descrição</Label>
                            <textarea
                                id="descricao"
                                placeholder="Digite uma descrição"
                                value={descricao}
                                onChange={handleDescricaoChange}
                                required
                                className="w-full border border-gray-300 rounded-md p-2 resize-none placeholder:text-gray-400 placeholder:text-base, text-sm"
                                style={{ height: 'auto' }} 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="data">Prazo de Entrega</Label>
                            <Input
                                id="data"
                                type="date"
                                value={data}
                                onChange={handleDataChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="arquivo">Anexar Arquivo PDF</Label>
                            <Input
                                id="arquivo"
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleUpload}>Enviar</Button>
                    </CardFooter>
                </Card>
            </Tabs>
        </div>
    );
}
