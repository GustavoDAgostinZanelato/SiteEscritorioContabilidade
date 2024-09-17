"use client";

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import SvgComponentEscuro from "@/components/ui/logoEscuro";
import { LogIn } from 'lucide-react';


export default function App() {
  return (
    <>
      <div className='flex justify-between items-center p-5 bg-gray-200 bg-primary'>
      <div className='pl-4' >
        <SvgComponentEscuro/>
      </div>
      <Link href="/login">
        <Button variant="outline">
          <LogIn className='h-6 w-6'/>
          <h1 className='pl-3'>Entrar</h1>
        </Button>
      </Link>
      </div>  
    </>
  );
}