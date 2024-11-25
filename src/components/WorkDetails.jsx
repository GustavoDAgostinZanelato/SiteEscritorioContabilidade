import { VisualizadorPDF } from '@/components/VisualizadorPDF';
import { VisualizadorPDFadv } from '@/components/VisualizadorPDFadv';
import { VisualizadorPDFFcn } from '@/components/VisualizadorPDFFcn';
import { Tag } from 'lucide-react';

export const WorkDetails = ({ documentData, loading, cpf, source }) => {

  if (loading) {
    return <br />;
  }
  
  return (
    <div className="bg-[#fff] rounded-lg overflow-hidden flex-1">
      <div className="p-5 flex flex-col gap-4">
        {documentData ? (
          <>
            <div className="relative flex items-center gap-3">
              <div className="flex-1">
                <div className="font-bold text-[28px] text-[#2B3C56] max-w-[500px]">{documentData.data.Titulo}</div>
              </div>
              <div className={`absolute top-0 right-0 px-2 py-1 rounded-md text-[12px] font-semibold ${
                documentData.data.Status === "Resposta Recebida"
                  ? " text-[#3657BB] bg-[#B5D1F9]" 
                : 
                documentData.data.Status === "Aguardando Resposta"
                  ? " text-[#908946] bg-[#F6F7BB]"
                :
                documentData.data.Status === "Concluído"
                  ? " text-[#006972] bg-[#BBF7F6]"
                :
                (documentData.data.Status === "Revisar" || documentData.data.Status === 'Aguardando Pagamento') && source === 'funcionario'
                  ? " text-[#006972] bg-[#BBF7F6]"
                : 
                documentData.data.Status === "Revisar"
                  ? "text-[#844690] bg-[#E5BBF7]"
                :
                documentData.data.Status === "Aguardando Pagamento"
                  ? "text-[#BB6B36] bg-[#F9D7B5]"
                :
                documentData.data.Status === "Arquivado" || documentData.data.Status === "Recusado" || documentData.data.Status === "Recusado pelo Escritório"
                  ? " text-[#BB3636] bg-[#F9B5B5]"
                : "text-[#438d5f] bg-[#bbf7d0]"
                }`}
              >
                <div className='flex'>
                  <Tag className='w-4 h-4 mr-1' /> 
                  {documentData.data.Status === "Aguardando Resposta" && source === "advogado"
                      ? "Aguardando Aprovação"
                      : (documentData.data.Status === "Aprovado" && source === "AndamentoAdv" || source === "EmAndamentoAdm"
                        ? "Em Andamento"
                        :  (documentData.data.Status === "Aguardando Resposta" && source === "empresa"
                            ? "Doc Recebido"
                            : (documentData.data.Status === "Resposta Recebida" && source === "empresa"
                              ? "Resposta Enviada"
                              : (documentData.data.Status === 'Revisar' && source === 'concluidosFnc')
                              ? 'Enviado para Revisão'
                              : documentData.data.Status
                            )
                          )
                        )
                      }
                </div> 
              </div>
            </div>

            {documentData && (
              source === 'ArquivadosAdm' || documentData.data.Status === 'Recusado' ? (
              <div className="flex space-x-2">
                <p className="px-2 py-1 rounded-md text-[12px] font-semibold text-[#469061] bg-[#E6F3F0]">Data Recusado: {documentData.data.DataRecusado}</p>
              </div>
              ) : source === 'EmAndamentoAdm' ? (
                <div className="flex space-x-2">
                  <p className="px-2 py-1 rounded-md text-[12px] font-semibold text-[#469061] bg-[#E6F3F0]">Prazo de Entrega: {documentData.data.DataEntrega}</p>
                  <p className="px-2 py-1 rounded-md text-[12px] font-semibold text-[#469061] bg-[#E6F3F0]">Recebido: {documentData.data.DataEnvio} </p>
                </div>
              ) : source === 'ConcluidosAdv' || source === 'ConcluidosAdm' || source === 'concluidosFnc' ? (
                <div className="flex space-x-2">
                  <p className="px-2 py-1 rounded-md text-[12px] font-semibold text-[#469061] bg-[#E6F3F0]">Data Conclusão: {documentData.data.DataConclusao}</p>
                </div>
              ) : documentData.data.Status === 'Arquivado' || documentData.data.Status === 'Recusado pelo Escritório'  ? (
                <div className="flex space-x-2">
                  <p className="px-2 py-1 rounded-md text-[12px] font-semibold text-[#469061] bg-[#E6F3F0]">Data Arquivamento: {documentData.data.DataArquivamento}</p>
                </div>
              ) : source === 'funcionario'  ? (
                <div className="flex space-x-2">
                  <p className="px-2 py-1 rounded-md text-[12px] font-semibold text-[#469061] bg-[#E6F3F0]">Prazo de Entrega: {documentData.data.DataEntrega}</p>
                  <p className="px-2 py-1 rounded-md text-[12px] font-semibold text-[#469061] bg-[#E6F3F0]">Recebido: {documentData.data.dataFuncionario}</p>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <p className="px-2 py-1 rounded-md text-[12px] font-semibold text-[#469061] bg-[#E6F3F0]">Prazo de Entrega: {documentData.data.DataEntrega}</p>
                  <p className="px-2 py-1 rounded-md text-[12px] font-semibold text-[#469061] bg-[#E6F3F0]">Data de Envio: {documentData.data.DataEnvio} </p>
                </div>
              )
            )}
           
            <div className="prose mt-8">
              <p className="pr-4 max-h-[210px] overflow-y-auto text-[16px] text-justify">{documentData.data.Descricao}</p>
    
              {documentData && (
                source === 'advogado' || source === 'AndamentoAdv' || source === 'ConcluidosAdv' ? (
                  <VisualizadorPDFadv 
                    documentData={documentData.data} 
                    cpf={cpf} 
                    id={documentData.docId}
                    source = {source}
                  />
                  
                ) : source === 'empresa' || source === 'EmAndamentoAdm' || source === 'ArquivadosAdm' || source === 'ConcluidosAdm' ? (
                  <VisualizadorPDF 
                    documentData={documentData.data} 
                    cpf={cpf} 
                    id={documentData.docId}
                    source = {source}
                  />
                ) : source === 'funcionario' || source === 'concluidosFnc' ? (
                  <VisualizadorPDFFcn
                    documentData={documentData.data} 
                    cpf={cpf} 
                    id={documentData.docId}
                    source = {source}
                  />
                ) : null
              )}
            </div>
          </>
        ) : (
          <>
            <div>
              <div className="font-semibold text-[20px] text-[#2B3C56]">Descrição</div>
              <div className="text-[#007259] text-[12px] font-semibold ">Abra um documento para ver mais detalhes</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};