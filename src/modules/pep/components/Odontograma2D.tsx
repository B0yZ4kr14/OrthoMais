import { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, Rect, Text, FabricObject } from 'fabric';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type ToothStatus = 'higido' | 'cariado' | 'obturado' | 'extraido' | 'ausente' | 'implante';

interface ToothData {
  number: number;
  status: ToothStatus;
  notes?: string;
}

const STATUS_COLORS: Record<ToothStatus, string> = {
  higido: '#ffffff',
  cariado: '#ef4444',
  obturado: '#3b82f6',
  extraido: '#000000',
  ausente: '#9ca3af',
  implante: '#10b981',
};

const STATUS_LABELS: Record<ToothStatus, string> = {
  higido: 'Hígido',
  cariado: 'Cariado',
  obturado: 'Obturado',
  extraido: 'Extraído',
  ausente: 'Ausente',
  implante: 'Implante',
};

export const Odontograma2D = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<ToothStatus>('higido');
  const [teethData, setTeethData] = useState<Record<number, ToothData>>({});

  // Numeração FDI padrão
  const upperRightTeeth = [18, 17, 16, 15, 14, 13, 12, 11];
  const upperLeftTeeth = [21, 22, 23, 24, 25, 26, 27, 28];
  const lowerLeftTeeth = [31, 32, 33, 34, 35, 36, 37, 38];
  const lowerRightTeeth = [48, 47, 46, 45, 44, 43, 42, 41];

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 900,
      height: 500,
      backgroundColor: '#f8fafc',
      selection: false,
    });

    setFabricCanvas(canvas);

    // Inicializar dados dos dentes
    const initialData: Record<number, ToothData> = {};
    [...upperRightTeeth, ...upperLeftTeeth, ...lowerLeftTeeth, ...lowerRightTeeth].forEach(num => {
      initialData[num] = { number: num, status: 'higido' };
    });
    setTeethData(initialData);

    return () => {
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.clear();
    fabricCanvas.backgroundColor = '#f8fafc';

    const toothWidth = 40;
    const toothHeight = 60;
    const spacing = 10;
    const startX = 100;
    const upperY = 80;
    const lowerY = 300;

    // Função para desenhar um dente
    const drawTooth = (toothNumber: number, x: number, y: number) => {
      const data = teethData[toothNumber] || { number: toothNumber, status: 'higido' };
      
      const tooth = new Rect({
        left: x,
        top: y,
        width: toothWidth,
        height: toothHeight,
        fill: STATUS_COLORS[data.status],
        stroke: '#334155',
        strokeWidth: 2,
        rx: 5,
        ry: 5,
        selectable: false,
        hoverCursor: 'pointer',
      });

      const label = new Text(String(toothNumber), {
        left: x + toothWidth / 2,
        top: y + toothHeight / 2,
        fontSize: 14,
        fontWeight: 'bold',
        fill: data.status === 'extraido' ? '#ffffff' : '#1e293b',
        selectable: false,
        originX: 'center',
        originY: 'center',
      });

      // Event handler para clique
      tooth.on('mousedown', () => {
        handleToothClick(toothNumber);
      });

      fabricCanvas.add(tooth, label);
    };

    // Desenhar arcada superior direita
    upperRightTeeth.forEach((num, idx) => {
      drawTooth(num, startX + idx * (toothWidth + spacing), upperY);
    });

    // Desenhar arcada superior esquerda
    upperLeftTeeth.forEach((num, idx) => {
      drawTooth(num, startX + 8 * (toothWidth + spacing) + 30 + idx * (toothWidth + spacing), upperY);
    });

    // Linha divisória central
    const centerX = startX + 8 * (toothWidth + spacing) + 15;
    const divider = new Rect({
      left: centerX,
      top: 60,
      width: 2,
      height: 380,
      fill: '#cbd5e1',
      selectable: false,
    });
    fabricCanvas.add(divider);

    // Desenhar arcada inferior esquerda
    lowerLeftTeeth.forEach((num, idx) => {
      drawTooth(num, startX + 8 * (toothWidth + spacing) + 30 + idx * (toothWidth + spacing), lowerY);
    });

    // Desenhar arcada inferior direita
    lowerRightTeeth.forEach((num, idx) => {
      drawTooth(num, startX + idx * (toothWidth + spacing), lowerY);
    });

    // Labels das arcadas
    const addLabel = (text: string, x: number, y: number) => {
      const label = new Text(text, {
        left: x,
        top: y,
        fontSize: 12,
        fill: '#64748b',
        selectable: false,
        fontWeight: 'bold',
      });
      fabricCanvas.add(label);
    };

    addLabel('Superior Direito', startX, 50);
    addLabel('Superior Esquerdo', startX + 450, 50);
    addLabel('Inferior Esquerdo', startX + 450, 270);
    addLabel('Inferior Direito', startX, 270);

    fabricCanvas.renderAll();
  }, [fabricCanvas, teethData]);

  const handleToothClick = (toothNumber: number) => {
    setTeethData(prev => ({
      ...prev,
      [toothNumber]: {
        ...prev[toothNumber],
        status: selectedStatus,
      },
    }));
    toast.success(`Dente ${toothNumber} marcado como ${STATUS_LABELS[selectedStatus]}`);
  };

  const handleReset = () => {
    const resetData: Record<number, ToothData> = {};
    [...upperRightTeeth, ...upperLeftTeeth, ...lowerLeftTeeth, ...lowerRightTeeth].forEach(num => {
      resetData[num] = { number: num, status: 'higido' };
    });
    setTeethData(resetData);
    toast.info('Odontograma resetado');
  };

  const getStatusCount = (status: ToothStatus) => {
    return Object.values(teethData).filter(t => t.status === status).length;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Selecione o Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(STATUS_COLORS) as ToothStatus[]).map(status => (
              <Button
                key={status}
                variant={selectedStatus === status ? 'default' : 'outline'}
                onClick={() => setSelectedStatus(status)}
                className="flex items-center gap-2"
              >
                <div
                  className="w-4 h-4 rounded border border-border"
                  style={{ backgroundColor: STATUS_COLORS[status] }}
                />
                {STATUS_LABELS[status]}
              </Button>
            ))}
            <Button variant="destructive" onClick={handleReset}>
              Resetar Odontograma
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Odontograma 2D - Sistema FDI</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <canvas ref={canvasRef} className="border border-border rounded-lg" />
          </div>
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Clique nos dentes para marcar o status selecionado
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estatísticas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {(Object.keys(STATUS_COLORS) as ToothStatus[]).map(status => (
              <div key={status} className="text-center">
                <Badge variant="outline" className="w-full justify-center mb-2">
                  {STATUS_LABELS[status]}
                </Badge>
                <p className="text-2xl font-bold">{getStatusCount(status)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
