// import { app } from "./firebase";
// import { collection, getFirestore, onSnapshot, query } from "firebase/firestore";
// import { useState, useEffect } from "react";

// const db = getFirestore(app);

// export default function Advogado() {
//     const [advogados, setAdvogados] = useState([]);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const q = query(collection(db, "Advogado"));

//         const unsub = onSnapshot(q, (querySnapshot) => {
//             const itens = [];
//             querySnapshot.forEach((doc) => {
//                 itens.push(doc.data());
//             });
//             setAdvogados(itens);
//             setLoading(false);
//         });

//         return () => {
//             unsub();
//         };
//     }, []);

//     if (loading) {
//         return <div>Loading...</div>;
//     }

    // return (
    //     <div>
    //         <h1>Lista de Advogados</h1>
    //         <ul>
    //             {advogados.map((advogado, index) => (
    //                 <li key={index}>{advogado.Nome}</li>
    //             ))}
    //         </ul>
    //     </div>
    // );


// export {Advogado}
