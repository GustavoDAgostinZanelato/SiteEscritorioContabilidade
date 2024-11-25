"use client";

import { useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import { useRouter } from 'next/navigation';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { db, app } from "../app/firebase/firebase";

const auth = getAuth(app);

export default function CadastroEmployee() { 
    //Puxando o ID do usuário pela URL
    const searchParams = useSearchParams();
    const uid = searchParams.get('uid');
    //Dados do Funcionário
    const [cpf, setCpf] = useState("");
    const [email, setEmail] = useState("");
    const [nome, setNome] = useState("");
    const [sobrenome, setSobrenome] = useState("");
    const [senha, setSenha] = useState("");
    const [telefone, setTelefone] = useState("");
    //Extra
    const router = useRouter(); 


    //Função com verificações das informações digitadas
    const handleSignUp = async () => {
        try {
            // Verifica se todos os campos foram preenchidos
            if (cpf.length === 0 || email.length === 0 || nome.length === 0 || sobrenome.length === 0 || senha.length === 0 || telefone.length === 0) {
                alert("Preencha todos os campos para prosseguir.");
                return;
            }

            // Verifica o tamanho da senha
            if (senha.length < 6) {
                alert("A senha deve ter pelo menos 6 caracteres.");
                return;
            }

            // Verifica o tamanho do cpf
            if (cpf.length < 14) {
                alert("CPF inválido.");
                return;
            }

            // Verifica o tamanho do telefone
            if (telefone.length < 14) {
                alert("Número de telefone inválido.");
                return;
            }

            // Verifica se o CPF já está em uso
            const cpfQuery = query(collection(db, "Funcionarios"), where("cpf", "==", cpf));
            const cpfSnapshot = await getDocs(cpfQuery);

            if (!cpfSnapshot.empty) {
                alert("Este CPF já está cadastrado. Tente outro.");
                return;
            }

            // Verifica se o email já está em uso
            const emailQuery = query(collection(db, "Funcionarios"), where("email", "==", email));
            const emailSnapshot = await getDocs(emailQuery);

            if (!emailSnapshot.empty) {
                alert("Este e-mail já está em uso. Tente fazer login ou use outro e-mail.");
                return;
            }

            // Após passar por todas as validações, a função registrarComEmailESenha é chamada
            await registrarComEmailESenha({ cpf, nome, sobrenome, email, senha, telefone });

        } catch (error) {
            console.log("Erro ao cadastrar funcionário");
        }
    };

    //Definindo um valor para as variáveis que serão enviadas pro BD
    interface ConfirmationProps {
        cpf: string;
        nome: string;
        sobrenome: string;
        email: string;
        senha: string;
        telefone: string;
    };

    //Adiciona os dados a coleção Funcionarios
    const registrarComEmailESenha = async ({cpf,nome,sobrenome,email,senha,telefone}: ConfirmationProps) => {
        try {   
            console.log(cpf, nome, sobrenome, email, senha, telefone)
            const res = await createUserWithEmailAndPassword(auth, email, senha);
            const user = res.user;
            
            // Lança os dados para o banco na tabela "Funcionarios"
            await addDoc(collection(db, "Funcionarios"), {
                uid: user.uid,
                cpf,
                email,
                nome,
                senha,
                telefone,
                sobrenome,
            });
            alert("Funcionário cadastrado com sucesso!");
            router.push(`/telaEmpresa?uid=${uid}`);

        } catch (error) {
            console.error("Erro ao enviar ao banco de dados");
        }
    }

    // Função para formatar o telefone
    const formatarTelefone = (value: string): string => {
        // Remove todos os caracteres que não são dígitos
        const apenasNumeros = value.replace(/\D/g, "");

        // Formata o número conforme necessário
        if (apenasNumeros.length <= 2) {
            return apenasNumeros; // Apenas DDD
            } else if (apenasNumeros.length <= 6) {
            return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2)}`; // DDD + 4 dígitos
            } else {
            return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 6)}-${apenasNumeros.slice(6, 10)}`; // DDD + 4 ou 5 dígitos + 4 dígitos
        }
    };


    // Função para formatar o CPF
    const formatarCPF = (value: string): string => {
        // Remove todos os caracteres que não são dígitos
        const apenasNumeros = value.replace(/\D/g, "");

        // Formata o CPF conforme necessário
        if (apenasNumeros.length <= 3) {
            return apenasNumeros; // Apenas os três primeiros dígitos
        } else if (apenasNumeros.length <= 6) {
            return `${apenasNumeros.slice(0, 3)}.${apenasNumeros.slice(3)}`; // Formato XXX.XXX
        } else if (apenasNumeros.length <= 9) {
            return `${apenasNumeros.slice(0, 3)}.${apenasNumeros.slice(3, 6)}.${apenasNumeros.slice(6)}`; // Formato XXX.XXX.XXX
        } else {
            return `${apenasNumeros.slice(0, 3)}.${apenasNumeros.slice(3, 6)}.${apenasNumeros.slice(6, 9)}-${apenasNumeros.slice(9, 11)}`; // Formato XXX.XXX.XXX-XX
        }
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <Tabs className="w-[130%]">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-[#2B3C56] text-[26px] font-bold">Cadastro de Funcionário</CardTitle>
                        <CardDescription className="text-[#53647C] text-[12px] font-semibold">Crie um cadastro para o funcionário da sua empresa</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[#2B3C56] text-[12px] font-bold">CPF</Label>
                            <Input
                                id="register-cpf"
                                type="text"
                                placeholder="Informe o CPF"
                                value={cpf}
                                onChange={(e) => setCpf(formatarCPF(e.target.value))}
                                className="w-full border border-gray-300 rounded-md p-2 placeholder:text-gray-400 placeholder:text-base, text-[12px]"
                                required
                            />
                        </div>
                        <div className="flex">
                            <div className="space-y-2 w-1/2">
                                <Label className="text-[#2B3C56] text-[12px] font-bold">Nome</Label>
                                <Input
                                    id="register-name"
                                    type="text"
                                    placeholder="Nome do Funcionário"
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)} 
                                    className="w-full border border-gray-300 rounded-md p-2 placeholder:text-gray-400 placeholder:text-base, text-[12px]"
                                    required
                                />
                            </div>
                            <div className="space-y-2 w-1/2 pl-2">
                                <Label className="text-[#2B3C56] text-[12px] font-bold">Sobrenome</Label>
                                <Input
                                    id="register-sobrenome"
                                    type="text"
                                    placeholder="Sobrenome do Funcionário"
                                    value={sobrenome}
                                    onChange={(e) => setSobrenome(e.target.value)} 
                                    className="w-full border border-gray-300 rounded-md p-2 placeholder:text-gray-400 placeholder:text-base, text-[12px]"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2 pr-2">
                            <Label className="text-[#2B3C56] text-[12px] font-bold">Email</Label>
                            <Input
                                id="register-email"
                                type="email"
                                placeholder="Insira um email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full border border-gray-300 rounded-md p-2 placeholder:text-gray-400 placeholder:text-base, text-[12px]"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[#2B3C56] text-[12px] font-bold">Senha</Label>
                                <Input
                                    id="register-password"
                                    type="password"
                                    placeholder="Insira uma senha"
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md p-2 placeholder:text-gray-400 placeholder:text-base, text-[12px]"
                                    required
                                />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[#2B3C56] text-[12px] font-bold">Telefone</Label>
                            <Input
                                id="register-phonenumber"
                                type="text"
                                placeholder="Insira o telefone para contato"
                                value={telefone}
                                onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
                                className="w-full border border-gray-300 rounded-md p-2 placeholder:text-gray-400 placeholder:text-base, text-[12px]"
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="justify-end">
                        <Button className="bg-[#007259] text-[#fff] hover:bg-[#005c47]" onClick={() =>handleSignUp()}>
                            Criar conta
                        </Button>
                    </CardFooter>
                </Card>
            </Tabs>
        </div>
    );
};