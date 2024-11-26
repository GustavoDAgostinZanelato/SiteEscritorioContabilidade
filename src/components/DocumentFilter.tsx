import { X } from 'lucide-react';
import { Filter } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";

interface Orcamento {
  id: string;
  status: string;
}

interface DocumentFilterProps {
  orcamentos: Orcamento[];
  source: string;
  onFilterChange: (filteredOrcamentos: Orcamento[]) => void;
}

const DocumentFilter: React.FC<DocumentFilterProps> = ({ orcamentos, source, onFilterChange }) => {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  //Opções de filtros disponíveis
  const filterOptions = source === 'funcionario' 
  ? [
      { id: "Nenhum", label: "Nenhum"},
      { id: "Aprovado", label: "Aprovado" },
    ] 
    : source === 'concluidosFnc'
    ? [
        { id: "Aguardando Pagamento", label: "Aguardando Pagamento" },
        { id: "Concluído", label: "Concluído" },
        { id: "Revisar", label: "Enviado para Revisão" }
      ]
    : source === 'empresa'
    ? [
        { id: "Aguardando Resposta", label: "Doc Recebido" },
        { id: "Aprovado", label: "Aprovado" },
        { id: "Resposta Recebida", label: "Resposta Enviada" }
      ]
    : source === 'ConcluidosAdm'
    ? [
        { id: "Concluído", label: "Concluído" },
        { id: "Aguardando Pagamento", label: "Aguardando Pagamento" },
        { id: "Revisar", label: "Revisar" }
      ]
    : source === 'EmAndamentoAdm'
    ? [
        { id: "Nenhum", label: "Nenhum"},
        { id: "Aprovado", label: "Em Andamento" },
      ]
    : source === 'ArquivadosAdm'
    ? [
        { id: "Nenhum", label: "Nenhum"},
        { id: "Recusado", label: "Recusado" },
      ]
    : source === 'advogado'
    ? [
        { id: "Aguardando Resposta", label: "Aguardando Aprovação"},
        { id: "Resposta Recebida", label: "Resposta Recebida" },
        { id: "Aprovado", label: "Aprovado"},
        { id: "Recusado", label: "Recusado" },
      ]
    : source === 'trabalhosConcluidosAdv'
    ? [
        { id: "Concluído", label: "Concluído"},
        { id: "Aguardando Pagamento", label: "Aguardando Pagamento" },
      ]
    : source === 'trabalhosProcessoAdv'
    ? [
        { id: "Nenhum", label: "Nenhum"},
        { id: "Aprovado", label: "Em Andamento" },
      ]
    : source === 'trabalhosArquivados'
    ? [
        { id: "Recusado pelo Escritório", label: "Recusado pelo Escritório"},
        { id: "Arquivado", label: "Arquivado" },
      ]    
    : [
        { id: "teste", label: "teste" },
      ];

  useEffect(() => {
    setSelectedFilters([]); //Limpa os filtros sempre que a página for carregada
    onFilterChange(orcamentos); //Exibe todos os documentos sem filtro
  }, [orcamentos]); 


  const handleFilterChange = (filterId: string) => {
    setSelectedFilters((prevFilters) => {
      const newFilters = prevFilters.includes(filterId)
        ? prevFilters.filter((id) => id !== filterId) //Remove o filtro se já estiver ativo
        : [...prevFilters, filterId]; //Adiciona o filtro
      //Filtra os documentos com base nos filtros selecionados
      const filteredOrcamentos =
        newFilters.length > 0
          ? orcamentos.filter((orcamento: any) =>
              newFilters.includes(orcamento.Status)
            )
          : orcamentos; //Exibe todos os documentos se não houver filtros ativos

      onFilterChange(filteredOrcamentos);
      return newFilters;
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" >
              <Filter className="mr-2 h-4 w-4" />
              Filtrar Status 
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            {filterOptions.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.id}
                checked={selectedFilters.includes(option.id)}
                onCheckedChange={() => handleFilterChange(option.id)}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {selectedFilters.length > 0 && (
          <div className="w-full flex">
            
            {selectedFilters.map((filterId) => (
              <Button
                key={filterId}
                variant="secondary"
                size="sm"
                onClick={() => handleFilterChange(filterId)}
                className="mr-2"
              >
                {filterOptions.find((option) => option.id === filterId)?.label}
                <span className="ml-2">
                  <X className="w-4 h-4 "/>
                </span>
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentFilter;
