import { useRouter } from 'next/navigation';

//Passando o UID via props
interface NavigationProps {
    uid: string | null;
}

export default function Navigation({ uid }: NavigationProps) {
    const router = useRouter();

    //Rota universal de todos os usuários
    const NavegadorHome = () => {
        router.push(`/`);
    };

    //Rotas da tela do Advogado
    const RotasAdvogado = () => {
        const NavegadorPaginaInicial = () => {
            router.push(`/telaAdvogado?uid=${uid}`);
        };
        const NavegadorEnvioArquivo = () => {
            router.push(`/envioArquivo?uid=${uid}`);
        };
        const NavegadorTrabalhosConcluidos = () => {
            router.push(`/TrabalhosConcluidosAdv?uid=${uid}`);
        };
        const NavegadorTrabalhosEmProcesso = () => {
            router.push(`/TrabalhosEmProcessoAdv?uid=${uid}`);
        };
        const NavegadorArquivados = () => {
            router.push(`/ArquivadosAdv?uid=${uid}`);
        };
        return {
            NavegadorPaginaInicial,
            NavegadorEnvioArquivo,
            NavegadorTrabalhosConcluidos,
            NavegadorTrabalhosEmProcesso,
            NavegadorArquivados
        };
    };

    //Rotas da tela da Empresa
    const RotasEmpresa = () => {
        const NavegadorPaginaInicial = () => {
            router.push(`/telaEmpresa?uid=${uid}`);
        };
        const NavegadorCadastrarFuncionario = () => {
            router.push(`/cadastrarFuncionario?uid=${uid}`);
        };
        const NavegadorTrabalhosConcluidos = () => {
            router.push(`/TrabalhosConcluidosAdm?uid=${uid}`);
        };
        const NavegadorTrabalhosEmProcesso = () => {
            router.push(`/TrabalhosEmProcessoAdm?uid=${uid}`);
        };
        const NavegadorArquivados = () => {
            router.push(`/ArquivadosEmpresa?uid=${uid}`);
        };
        return {
            NavegadorPaginaInicial,
            NavegadorCadastrarFuncionario,
            NavegadorTrabalhosConcluidos,
            NavegadorTrabalhosEmProcesso,
            NavegadorArquivados,
        };
    };

    //Rotas tela Funcionário
    const RotasFuncionario = () => {
        const NavegadorPaginaInicial = () => {
            router.push(`/telaFuncionario?uid=${uid}`);
        };
        const NavegadorTrabalhosConcluidos = () => {
            router.push(`/TrabalhosConcluidosFcn?uid=${uid}`);
        };
        return {
            NavegadorPaginaInicial,
            NavegadorTrabalhosConcluidos,
        }
    };

    return { NavegadorHome, RotasAdvogado, RotasEmpresa, RotasFuncionario };
}