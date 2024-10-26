import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { VisualizadorPDF } from '@/components/VisualizadorPDF';
import { VisualizadorPDFadv } from '@/components/VisualizadorPDFadv';
import { useEffect, useState } from 'react';

export const WorkDetails = ({ documentData, loading, cpf, primeiraLetra, nome, sobrenome, email, id, source, resposta }) => {

  if (loading) {
    return <br />;
  }
  
  return (
    <div className="bg-muted rounded-md overflow-hidden flex-1">
      <div className="border-b p-3 bg-background">
        <div className="font-medium pb-14"/>
      </div>
      <div className="p-4 flex flex-col gap-4">
        {documentData ? (
          <>
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback>{documentData.data.Nome ? documentData.data.Nome.slice(0, 2) : ''}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-medium">{documentData.data.Nome} {documentData.data.Sobrenome}</div>
                <div className="text-muted-foreground text-sm">{documentData.data.Email}</div>
              </div>
              <div className="text-muted-foreground text-sm">{documentData.data.DataEnvio}</div>
            </div>
            <div className="prose">
              <p className="pb-5 pt-6">{documentData.data.Descricao}</p>
              <p className="text-muted-foreground text-sm pb-6">Prazo de Entrega: {documentData.data.DataEntrega}</p>
              
            
              {documentData && (
                source === 'advogado' ? (
                  <VisualizadorPDFadv 
                    documentData={documentData.data} 
                    cpf={cpf} 
                    id={documentData.docId} 
                  />
                ) : source === 'empresa' ? (
                  <VisualizadorPDF 
                    documentData={documentData.data} 
                    cpf={cpf} 
                    id={documentData.docId}
                    nomeBotao="Visualizar e Aprovar Documento"
                  />
                ) : (
                  <VisualizadorPDF 
                    documentData={documentData.data} 
                    cpf={cpf} 
                    id={documentData.docId}
                    nomeBotao="Visualizar Documento"
                  />
                )
              )}
              
              {/* <p className="mt-10 font-medium">Funcionário(s) Escalados pro Trabalho</p>
              {documentData.data.cpfsFuncionarios.map((cpf, index) => (
                <p key={index} className="mt-2">{cpf}</p>
              ))} */}
              {/* <p className="mt-10 font-medium">Funcionário(s) Escalados pro Trabalho</p>
              {funcionarios.length > 0 ? (
                funcionarios.map((funcionario, index) => (
                  <p key={index} className="mt-2">{funcionario.nome} ({funcionario.cpf})</p>
                ))
              ) : (
                <p className="mt-2">Nenhum funcionário encontrado</p>
              )} */}

            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback>{primeiraLetra}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-medium">{nome} {sobrenome}</div>
                <div className="text-muted-foreground text-sm">{email}</div>
              </div>
            </div>
            <h1 className="text-muted-foreground text-sm">Abra um documento para ver mais detalhes</h1>
          </>
        )}
      </div>
    </div>
  );
};