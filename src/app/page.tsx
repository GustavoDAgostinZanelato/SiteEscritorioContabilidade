"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SvgComponentEscuro from "@/components/ui/logoEscuro";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { registrarComEmailESenha, loginComEmailESenha } from "../app/firebase/authentication";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../app/firebase/firebase"; 

// Aba LOGIN
export default function Login() { 

  // Lógica para o Login do usuário
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [uid, setUid] = useState('');
  const router = useRouter(); 

  async function fetchId() {
    //Pega o ID do advogado do BD
    if (email) {
      const q = query(collection(db, "Advogado"), where("email", "==", email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
          const advogadoDoc = querySnapshot.docs[0];
          const advogadoData = advogadoDoc.data();
          setUid(advogadoData.uid); 
      }
    }
    //Pega o ID da empresa do BD
    if (email) {
      const q = query(collection(db, "Empresa"), where("email", "==", email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
          const empresaDoc = querySnapshot.docs[0];
          const empresaData = empresaDoc.data();
          setUid(empresaData.uid); 
      }
    }
    //Pega o ID do funcionario do BD
    if (email) {
      const q = query(collection(db, "Funcionarios"), where("email", "==", email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
          const empresaDoc = querySnapshot.docs[0];
          const empresaData = empresaDoc.data();
          setUid(empresaData.uid); 
      }
    }
  }
  fetchId();

  // Função para verificar usuário na coleção
  const verificarUsuario = async (email: string, colecao: string) => {
    const q = query(collection(db, colecao), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data(); // Retorna os dados do usuário encontrado
    }
    return null; // Retorna null se o email não for encontrado
  };

  const handleLogin = async () => {
    try {

      // Verifica se os campos estão preenchidos
      if (email.length === 0 || senha.length === 0) {
        alert("Preencha todos os campos para prosseguir.");
        return;
      }

      // Verifica se o email está na coleção Advogado
      const usuarioAdvogado = await verificarUsuario(email, "Advogado");
      if (usuarioAdvogado && usuarioAdvogado.senha === senha) {
        router.push(`/telaAdvogado?uid=${uid}`);
        return;
      }

      // Verifica se o email está na coleção Empresa
      const usuarioEmpresa = await verificarUsuario(email, "Empresa");
      if (usuarioEmpresa && usuarioEmpresa.senha === senha) {
        router.push(`/telaEmpresa?uid=${uid}`);
        return;
      }

      // Verifica se o email está na coleção Empresa
      const usuarioFuncionario = await verificarUsuario(email, "Funcionarios");
      if (usuarioFuncionario && usuarioFuncionario.senha === senha) {
        router.push(`/telaFuncionario?uid=${uid}`);
        return;
      }
      
      await loginComEmailESenha(email, senha); // Verifica credenciais no sistema de autenticação Firebase

    } catch (error) {
        alert("Email ou senha incorretos. Verifique suas credenciais e tente novamente.");
    }
  };

  // Barra de Navegação entre "Entrar" e "Criar conta"
  return (
    <>
    <div className='flex justify-between items-center bg-[#2B3C56]'>
      <div className='p-5' >
        <SvgComponentEscuro/>
      </div>
    </div>  
    
    <div className=" flex flex-col items-center mt-[4%]">
      <Tabs defaultValue="login" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2 bg-[#F0F4F8] shadow-md">
          <TabsTrigger value="login" className="text-[#2B3C56] text-[12px]">Entrar</TabsTrigger> 
          <TabsTrigger value="register" className="text-[#2B3C56] text-[12px]">Criar conta</TabsTrigger>
        </TabsList>
  
        <TabsContent value="login">
          <Card className='bg-[#F0F4F8] shadow-md border-none'>
            <CardHeader>
              <CardTitle className='text-[26px] font-bold text-[#2b3c56]'>Bem-vindo(a)</CardTitle>
              <CardDescription className='text-[#53647C] text-[12px] font-semibold'>Entre na sua conta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[#2B3C56] text-[12px] font-bold mb-2">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="Digite seu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 placeholder:text-gray-400 placeholder:text-base, text-[12px]"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#2B3C56] text-[12px] font-bold mb-2">Senha</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 placeholder:text-gray-400 placeholder:text-base, text-[12px]"
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button className="bg-[#007259] text-[#fff] hover:bg-[#005c47]" onClick={handleLogin}>Entrar</Button>
            </CardFooter>
          </Card>
        </TabsContent>
  
        <TabsContent value="register"> 
          <SignUp  /> 
        </TabsContent>

      </Tabs>
    </div>
    </>
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

  //Pega o ID do advogado do BD e redireciona o usuario para a /telaAdvogado
  async function fetchId() {
    if (email) {
      const q = query(collection(db, "Advogado"), where("email", "==", email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
          const advogadoDoc = querySnapshot.docs[0];
          const advogadoData = advogadoDoc.data();
          const uid = advogadoData.uid; // Obtenha o uid 
          router.push(`/telaAdvogado?uid=${uid}`);
      }
    }
  } 
  
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

      // Verifica o tamanho do cpf
      if (cpf.length < 14) {
        alert("CPF inválido.");
        return;
      }

      //Verifica o tamanho do telefone
      if (telefone.length < 14) {
        alert("Número de telefone inválido.");
        return
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
      alert("Conta criada com sucesso!");
      fetchId()
    } catch (error) {
      console.log("Erro ao criar nova conta")
    };
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

  return (
    <Card className="bg-[#F0F4F8] shadow-md border-none">
      <CardHeader>
        <CardTitle className="text-[#2B3C56] text-[26px] font-bold">Registro de Usuário</CardTitle>
        <CardDescription className="text-[#53647C] text-[12px] font-semibold">Crie uma nova conta seguindo os campos abaixo</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">

        <div className="flex">
            <div className="space-y-2 w-1/2 mr-2">
              <Label className="text-[#2B3C56] text-[12px] font-bold">Nome</Label>
              <Input
                id="register-name"
                type="text"
                placeholder="Informe seu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)} 
                className="w-full border border-gray-300 rounded-md p-2 placeholder:text-gray-400 placeholder:text-base, text-[12px]"
                required
              />
            </div>
            <div className="space-y-2 w-1/2 ml-2">
              <Label className="text-[#2B3C56] text-[12px] font-bold">Sobrenome</Label>
              <Input
                id="register-sobrenome"
                type="text"
                placeholder="Informe seu sobrenome"
                value={sobrenome}
                onChange={(e) => setSobrenome(e.target.value)} 
                className="w-full border border-gray-300 rounded-md p-2 placeholder:text-gray-400 placeholder:text-base, text-[12px]"
                required
              />
            </div>
          </div>
          <div className="flex">
            <div className="space-y-2 w-1/2 mr-2">
              <Label className="text-[#2B3C56] text-[12px] font-bold">Email</Label>
              <Input
                id="register-email"
                type="email"
                placeholder="Insira seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 placeholder:text-gray-400 placeholder:text-base, text-[12px]"
                required
              />
             </div>
            <div className="space-y-2 w-1/2 ml-2">
              <Label className="text-[#2B3C56] text-[12px] font-bold">Senha</Label>
              <Input
                id="register-password"
                type="password"
                placeholder="Insira sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 placeholder:text-gray-400 placeholder:text-base, text-[12px]"
                required
              />
            </div>
          </div>
          <div className="flex">
            <div className="space-y-2 w-1/2 mr-2">
              <Label className="text-[#2B3C56] text-[12px] font-bold">CPF</Label>
              <Input
                id="register-cpf"
                type="text"
                placeholder="Informe seu CPF"
                value={cpf}
                onChange={(e) => setCpf(formatarCPF(e.target.value))}
                className="w-full border border-gray-300 rounded-md p-2 placeholder:text-gray-400 placeholder:text-base, text-[12px]"
                required
              />
            </div>
            <div className="space-y-2 w-1/2 ml-2">
              <Label className="text-[#2B3C56] text-[12px] font-bold">Telefone</Label>
              <Input
                id="register-phonenumber"
                type="text"
                placeholder="Insira seu telefone"
                value={telefone}
                onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
                className="w-full border border-gray-300 rounded-md p-2 placeholder:text-gray-400 placeholder:text-base, text-[12px]"
                required
              />
            </div>
          </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Button className="bg-[#007259] text-[#fff] hover:bg-[#005c47]" onClick={handleSignUp}>Criar conta</Button>
      </CardFooter>
    </Card>
  );
}