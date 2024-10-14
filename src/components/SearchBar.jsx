import { RotateCw } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const SearchBar = ({ handleRefresh, primeiraLetra }) => {
  return (
    <header className="flex items-center gap-2 p-4 border-b">
      <div className="flex-1">
        <Input type="search" placeholder="Pesquisar trabalhos" className="rounded-50" />
      </div>
      <Button variant="ghost" size="icon" onClick={handleRefresh}>
        <RotateCw className="w-5 h-5" />
      </Button>
      <Avatar className="h-9 w-9">
        <AvatarFallback>{primeiraLetra}</AvatarFallback>
      </Avatar>
    </header>
  );
};
