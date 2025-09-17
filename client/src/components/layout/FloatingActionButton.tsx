import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FloatingActionButtonProps {
  onClick?: () => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick }) => {
  const { toast } = useToast();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      toast({
        title: "Quick Add",
        description: "Quick add feature coming soon!",
      });
    }
  };

  return (
    <div className="fixed bottom-20 md:bottom-8 right-4 z-30">
      <Button
        onClick={handleClick}
        className="w-14 h-14 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90"
        data-testid="fab-quick-add"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
};
