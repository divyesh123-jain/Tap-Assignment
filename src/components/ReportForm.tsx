import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';


export const reportCategories = ['Pothole', 'Traffic Jam', 'Road Debris', 'Broken Sign'];

const ReportForm = ({ onSubmit }: { onSubmit: (description: string, category: string) => void }) => {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(reportCategories[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    onSubmit(description, category);
    setDescription('');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Report a Road Condition</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {reportCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Large pothole on the right lane."
          />
          <Button type="submit">Submit Report</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReportForm; 