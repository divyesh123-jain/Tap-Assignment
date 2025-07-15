import { Car, AlertTriangle, Construction, Wrench } from 'lucide-react';
import { FC } from 'react';

export type IconComponent = FC<{ color: string; size: number }>;

export const categoryIcons: { [key: string]: IconComponent } = {
  'Pothole': Wrench,
  'Traffic Jam': Car,
  'Road Debris': Construction,
  'Broken Sign': AlertTriangle,
}; 