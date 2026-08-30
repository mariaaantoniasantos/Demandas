import React from 'react';
import {
  BarChart3,
  FileText,
  Film,
  Globe,
  Image,
  Layers,
  Palette,
  Sparkles,
  Video,
} from 'lucide-react';
import { PieceType } from '../types';

interface PieceTypeIconProps {
  tipo: PieceType;
  className?: string;
}

export const PieceTypeIcon: React.FC<PieceTypeIconProps> = ({ tipo, className = 'w-4 h-4' }) => {
  switch (tipo) {
    case 'post':
      return <Image className={className} />;
    case 'carrossel':
      return <Layers className={className} />;
    case 'reels':
      return <Film className={className} />;
    case 'stories':
      return <Sparkles className={className} />;
    case 'video':
      return <Video className={className} />;
    case 'site':
      return <Globe className={className} />;
    case 'relatorio':
      return <BarChart3 className={className} />;
    case 'identidade':
      return <Palette className={className} />;
    default:
      return <FileText className={className} />;
  }
};
