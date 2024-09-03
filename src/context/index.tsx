import { createContext, useContext, useState } from "react";

type AppState = {
    email: string;
    cpf: string;
    setEmail: (email: string) => void;
    setCpf: (cpf: string) => void;
};

const AppContext = createContext<AppState | undefined>(undefined);

export function AppWrapper({ children }: { children: React.ReactNode }) {
    //Define dois estados locais de email e cpf
    const [email, setEmail] = useState<string>("");
    const [cpf, setCpf] = useState<string>("");

    return (
        //Retorna um provider, permitindo que todos os componentes dentro dele acessem os valores de email, cpf, setEmail e setCpf
        <AppContext.Provider value={{ email, cpf, setEmail, setCpf }}>
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    const context = useContext(AppContext);
    if (context === undefined) {
    }
    return context;
}
