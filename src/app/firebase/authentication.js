import { app } from "./firebase";
import { signInWithEmailAndPassword, getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { addDoc, collection, getFirestore } from "firebase/firestore";

const auth = getAuth(app);
const db = getFirestore(app);


// Função do LOGIN - confirir dados
//------------------------------------------------------------------------------------------------------------------------------------
const loginComEmailESenha = async (email, senha) => {
  try {
      const userCredential =  await signInWithEmailAndPassword(auth, email, senha);
      return userCredential;  // Retorna o objeto de credenciais do usuário em caso de sucesso
  } catch (error) {
      throw error;  // Lança o erro para ser capturado na função que chamou essa
  }
};


// Função do REGISTRO - enviar os dados
//------------------------------------------------------------------------------------------------------------------------------------
const registrarComEmailESenha = async (cpf, nome, sobrenome, email, senha, telefone) => {
    try {   
        console.log(cpf, nome, sobrenome, email, senha, telefone)
        const res = await createUserWithEmailAndPassword(auth, email, senha);
        const user = res.user;
        
        // Lança os dados para o banco na tabela "Advogado"
        await addDoc(collection(db, "Advogado"), {
            uid: user.uid,
            authProvider: 'local',
            cpf,
            email,
            nome,
            senha,
            telefone,
            sobrenome,
        });
   
    } catch (error) {
        console.error("Erro ao registrar usuário:", error.message);
        throw error; //Faz com que o erro do email ja cadastrado seja lançado e capturado na função handleSignUp no page.tsx.
    }
}


//Export de funções
export { auth, registrarComEmailESenha, loginComEmailESenha, db};
