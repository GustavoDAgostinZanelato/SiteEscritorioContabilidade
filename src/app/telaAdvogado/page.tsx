"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, getFirestore } from "firebase/firestore";
import { app } from '../firebase/firebase'; 
import Link from 'next/link';


const db = getFirestore(app);


const TelaAdvogado = () => {
    const searchParams = useSearchParams();
    const email = searchParams.get('email');
    const [nome, setNome] = useState('');
    const [cpf, setCpf] = useState('')
    const [loading, setLoading] = useState(true); 

    useEffect(() => {
        const fetchNome = async () => {
            setLoading(true); // Inicia o carregamento
            try {
                console.log("Buscando o nome do advogado para o email:", email);
                const q = query(collection(db, "Advogado"), where("email", "==", email));
                const querySnapshot = await getDocs(q);
                
                if (!querySnapshot.empty) {
                    console.log("Documento encontrado:", querySnapshot.docs[0].data());
                    const advogadoData = querySnapshot.docs[0].data();
                    setNome(advogadoData.nome);
                    setCpf(advogadoData.cpf);
                } else {
                    console.error("Advogado não encontrado!");
                    setNome('Advogado não encontrado'); // Mensagem se não encontrado
                }
            } catch (error) {
                console.error("Erro ao buscar o nome do advogado:", error);
                setNome('Erro ao carregar nome'); // Mensagem de erro
            } finally {
                setLoading(false); // Finaliza o carregamento
            }
        };

        if (email) {
            fetchNome();
        }
    }, [email]);

    return (
        <>
            {loading ? ( // Verifica se está carregando
                <h1>Carregando...</h1> // Mensagem de carregamento
            ) : (
                <h1>Bem-vindo, {nome}</h1> // Nome do advogado
            )}
            <br />
            <Link href={`/envioArquivo?cpf=${encodeURIComponent(cpf)}`}>
                <button>Anexar arquivos</button>
            </Link>
        </>
    );
};

export default TelaAdvogado;