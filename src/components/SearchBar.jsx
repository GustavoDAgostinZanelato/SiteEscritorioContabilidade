import { RotateCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import SvgComponentClaroSimples from "@/components/ui/logoClaroSimples";

export const SearchBar = ({ handleRefresh, primeiraLetra , onHome, children }) => {
  return (
    <header className="flex h-[80px] items-center gap-4 border-b bg-[#fff] w-full p-[24px] shadow">
        <button className="mt-1 mr-2" onClick={onHome}>
          <SvgComponentClaroSimples />
        </button>
        <div className="flex-1 w-full pl-[7%]">
          <div className='w-[10%]'>
            {children}
          </div>
        </div>
          <Button variant="ghost" size="icon" onClick={handleRefresh}>
            <RotateCw className="w-5 h-5" color="#2b3c56" />
          </Button>
          <Avatar className="h-9 w-9" >
            <AvatarFallback>{primeiraLetra}</AvatarFallback>
          </Avatar>
    </header>
  );
};
