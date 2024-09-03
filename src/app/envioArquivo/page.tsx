"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useSearchParams } from "next/navigation";
import { Tabs } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addDoc, collection, query, where, getDocs } from "firebase/firestore"; 
import { storage } from "../firebase/firebase";
import { db } from "../firebase/firebase";


export default function EnvioArquivo() {
    const router = useRouter(); 
    const searchParams = useSearchParams();  // Captura os parâmetros da URL
    const email = searchParams.get("email"); // Obtém o Email da URL
    const [cpf, setCpf] = useState('');
    const [titulo, setTitulo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [data, setData] = useState('');
    const [dataAtual, setDataAtual] = useState(''); 
    const [arquivo, setArquivo] = useState<File | null>(null);


    //Pega o cpf do banco a partir do email de url
    useEffect(() => {
        async function fetchCpf() {
            if (email) {  // Verifica se o email foi obtido da URL
                const q = query(collection(db, "Advogado"), where("email", "==", email));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    // Assumindo que o email é único, pegamos o primeiro documento encontrado
                    const advogadoDoc = querySnapshot.docs[0];
                    const advogadoData = advogadoDoc.data();
                    setCpf(advogadoData.cpf);  // Define o CPF no estado
                } else {
                    console.log("Nenhum advogado encontrado com o email fornecido.");
                }
            }
        }

        fetchCpf();  // Chama a função para buscar o CPF
    }, [email]);  // O useEffect será disparado quando o email mudar
   


    // Função para obter a data atual
    useEffect(() => {
        const dataAtualISO = new Date().toISOString().split("T")[0]; // Formato YYYY-MM-DD
        setDataAtual(dataAtualISO);
        console.log(dataAtualISO);
    }, []);

    // Função para lidar com a seleção da data
    const handleDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dataEscolhida = e.target.value;

        if (dataEscolhida <= dataAtual) {
            alert("Por favor, escolha uma data que seja posterior à data atual.");
            setData(""); 
        } else {
            setData(dataEscolhida);
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

    const handleUpload = async () => {
        if (!arquivo) {
            alert("Por favor, selecione um arquivo.");
            return;
        }
    
        const storageRef = ref(storage, `Documentos/${arquivo.name}`);
    
        try {
            await uploadBytes(storageRef, arquivo);
            const downloadURL = await getDownloadURL(storageRef);
    
            // Salva os dados do orçamento no Firestore com um ID automático
            const orcamentoCollectionRef = collection(db, "Orcamento"); // Referência à coleção "Orcamento"
            await addDoc(orcamentoCollectionRef, {
                Titulo: titulo,
                Descricao: descricao,
                DataEntrega: data,
                DataEnvio: dataAtual,
                CaminhoArquivo: downloadURL,
                cpfAdvogado: cpf,
                Status: "Em análise",
            });
            
            alert("Orçamento solicitado com sucesso!");
            router.push(`/telaAdvogado?email=${email}`);
        } catch (error) {
            alert("Erro ao enviar arquivo: " + error);
        }
    };



    // HTML da página
    //--------------------------------------------------------------------------------------------------------------------------------
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
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="descricao">Descrição</Label>
                            <Input
                                id="descricao"
                                type="text"
                                placeholder="Digite uma descrição"
                                value={descricao}
                                onChange={(e) => setDescricao(e.target.value)}
                                required
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
