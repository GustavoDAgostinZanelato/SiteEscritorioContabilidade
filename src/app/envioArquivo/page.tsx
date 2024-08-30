"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

// Aba de Login
export default function EnvioArquivo() {
    const [titulo, setTitulo] = useState("");
    const [descricao, setDescricao] = useState("");
    const [data, setData] = useState("");
    const [dataAtual, setDataAtual] = useState(""); // Estado para armazenar a data atual
    const [arquivo, setArquivo] = useState(null); // Estado para armazenar o arquivo PDF

    // Função para obter a data atual
    useEffect(() => {
        const dataAtualISO = new Date().toISOString().split("T")[0]; // Formato YYYY-MM-DD
        setDataAtual(dataAtualISO);
        setData(dataAtualISO); // Define a data do input como a data atual
    }, []);

    // Função para lidar com a seleção da data
    const handleDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dataEscolhida = e.target.value;
        const dataSelecionadaFormatada = new Date(dataEscolhida);
        const dataAtualFormatada = new Date(dataAtual); // Converte a data atual para objeto Date

        // Verifica se a data escolhida é igual ou anterior à data atual
        if (dataSelecionadaFormatada < dataAtualFormatada) {
            alert("Por favor, escolha uma data que seja igual ou posterior à data atual.");
            setData(""); // Limpa o campo de data se a data for inválida
        } else {
            setData(dataEscolhida);
        }
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
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button>Enviar</Button>
                    </CardFooter>
                </Card>
            </Tabs>
        </div>
    );
}
