"use client";

import { useEffect, useState } from 'react';
import { UsersRound } from 'lucide-react';
import { app } from '../firebase/firebase'; 
import { useSearchParams } from 'next/navigation';
import { SearchBar } from '@/components/SearchBar';
import SideBarLayout from '@/components/SideBarLayout';
import DocumentFilter from '@/components/DocumentFilter';
import CadastroEmployee from '@/components/CadastroEmployee';
import { collection, query, where, getDocs, getFirestore} from "firebase/firestore";
import Navigation from '@/components/navigation/navigation';

const db = getFirestore(app);

export default function CadastrarFuncionario() {
    //Puxando o ID do usuário pela URL
    const searchParams = useSearchParams();
    const uid = searchParams.get('uid');
    //Informações do usuário conectado
    const [nome, setNome] = useState('');
    const primeiraLetra = nome.slice(0, 2);
    // Inicializando o componente de navegação
    const { NavegadorHome, RotasEmpresa } = Navigation({ uid });
    const { NavegadorPaginaInicial, NavegadorCadastrarFuncionario, NavegadorTrabalhosConcluidos, NavegadorTrabalhosEmProcesso, NavegadorArquivados } = RotasEmpresa();
    //Filtro de pesquisa
    const [exibirFiltro, setExibirFiltro] = useState(false);
    //Extras
    const [loading, setLoading] = useState(true); 

    interface DocumentData {
        CaminhoArquivo: string;
        DataEntrega: string;
        DataEnvio: string;  
        Descricao: string;
        Email: string;
        Nome: string;
        Sobrenome: string;
        Status: string;
        Telefone: string;
        Titulo: string;
        cpfAdvogado: string;
        cpfEmpresa: string;
        id: string;
    };
    type DocumentDataEncapsulamento =  {
        data: DocumentData,
        docId: string,
    }

    // Função para o botão de recarregar a página
    const handleRefresh = () => {
        window.location.reload();
    };
  
    //Hook com as consultas nas coleções Empresa e Orcamento
    useEffect(() => {
        const fetchInfo = async () => {
            setLoading(true); // Inicia o estado de carregamento
            try {
                //Pega as informações do ADM com base no ID da URL
                const q = query(collection(db, "Empresa"), where("uid", "==", uid));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const empresaData = querySnapshot.docs[0].data();
                    setNome(empresaData.nome);
                } else {
                    console.error("Usuário não encontrados");
                }
            } catch (error) {
                setNome('Erro ao carregar nome'); //Transforma a variável "nome" na mensagem: "Erro ao carregar nome"
            } finally {
                setLoading(false); //Finaliza o estado de carregamento, independentemente da consulta ser um sucesso ou falhar
            }
        };
        if (uid) {
            fetchInfo(); //Chama a função fetchNome(), que está dentro do hook. Ela pega informações do Firebase
        }
    }, [uid]); //Sempre que a variável 'uid' mudar, o useEffect será executado, pois ela está listada nas dependências do hook
  
    return(
        <div className="flex h-screen bg-[#2B3C56] overflow-hidden">
            <SideBarLayout 
                onRefresh={handleRefresh}
                primeiraLetra={primeiraLetra}
                loading={loading}
                DescricaoBtn1="Cadastrar Funcionário"
                DescricaoBtn2="Recusados"
                source='empresa'
                cadastrarFuncionarioIcon={<UsersRound className="h-5 w-5" />}
                onHome={NavegadorHome}
                onPaginaInicial={NavegadorPaginaInicial}
                onCadastrarFuncionario={NavegadorCadastrarFuncionario}
                onTrabalhosConcluidos={NavegadorTrabalhosConcluidos}
                onTrabalhosEmProcesso={NavegadorTrabalhosEmProcesso}
                onArquivados={NavegadorArquivados}

                onEnvioArquivo={NavegadorHome} //rota propria do advogado e que nao será usada aqui, por isso mandando qualquer caminho
            />
            <div className="flex flex-grow justify-center items-center">
                <CadastroEmployee />      
            </div>
        </div>  
    )
}