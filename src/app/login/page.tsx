"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { registrarComEmailESenha, loginComEmailESenha } from "../firebase/authentication";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase"; 


//Aba de Login
export default function Login() { 

    //Lógica para o Login do usuário
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const router = useRouter(); 

    const handleLogin = async () => {
      try 
      {
        await loginComEmailESenha(email, senha);
        console.log("Login realizado com sucesso!");
        router.push(`/telaAdvogado?email=${email}`);
      } 
      
      catch (error) 
      {
        const firebaseError = error as { code: string; message: string };

        if (firebaseError.code === 'auth/user-not-found' ||
          firebaseError.code === 'auth/wrong-password' ||
          firebaseError.code === 'auth/invalid-credential') 
        {
          alert("Email ou senha incorretos. Verifique suas credenciais e tente novamente.");
        } 
        else 
        {
          alert("Preencha todos os campos para prosseguir");
        }
        console.error("Erro ao fazer login:", firebaseError);
      }
    };


  // Barra de Navegação entre "Entrar" e "Criar conta"
  return (
    <div className="flex flex-col items-center mt-[7%]" style={{ minHeight: '800px' }}>
      <Tabs defaultValue="login" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Entrar</TabsTrigger> 
          <TabsTrigger value="register">Criar conta</TabsTrigger>
        </TabsList>
  
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Bem-vindo(a)</CardTitle>
              <CardDescription>Entre na sua conta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="Digite seu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Senha</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleLogin}>Entrar</Button>
            </CardFooter>
          </Card>
        </TabsContent>
  
        <TabsContent value="register"> 
          <SignUp /> 
        </TabsContent>
      </Tabs>
    </div>
  );
}
  

// Aba CRIAR CONTA
function SignUp() {

  //Lógica para o Registro do usuário
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [senha, setSenha] = useState("");
  const [telefone, setTelefone] = useState("");
  const router = useRouter(); 

  // Função handleSignUp para criar conta
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

      // Verifica o tamanho da senha
      if (cpf.length < 11) {
        alert("CPF inválido.");
        return;
      }
  
      // Verifica se o CPF já está em uso
      const cpfQuery = query(collection(db, "Advogado"), where("cpf", "==", cpf));
      const cpfSnapshot = await getDocs(cpfQuery);
  
      if (!cpfSnapshot.empty) {
        alert("Este CPF já está cadastrado. Tente outro.");
        return;
      }
  
      // Verifica se o email já está em uso
      const emailQuery = query(collection(db, "Advogado"), where("email", "==", email));
      const emailSnapshot = await getDocs(emailQuery);
  
      if (!emailSnapshot.empty) {
        alert("Este e-mail já está em uso. Tente fazer login ou use outro e-mail.");
        return;
      }
      
      // Caso o registro seja um sucesso
      await registrarComEmailESenha(cpf, nome, sobrenome, email, senha, telefone);
      console.log("Usuário registrado com sucesso!")
      router.push(`/telaAdvogado?email=${email}`);
  
    } catch (error) {
      console.log(1)
    }
  };


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
  };


  //Talvez no futuro colocar alguma verificação de email em caso de dumby user


  return (
    <Card>
      <CardHeader>
        <CardTitle>Registro de Usuário</CardTitle>
        <CardDescription>Crie uma nova conta seguindo os campos abaixo</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">

        <div className="space-y-2">
          <Label htmlFor="register-cpf">CPF</Label>
          <Input
            id="register-cpf"
            type="text"
            placeholder="Informe seu CPF"
            value={cpf}
            onChange={(e) => setCpf(formatarCPF(e.target.value))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-name">Nome</Label>
          <Input
            id="register-name"
            type="text"
            placeholder="Informe seu nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)} 
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-sobrenome">Sobrenome</Label>
          <Input
            id="register-sobrenome"
            type="text"
            placeholder="Informe seu sobrenome"
            value={sobrenome}
            onChange={(e) => setSobrenome(e.target.value)} 
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-email">Email</Label>
          <Input
            id="register-email"
            type="email"
            placeholder="Insira seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-password">Senha</Label>
          <Input
            id="register-password"
            type="password"
            placeholder="Insira sua senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-phonenumber">Telefone</Label>
          <Input
            id="register-phonenumber"
            type="text"
            placeholder="Insira seu telefone"
            value={telefone}
            onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
            required
          />
        </div>

      </CardContent>
      <CardFooter>
        <Button onClick={handleSignUp}>Criar conta</Button>
      </CardFooter>
    </Card>
  );
}