import React, { useRef, useEffect, useState } from 'react';
import { renderToString } from 'react-dom/server';
import h337 from 'heatmap.js';
import { Report } from '../pages';
import { categoryIcons } from './CategoryIcons';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface HeatmapDataPoint {
    x: number;
    y: number;
    value: number;
}

interface HeatmapInstance {
  setData: (data: { max: number; data: HeatmapDataPoint[] }) => void;
}

const categoryColors: { [key: string]: string } = {
  'Pothole': '#ff4d4d',
  'Traffic Jam': '#ffc107',
  'Road Debris': '#9c27b0',
  'Broken Sign': '#03a9f4',
};

const Map = ({ reports, isHeatmapVisible }: { reports: Report[], isHeatmapVisible: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heatmapContainerRef = useRef<HTMLDivElement>(null);
  const [heatmap, setHeatmap] = useState<HeatmapInstance | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [iconImages, setIconImages] = useState<{ [key: string]: HTMLImageElement }>({});
  const [iconsLoaded, setIconsLoaded] = useState(false);
  const [hoveredReport, setHoveredReport] = useState<Report | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const iconPromises = Object.keys(categoryIcons).map(category => {
      return new Promise<[string, HTMLImageElement]>(resolve => {
        const IconComponent = categoryIcons[category];
        const svgString = renderToString(<IconComponent color={categoryColors[category]} size={24} />);
        const img = new Image();
        img.src = `data:image/svg+xml;base64,${btoa(svgString)}`;
        img.onload = () => resolve([category, img]);
        img.onerror = () => {
          console.error(`Failed to load icon for ${category}`);
          resolve([category, new Image()]); // Resolve with an empty image on error
        };
      });
    });

    Promise.all(iconPromises).then(results => {
      const newIconImages = Object.fromEntries(results);
      setIconImages(newIconImages);
      setIconsLoaded(true);
    });
  }, []);

  useEffect(() => {
    let watchId: number;
    if ('geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setError(null);
        },
        (error) => {
          setError(error.message);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    }
  }, []);

  useEffect(() => {
    if (!heatmapContainerRef.current) return;
    const heatmapInstance = h337.create({
      container: heatmapContainerRef.current,
      radius: 50,
    });
    setHeatmap(heatmapInstance);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    let animationFrameId: number;
    let pulse = 0;

    const render = () => {
      pulse = (pulse + 0.05) % (Math.PI * 2);
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Set canvas size
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      // Draw grid
      const gridSize = 20;
      context.strokeStyle = '#e0e0e0';
      context.lineWidth = 0.5;
      for (let x = 0; x < canvas.width; x += gridSize) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, canvas.height);
        context.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(canvas.width, y);
        context.stroke();
      }

      if (isHeatmapVisible && heatmap) {
        const points = reports.map(report => ({
          x: Math.round((report.location.longitude + 180) * (canvas.width / 360)),
          y: Math.round((report.location.latitude + 90) * (canvas.height / 180)),
          value: 1,
        }));
        heatmap.setData({ max: 5, data: points });
      } else if (heatmap) {
        heatmap.setData({ max: 0, data: [] });
      }

      reports.forEach(report => {
        // This is a simplified mapping from lat/lon to canvas coordinates
        const x = (report.location.longitude + 180) * (canvas.width / 360);
        const y = (report.location.latitude + 90) * (canvas.height / 180);
        const iconImage = iconImages[report.category];
        if (iconImage) {
            const size = 24 + Math.sin(pulse) * 4;
            context.drawImage(iconImage, x - size / 2, y - size / 2, size, size);
        }
      });

      if (location) {
        context.fillStyle = 'white';
        context.font = '14px Arial';
        context.fillText(`Lat: ${location.latitude.toFixed(4)}, Lon: ${location.longitude.toFixed(4)}`, 10, 20);

        const userX = (location.longitude + 180) * (canvas.width / 360);
        const userY = (location.latitude + 90) * (canvas.height / 180);
        const userRadius = 8 + Math.sin(pulse) * 2;
        context.fillStyle = '#007bff';
        context.beginPath();
        context.arc(userX, userY, userRadius, 0, Math.PI * 2);
        context.fill();
        context.strokeStyle = 'white';
        context.lineWidth = 2;
        context.stroke();
      }

      if (hoveredReport && mousePosition) {
          context.fillStyle = 'rgba(0, 0, 0, 0.75)';
          const text = hoveredReport.description;
          const textWidth = context.measureText(text).width;
          context.fillRect(mousePosition.x + 10, mousePosition.y - 20, textWidth + 10, 25);
          context.fillStyle = 'white';
          context.font = '14px Arial';
          context.fillText(text, mousePosition.x + 15, mousePosition.y - 5);
      }

      if (error) {
          context.fillStyle = 'red';
          context.font = '16px Arial';
          context.fillText(error, 10, 50);
      }
      animationFrameId = requestAnimationFrame(render);
    }
    
    if (iconsLoaded) {
      render();
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [location, error, reports, iconImages, hoveredReport, mousePosition, isHeatmapVisible, heatmap, iconsLoaded]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setMousePosition({ x, y });

        let foundReport = null;
        reports.forEach(report => {
            const reportX = (report.location.longitude + 180) * (canvas.width / 360);
            const reportY = (report.location.latitude + 90) * (canvas.height / 180);
            const distance = Math.sqrt(Math.pow(x - reportX, 2) + Math.pow(y - reportY, 2));
            if (distance < 15) {
                foundReport = report;
            }
        });
        setHoveredReport(foundReport);
    };
    canvas.addEventListener('mousemove', handleMouseMove);
    return () => canvas.removeEventListener('mousemove', handleMouseMove);
  }, [reports]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handleClick = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        let foundReport = null;
        reports.forEach(report => {
            const reportX = (report.location.longitude + 180) * (canvas.width / 360);
            const reportY = (report.location.latitude + 90) * (canvas.height / 180);
            const distance = Math.sqrt(Math.pow(x - reportX, 2) + Math.pow(y - reportY, 2));
            if (distance < 15) {
                foundReport = report;
            }
        });
        setSelectedReport(foundReport);
    };
    canvas.addEventListener('click', handleClick);
    return () => canvas.removeEventListener('click', handleClick);
  }, [reports]);

  return (
    <div ref={heatmapContainerRef} className="w-full h-full relative">
        <canvas ref={canvasRef} className="w-full h-full bg-transparent rounded-lg absolute top-0 left-0 z-10"></canvas>
        <Dialog open={!!selectedReport} onOpenChange={(isOpen) => !isOpen && setSelectedReport(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{selectedReport?.category}</DialogTitle>
                    <DialogDescription>
                        {selectedReport?.description}
                    </DialogDescription>
                </DialogHeader>
                <div className="text-sm text-gray-500">
                    Lat: {selectedReport?.location.latitude.toFixed(4)}, Lon: {selectedReport?.location.longitude.toFixed(4)}
                </div>
            </DialogContent>
        </Dialog>
    </div>
    );
};

export default Map; 