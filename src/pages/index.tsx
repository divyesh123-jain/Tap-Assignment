import { useState, useMemo } from 'react';
import Map from '../components/Map';
import ReportForm, { reportCategories } from '../components/ReportForm';
import FilterControls from '../components/FilterControls';

export interface Report {
  description: string;
  category: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

export default function Home() {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(reportCategories);
  const [isHeatmapVisible, setIsHeatmapVisible] = useState(false);

  const handleCategoryChange = (category: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedCategories([...selectedCategories, category]);
    } else {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    }
  };

  const filteredReports = useMemo(() => {
    return reports.filter(report => selectedCategories.includes(report.category));
  }, [reports, selectedCategories]);

  const handleReportSubmit = (description: string, category: string) => {
    navigator.geolocation.getCurrentPosition((position) => {
      const newReport: Report = {
        description,
        category,
        location: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
      };
      setReports((prevReports) => [...prevReports, newReport]);
    });
  };

  return (
    <div className="grid md:grid-cols-3 gap-4 h-[calc(100vh-8rem)]">
      <div className="md:col-span-1 flex flex-col gap-4 md:order-2">
        <ReportForm onSubmit={handleReportSubmit} />
        <FilterControls
          selectedCategories={selectedCategories}
          onCategoryChange={handleCategoryChange}
          isHeatmapVisible={isHeatmapVisible}
          onHeatmapToggle={setIsHeatmapVisible}
        />
      </div>
      <div className="md:col-span-2 h-full md:order-1">
        <Map reports={filteredReports} isHeatmapVisible={isHeatmapVisible} />
      </div>
    </div>
  );
}
