"use client";

import { Send } from 'lucide-react';
import { app } from '../firebase/firebase';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import SendArchive from '@/components/SendArchive';
import { SearchBar } from '@/components/SearchBar';
import SideBarLayout from '@/components/SideBarLayout';
import DocumentFilter from '@/components/DocumentFilter';
import Navigation from '@/components/navigation/navigation';
import { collection, query, where, getDocs, getFirestore } from "firebase/firestore";

const db = getFirestore(app);

export default function EnvioArquivo() {
    //Puxando o ID do Advogado da URL
    const searchParams = useSearchParams();
    const uid = searchParams.get('uid');
    // Inicializando o componente de navegação
    const { NavegadorHome, RotasAdvogado } = Navigation({ uid });
    const { NavegadorPaginaInicial, NavegadorEnvioArquivo, NavegadorTrabalhosConcluidos, NavegadorTrabalhosEmProcesso, NavegadorArquivados } = RotasAdvogado();
    //Informações do Advogado
    const [nome, setNome] = useState('');
    const primeiraLetra = nome.slice(0, 2);
    //Filtro de pesquisa
    const [exibirFiltro, setExibirFiltro] = useState(false);
    //Extra
    const [loading, setLoading] = useState(true); 


    // Função para recarregar a página
    const handleRefresh = () => {
        window.location.reload();
    };

    useEffect(() => {
        const fetchNome = async () => {
            setLoading(true); //Inicia o carregamento
            try {
                //Pega as informações do Advogado com base no ID da URL
                const q = query(collection(db, "Advogado"), where("uid", "==", uid)); //Pega os dados da coleção "Advogado" com base no ID
                const querySnapshot = await getDocs(q); //Executa a consulta e retorna um snapshot contendo os documentos que correspondem à condição

                //Pega os arquivos no Banco de Dados caso querySnapshot não esteja vazio
                if (!querySnapshot.empty) {
                    const advogadoData = querySnapshot.docs[0].data();
                    setNome(advogadoData.nome);         
                } else {
                    console.error("Advogado não encontrado!");
                }
            } catch (error) {
                console.error("Erro ao buscar o nome do advogado:", error);
                setNome('Erro ao carregar nome'); //Caso o nome do advogado não seja obtido, a mensagem é exibida no lugar da variável 'nome'
            } finally {
                setLoading(false); //Finaliza o estado de carregamento, independentemente da consulta ser um sucesso ou falhar
            }
        };
        if (uid) {
            fetchNome(); //Chama a função fetchNome(), que está dentro do hook. Ela pega informações do Firebase
        }
    }, [uid]); //Sempre que a variável 'uid' mudar, o useEffect será executado, pois ela está listada nas dependências do hook

    return(
    <>
        <div className="flex flex-col h-screen bg-[#E6F3F0]">
            <SearchBar handleRefresh={handleRefresh} onHome={NavegadorHome} primeiraLetra={primeiraLetra}>
                {exibirFiltro && ( //Exibe somente se exibirFiltro === true
                    <DocumentFilter 
                        orcamentos={[]} //Passando arrays vazios pois essa tela não possuem os valores que satisfazem a função 
                        onFilterChange={() => {}}
                        source="cadastrarFuncionario"
                    />
                )}
            </SearchBar>
            <div className="flex overflow-hidden">
                <SideBarLayout 
                onRefresh={handleRefresh}
                primeiraLetra={primeiraLetra}
                loading={loading}
                DescricaoBtn1="Solicitar Orçamento"
                DescricaoBtn2="Arquivados"
                source='advogado'
                cadastrarFuncionarioIcon={<Send className="w-5 h-5"/>}
                onHome={NavegadorHome}
                onPaginaInicial={NavegadorPaginaInicial}
                onEnvioArquivo={NavegadorEnvioArquivo}
                onTrabalhosConcluidos={NavegadorTrabalhosConcluidos}
                onTrabalhosEmProcesso={NavegadorTrabalhosEmProcesso}
                onArquivados={NavegadorArquivados}

                onCadastrarFuncionario={NavegadorHome} //rota propria da empresa e que nao será usada aqui, por isso mandando qualquer caminho
                />
                <div className="flex flex-grow justify-center items-center">
                    <SendArchive />       
                </div>
            </div>  
        </div> 
    </>  
    )
}