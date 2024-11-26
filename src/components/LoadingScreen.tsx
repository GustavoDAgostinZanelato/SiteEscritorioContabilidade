interface Property {
    source: string;
  }
  
  export default function LoadingScreen({ source }: Property) {
    return (
      <>
        {source === "empresa" ? (
        <>
            {/* Conteúdo Principal */}
            <div style={{display: "flex", backgroundColor: "#2B3C56", overflow: "hidden"}}>
                <div className="grid md:grid-cols-[260px_1fr] min-h-screen w-full bg-[#2B3C56]">
                    {/* Menu Lateral */}
                    <div style={{ width: "260px", height: "100%", backgroundColor: "#2B3C56", padding: "10px", display: "flex", flexDirection: "column", gap: "12px"}}>
                        {/* Botoes */}
                        <div style={{height: "55px", backgroundColor: "#26354c", borderRadius: "8px", marginTop: "100px"}}></div>
                        <div style={{height: "55px", backgroundColor: "#26354c", borderRadius: "8px",}}></div>
                        <div style={{height: "55px", backgroundColor: "#26354c", borderRadius: "8px",}}></div>
                        <div style={{height: "55px", backgroundColor: "#26354c", borderRadius: "8px",}}></div>
                        <div style={{height: "55px", backgroundColor: "#26354c", borderRadius: "8px",}}></div>
                        <div style={{height: "55px", backgroundColor: "#26354c", borderRadius: "8px",}}></div>
                    </div>
                    <div className="flex flex-col">
                    {/* Cabeçalho */}
                    <div style={{height: "80px", width: "100%", backgroundColor: "#fff", padding: 16,}}/>

                    {/* Conteúdo Principal */}
                    <div className="flex flex-1 overflow-hidden">
                        <div style={{flex: 1, padding: "20px", display: "grid", gridTemplateColumns: "3fr 1fr", gap: "20px"}}>
                            {/* Coluna de Trabalhos */}
                            <div style={{width: "485px", height: "602px", backgroundColor: "#fff", marginTop: "4px", borderRadius: "8px", padding: 16}}>
                                <div style={{ width: "60%", height: "30px", backgroundColor: "#ebedf0", borderRadius: "8px", marginBottom: "42px"}}></div>
                                <div style={{ height: "112px", backgroundColor: "#ebedf0", borderRadius: "8px", marginBottom: "10px"}}></div>
                                <div style={{ height: "112px", backgroundColor: "#ebedf0", borderRadius: "8px", marginBottom: "10px"}}></div>
                                <div style={{ height: "112px", backgroundColor: "#ebedf0", borderRadius: "8px", marginBottom: "10px"}}></div>
                                <div style={{ height: "112px", backgroundColor: "#ebedf0", borderRadius: "8px", marginBottom: "10px"}}></div>
                            
                            </div>
                            {/* Coluna de Descrição */}
                            <div style={{width: "710px", height: "602px", backgroundColor: "#fff", marginTop: "4px", borderRadius: "8px", padding: 16,}}>
                                <div style={{width: "60%",height: "30px",backgroundColor: "#ebedf0",borderRadius: "8px",marginBottom: "42px"}}></div>
                                <div style={{width: "100%",height: "50%",backgroundColor: "#ebedf0",borderRadius: "8px",marginBottom: "42px",}}></div>
                            </div>
                        </div>
                    </div>
                    </div>
                </div>
            </div>
        </>
        ) : (
        <>
            {/* Cabeçalho */}
            <div style={{height: "80px",width: "100%",backgroundColor: "#fff",padding: 16,}}/>
            {/* Conteúdo Principal */}
            <div style={{display: "flex",backgroundColor: "#2B3C56"}}>
              {/* Menu Lateral */}
              <div style={{width: "260px",backgroundColor: "#007259",padding: "10px",display: "flex",flexDirection: "column",gap: "12px",}}>
                <div style={{height: "55px",backgroundColor: "#0d7e65",borderRadius: "8px",marginTop: "20px",}}></div>
                <div style={{height: "55px",backgroundColor: "#0d7e65",borderRadius: "8px",}}></div>
                <div style={{height: "55px",backgroundColor: "#0d7e65",borderRadius: "8px",}}></div>
                <div style={{height: "55px",backgroundColor: "#0d7e65",borderRadius: "8px",}}></div>
                <div style={{height: "55px",backgroundColor: "#0d7e65",borderRadius: "8px",}}></div>
              </div>
  
              {/* Conteúdo Principal */}
              <div style={{minHeight: "89vh", flex: 1 ,padding: "20px",display: "grid",gridTemplateColumns: "3fr 1fr",gap: "20px",}}>
                {/* Coluna de Trabalhos */}
                <div style={{width: "485px", height: "602px",backgroundColor: "#fff", marginTop: "4px",borderRadius: "8px",padding: 16}}>
                  <div style={{width: "60%",height: "30px",backgroundColor: "#ebedf0",borderRadius: "8px", marginBottom: "42px",}}></div>
                    <div style={{height: "112px",backgroundColor: "#ebedf0",borderRadius: "8px",marginBottom: "10px",}}></div>
                    <div style={{height: "112px",backgroundColor: "#ebedf0",borderRadius: "8px",marginBottom: "10px",}}></div>
                    <div style={{height: "112px",backgroundColor: "#ebedf0",borderRadius: "8px",marginBottom: "10px",}}></div>
                    <div style={{height: "112px",backgroundColor: "#ebedf0",borderRadius: "8px",marginBottom: "10px",}}></div>
                </div>
                {/* Coluna de Descrição */}
                <div style={{width: "710px",height: "602px",backgroundColor: "#fff",marginTop: "4px",borderRadius: "8px",padding: 16,}}>
                  <div style={{width: "60%",height: "30px",backgroundColor: "#ebedf0",borderRadius: "8px",marginBottom: "42px",}}></div>
                  <div style={{width: "100%",height: "50%",backgroundColor: "#ebedf0",borderRadius: "8px",marginBottom: "42px",}}></div>
                </div>
              </div>
            </div>
          </>
        )}
      </>
    );
  }
  