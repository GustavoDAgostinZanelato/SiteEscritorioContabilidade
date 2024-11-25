import { useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";

//Configuração do worker do PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

type PdfViewerProps = {
  pdfPath: string; //Caminho do PDF
  width?: number;  //Largura do canvas (em pixels)
};

const PdfViewer: React.FC<PdfViewerProps> = ({ pdfPath, width = 600 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const renderPage = async () => {
      if (!canvasRef.current) return;

      try {
        const pdf = await pdfjsLib.getDocument(pdfPath).promise;
        const page = await pdf.getPage(1); //Carrega a primeira página
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        if (!context) return;

        //Obter o viewport com escala
        const viewport = page.getViewport({ scale: 1.5 });

        //Ajustar o tamanho interno do canvas para alta resolução
        const outputScale = window.devicePixelRatio || 1;
        canvas.width = viewport.width * outputScale;
        canvas.height = viewport.height * outputScale;

        //Ajustando o tamanho do documento na tela
        canvas.style.width = `${width}px`;
        canvas.style.height = `${(viewport.height / viewport.width) * width}px`;

        //Renderizando a página no canvas
        const renderContext = {
          canvasContext: context,
          viewport,
        };

        context.scale(outputScale, outputScale);
        await page.render(renderContext).promise;
      } catch (error) {
        console.error("Erro ao renderizar o PDF:", error);
      }
    };

    renderPage();
  }, [pdfPath, width]);

  return <canvas ref={canvasRef} className="border rounded" />;
};

export default PdfViewer;