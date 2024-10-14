import ModalConfirmation from './ModalConfirmation';
import ModalRestoreDocs from './ModalRestoreDocs';

export const WorkList = ({ orcamentos, fetchDocumentData, titulo1, titulo2, source }) => {
  return (
    <div className="rounded-md overflow-hidden flex-1">
      <div className="border-b p-3 pt-6 bg-background">
        <div className="font-medium">{titulo1}</div>
        <div className="text-muted-foreground text-sm">{titulo2}: {orcamentos.length}</div>
      </div>
      <div className="divide-y">
        {orcamentos.map((Orcamento, index) => (
          <div className="flex items-center gap-3 p-3 hover:bg-[#efefef]" key={index} onClick={() => fetchDocumentData(Orcamento.id)}>
            
            {source === 'trabalhosArquivados' ? (
              <div className='h-3 w-3 rounded-full bg-[#e52c2c]' />
            ) : (
              <div className='h-3 w-3 rounded-full bg-[#e6df30]' />
            )}

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
                <h1 className="text-muted-foreground text-sm">Status: {Orcamento.Status}</h1>
                { 
                source === 'advogado' ? (
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
