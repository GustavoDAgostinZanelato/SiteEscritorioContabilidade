import ModalConfirmation from './ModalConfirmation';
import ModalRestoreDocs from './ModalRestoreDocs';
import ModalSendEmployee from './ModalSendEmployee';
import ModalChangeEmployee from './ModalChangeEmployee';
import ModalViewEmployee from './ModalViewEmployee';
import ModalCompleteDocs from './ModalCompleteDocs';
import ModalViewFinishedDocs from './ModalViewFinishedDocs';
import ModalPayment from '@/components/ModalPayment'

import { Tag } from 'lucide-react';

export const WorkList = ({ orcamentos, fetchDocumentData, titulo1, titulo2, source, id }) => {

  return (
    <div className="w-[480px] bg-[#fff] rounded-lg shadow-sm">
      <div className="p-5">
        <div className="font-semibold text-[20px] text-[#2B3C56]">{titulo1}</div>
        <div className="text-[12px] text-[#007259] font-semibold">{titulo2}: {orcamentos.length}</div>
      </div>
      <div className="divide-y p-3 pt-0 max-h-[500px] overflow-y-auto">
        {orcamentos.map((Orcamento, index) => (
          <div className="flex items-center p-2 mb-2 rounded-lg bg-[#EBEDF0] hover:bg-[#000]/10" key={index} onClick={() => fetchDocumentData(Orcamento.id)}>
            <div className="flex items-center w-full p-3 hover:cursor-pointer">
              <h1 className="cursor-pointer text-blue-500">
                <div className='text-[#2B3C56] font-bold text-[20px] mb-3 truncate whitespace-nowrap max-w-[210px]'>{Orcamento.Titulo}</div>
                  <div>
                    <div className="text-[12px] font-semibold text-[#2B3C56]">
                        {Orcamento.Email}
                    </div>
                    {source === 'trabalhosArquivados' ? (
                      <div className="text-[10px] font-semibold text-[#007259]">
                        Data Arquivamento: {Orcamento.DataArquivamento}
                      </div>
                    ) : source === 'trabalhosConcluidosAdv' || source === "ConcluidosAdm" || source === 'concluidosFnc' ? (
                      <div className="text-[10px] font-semibold text-[#007259]">
                        Data Conclusão: {Orcamento.DataConclusao}
                      </div>
                    ) : Orcamento.status === 'Recusado' ? (
                      <div className="text-[10px] font-semibold text-[#007259]">
                        Data Recusado: {Orcamento.DataRecusado}
                      </div>
                    ) : source === 'ArquivadosAdm' ? (
                    <div className="text-[10px] font-semibold text-[#007259]">
                      Data Recusado: {Orcamento.DataRecusado}
                    </div>
                    ) : source === 'EmAndamentoAdm' ? (
                      <div className="text-[10px] font-semibold text-[#007259]">
                        Recebido: {Orcamento.DataEnvio} - Prazo: {Orcamento.DataEntrega}
                      </div>
                    ) : source === 'funcionario' ? (
                      <div className="text-[10px] font-semibold text-[#007259]">
                        Recebido: {Orcamento.dataFuncionario} - Prazo: {Orcamento.DataEntrega}
                      </div>
                    ) : (
                      <div className="text-[10px] font-semibold text-[#007259]">
                        Envio: {Orcamento.DataEnvio} - Prazo: {Orcamento.DataEntrega}
                      </div>
                    )}
                  </div>
              </h1>
              
              <div className="ml-auto flex flex-col items-end space-y-2">
                <div className="flex items-center space-x-6">
                  {Orcamento.Status === "Aprovado" && source === "empresa" && (
                    <ModalSendEmployee
                      id={id}
                      dd={Orcamento}
                    />  
                  )}
                  {source == "EmAndamentoAdm" && (
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
                  {source == "ConcluidosAdm" && (
                    <ModalViewFinishedDocs
                      id={id} 
                      dd={Orcamento}
                    />
                  )}
                  {source == "funcionario" && (
                    <ModalCompleteDocs
                      dd={Orcamento}
                    />
                  )}
                  { source === 'advogado' && Orcamento.Status != 'Aprovado' ? (
                    <ModalConfirmation 
                      dd={Orcamento}
                      source="advogado"
                      titulo='Confirmar Arquivamento'
                      descricao='Deseja arquivar o documento'
                      nomeBtn='Arquivar'
                    />
                    ) : source === 'trabalhosArquivados' || source === 'ArquivadosAdm' ? (
                      <>
                        <div>
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
                        </div> 
                      </>
                    ) : null }

                    {(source == "trabalhosConcluidosAdv" && Orcamento.Status === 'Aguardando Pagamento') && (
                      <ModalPayment
                        dd={Orcamento}
                      />
                    )}
                </div>
                
                <div
                  className={`px-2 py-1 rounded-md text-[12px] font-semibold ${
                    Orcamento.Status === "Resposta Recebida"
                      ? " text-[#3657BB] bg-[#B5D1F9]" 
                    : 
                    Orcamento.Status === "Aguardando Resposta" 
                      ? " text-[#908946] bg-[#F6F7BB]"
                    :
                    Orcamento.Status === "Concluído"
                    ? " text-[#006972] bg-[#BBF7F6]"
                    :
                    Orcamento.Status === "Arquivado" || Orcamento.Status === "Recusado" || Orcamento.Status === "Recusado pelo Escritório"
                      ? " text-[#BB3636] bg-[#F9B5B5]"
                    :
                    (Orcamento.Status === "Revisar" || Orcamento.Status === 'Aguardando Pagamento') && source === 'funcionario'
                      ? " text-[#006972] bg-[#BBF7F6]"
                    : 
                    Orcamento.Status === "Aguardando Pagamento"
                      ? "text-[#BB6B36] bg-[#F9D7B5]"
                    :
                    Orcamento.Status === "Revisar"
                      ? "text-[#844690] bg-[#E5BBF7]"
                    : "text-[#438d5f] bg-[#bbf7d0]"
                  }`}
                >
                  <div className='flex'>
                    <Tag className='w-4 h-4 mr-1' /> 
                    {Orcamento.Status === "Aguardando Resposta" && source === "advogado"
                      ? "Aguardando Aprovação"
                      : (Orcamento.Status === "Aprovado" && source === "trabalhosProcessoAdv" || source === "EmAndamentoAdm"
                        ? "Em Andamento"
                        :  (Orcamento.Status === "Aguardando Resposta" && source === "empresa"
                            ? "Doc Recebido"
                            : (Orcamento.Status === "Resposta Recebida" && source === "empresa"
                              ? "Resposta Enviada"
                              : (Orcamento.Status === 'Revisar' && source === 'concluidosFnc')
                              ? 'Enviado para Revisão'
                              : Orcamento.Status
                            )
                          )
                        )
                      }
                  </div>
                </div>
            </div>
          </div>
        </div>
      ))} 
      </div>
    </div>
  );
};
