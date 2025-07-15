import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { reportCategories } from './ReportForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';

interface FilterControlsProps {
  selectedCategories: string[];
  onCategoryChange: (category: string, isSelected: boolean) => void;
  isHeatmapVisible: boolean;
  onHeatmapToggle: (isVisible: boolean) => void;
}

const FilterControls = ({ 
    selectedCategories, 
    onCategoryChange,
    isHeatmapVisible,
    onHeatmapToggle
}: FilterControlsProps) => {
  return (
    <Card>
        <CardHeader>
            <CardTitle>Map Controls</CardTitle>
            <CardDescription>Filter reports and toggle map layers.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
            <div>
                <h3 className="mb-2 font-semibold">Categories</h3>
                <div className="flex flex-col gap-2">
                    {reportCategories.map((category) => (
                        <div key={category} className="flex items-center gap-2">
                        <Checkbox
                            id={category}
                            checked={selectedCategories.includes(category)}
                            onCheckedChange={(checked) => onCategoryChange(category, !!checked)}
                        />
                        <Label htmlFor={category}>{category}</Label>
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <h3 className="mb-2 font-semibold">Layers</h3>
                <div className="flex items-center gap-2">
                    <Switch
                        id="heatmap-toggle"
                        checked={isHeatmapVisible}
                        onCheckedChange={onHeatmapToggle}
                    />
                    <Label htmlFor="heatmap-toggle">Heatmap</Label>
                </div>
            </div>
        </CardContent>
    </Card>
  );
};

export default FilterControls; 