import ModalConfirmation from './ModalConfirmation';
import ModalRestoreDocs from './ModalRestoreDocs';
import ModalSendEmployee from './ModalSendEmployee';
import ModalChangeEmployee from './ModalChangeEmployee';
import ModalViewEmployee from './ModalViewEmployee';
import { Badge } from "@/components/ui/badge"
import { useState } from 'react';
import { Check } from 'lucide-react';
import { CircleCheckBig } from 'lucide-react';

export const WorkList = ({ orcamentos, fetchDocumentData, titulo1, titulo2, source, id }) => {

  return (
    <div className="rounded-md overflow-hidden flex-1">
      <div className="border-b p-3 pt-6 bg-background">
        <div className="font-medium">{titulo1}</div>
        <div className="text-muted-foreground text-sm">{titulo2}: {orcamentos.length}</div>
      </div>
      <div className="divide-y">
        {orcamentos.map((Orcamento, index) => (
          <div className="flex items-center gap-3 p-3 hover:bg-[#efefef]" key={index} onClick={() => fetchDocumentData(Orcamento.id)}>
            
            {
              source === 'trabalhosArquivados' ? (
                <div className='h-3 w-3 rounded-full bg-[#e52c2c]' />
              ) : source === 'trabalhosProcesso' ? (
                <div className='h-3 w-3 rounded-full bg-[#3498db]' />
              ) : (
                <div className='h-3 w-3 rounded-full bg-[#e6df30]' />
              )
            }

            <div className="flex items-center w-full p-3 hover:cursor-pointer">
              <h1 className="cursor-pointer text-blue-500">
                <div>{Orcamento.Titulo}</div>
                {source === 'advogado' ? (
                  <div className="text-muted-foreground text-sm">
                      {Orcamento.Email}
                  </div>
                ) : (
                  <div className="text-muted-foreground text-sm">
                      {Orcamento.Nome} {Orcamento.Sobrenome}
                  </div>
                )}
              </h1>
              
              <div className="ml-auto flex items-center space-x-6">
              {Orcamento.Status === "Aprovado" && source === "empresa" && (
                  <ModalSendEmployee
                    id={id}
                    dd={Orcamento}
                  />
                )}
              {source == "trabalhosProcessoAdm" && (
                <ModalChangeEmployee
                  id={id}
                  dd={Orcamento}
                />
              )}
              {source == "trabalhosProcessoAdv" && (
                <ModalViewEmployee 
                  id={id} 
                />
              )}

                {/* <badge className="text-[#438d5f] dark:bg-[#bbf7d0] px-2 py-1 rounded-md"> */}
                  <h1 className="text-xs font-semibold">{Orcamento.Status}</h1>
                {/* </badge>
                <CircleCheckBig className='h-4 w-4 inline-block mr-2 align-top' /> */}

                { 
                source === 'advogado' && Orcamento.Status != 'Aprovado' ? (
                    <ModalConfirmation 
                      dd={Orcamento}
                      source="advogado"
                      titulo='Confirmar Arquivamento'
                      descricao='Deseja arquivar o documento'
                      nomeBtn='Arquivar'
                    />
                ) : 
                source === 'trabalhosArquivados' ? (
                  <>
                    <ModalRestoreDocs 
                      dd={Orcamento}
                      cpf={Orcamento.cpfAdvogado}
                      nome={Orcamento.Nome}
                      sobrenome={Orcamento.Sobrenome}
                      email={Orcamento.Email}
                      telefone={Orcamento.Telefone}
                      id={Orcamento.id}
                    />
                    <ModalConfirmation 
                      dd={Orcamento} 
                      source="arquivadosEmpresa"
                      titulo='Deletar Documento'
                      descricao='Deseja excluir permanentemente o documento'
                      nomeBtn='Deletar'
                    />
                  </>
                  ) : null
                }
              </div>
            </div>
          </div>
        ))} 
      </div>
    </div>
  );
};
