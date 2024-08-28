import Link from 'next/link';

function App() {
  return (
    <div className='App'>
      <h1>Página inicial</h1>
      <Link href="/home">
        <button>Ir para home</button>
      </Link><br></br>
      <Link href="/login">
        <button>Ir para login</button>
      </Link>
    </div>
  );
}

export default App;




