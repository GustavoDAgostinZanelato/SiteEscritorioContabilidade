"use client"; // Indica que o código será executado no lado do cliente (navegador) em um ambiente React

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { registrarComEmailESenha, loginComEmailESenha } from "../firebase/authentication";

export default function Login() { 
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  // Função handleLogin para login
  const handleLogin = async () => {
    try {
      await loginComEmailESenha(email, senha);
      alert("Login realizado com sucesso!");

    } catch (error) {
      const firebaseError = error as { code: string; message: string };

      // Alert caso alguma credencial esteja errada
      if (
        firebaseError.code === 'auth/user-not-found' ||
        firebaseError.code === 'auth/wrong-password' ||
        firebaseError.code === 'auth/invalid-credential'
      ) {
        alert("Email ou senha incorretos. Verifique suas credenciais e tente novamente.");
      } else {
        alert("Preencha todos os campos para prosseguir");
      }

      console.error("Erro ao fazer login:", firebaseError);
    }
  };

  // Barra de Navegação entre "Entrar" e "Criar conta"
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Tabs defaultValue="login" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Entrar</TabsTrigger> 
          <TabsTrigger value="register">Criar conta</TabsTrigger>
        </TabsList>

        {/* Aba ENTRAR */}
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

        {/* Aba CRIAR CONTA */}
        <TabsContent value="register"> 
          <SignUp /> 
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SignUp() {
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [telefone, setTelefone] = useState("");

  // Função handleSignUp para criar conta
  const handleSignUp = async () => {
    try {

      if (cpf.length === 0 && email.length === 0 && nome.length === 0 && senha.length === 0 && telefone.length === 0) {
        alert("Preencha todos os campos para prosseguir.");
        return;
      }

      if (senha.length < 6) {
        alert("A senha deve ter pelo menos 6 caracteres.");
        return;
      }
      await registrarComEmailESenha(cpf, nome, email, senha, telefone);
      alert("Usuário registrado com sucesso!");

    } catch (error) {
      const firebaseError = error as { code: string; message: string };

      if (firebaseError.code === 'auth/email-already-in-use') {
        alert("Este e-mail já está em uso. Tente fazer login ou use outro e-mail.");
      } else {
        alert("Preencha todos os campos para prosseguir.");
      }
      console.error("Erro ao registrar usuário:", firebaseError);
    }
  };
  
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
            onChange={(e) => setCpf(e.target.value)}
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
          <Label htmlFor="register-name">Nome</Label>
          <Input
            id="register-name"
            type="text"
            placeholder="Informe seu nome completo"
            value={nome}
            onChange={(e) => setNome(e.target.value)} 
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
            onChange={(e) => setTelefone(e.target.value)}
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
