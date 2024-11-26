import { RotateCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import SvgComponentClaro from "@/components/ui/logoClaro";

export const SearchBar = ({ handleRefresh, primeiraLetra , onHome, children, source }) => {
  return (
    <>
      {source === 'empresa' ? (
        <>
        <header className="flex h-[80px] items-center gap-4 border-b bg-[#fff] w-full pl-[12px] pr-[24px]" style={{ boxShadow: "2px 0 12px rgba(0, 0, 0, 0.4)" }}>
          <div className="flex w-full">
            <div className='w-[10%]'>
              {children}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleRefresh}>
            <RotateCw className="w-5 h-5 mr-1" color="#2b3c56" />
          </Button>
          <Avatar className="h-12 w-12" >
            <AvatarFallback className='font-semibold text-[#2B3C56]'>{primeiraLetra}</AvatarFallback>
          </Avatar>
        </header>
        </>
      ) : (
        <>
        <header className="flex h-[80px] items-center gap-4 border-b bg-[#fff] w-full p-[24px]" style={{ boxShadow: "2px 0 12px rgba(0, 0, 0, 0.4)" }}>
          <button className="mt-1  ml-2" onClick={onHome}>
            <SvgComponentClaro />
          </button>
          <div className="flex-1 w-full pl-[24px]">
            <div className='w-[10%]'>
              {children}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleRefresh}>
            <RotateCw className="w-5 h-5" color="#2b3c56" />
          </Button>
          <Avatar className="h-12 w-12" >
            <AvatarFallback className='font-semibold text-[#2B3C56]'>{primeiraLetra}</AvatarFallback>
          </Avatar>
        </header>
        </>
      )}
      </>
    
  );
};