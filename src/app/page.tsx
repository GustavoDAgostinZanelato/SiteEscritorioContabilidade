"use client";

import Link from 'next/link';

function App() {
  return (
    <>
      <h1>Página inicial</h1>
      <br/>

      <>
        <Link href="/home">
          <button>Ir para home</button>
        </Link>
        <br/>
      </>

      <>
        <Link href="/login">
          <button>Login</button>
        </Link>
        <br/>
      </>
    </>
  );
}

export default App;
