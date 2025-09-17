import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useInstitute } from '@/contexts/InstituteContext';
import { firestoreService } from '@/services/firestoreService';
import { Institute } from '@/types';
import { School } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InstituteSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (institute: Institute) => void;
}

export const InstituteSelectionModal: React.FC<InstituteSelectionModalProps> = ({
  open,
  onClose,
  onSelect
}) => {
  const [selectedInstituteId, setSelectedInstituteId] = useState<string>('');
  const { institutes, setInstitutes, loading, setLoading } = useInstitute();
  const { toast } = useToast();

  useEffect(() => {
    if (open && institutes.length === 0) {
      loadInstitutes();
    }
  }, [open]);

  const loadInstitutes = async () => {
    try {
      setLoading(true);
      const instituteList = await firestoreService.getInstitutes();
      setInstitutes(instituteList);
    } catch (error) {
      console.error('Error loading institutes:', error);
      toast({
        title: "Error",
        description: "Failed to load institutes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    const selectedInstitute = institutes.find(inst => inst.id === selectedInstituteId);
    if (selectedInstitute) {
      onSelect(selectedInstitute);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
              <School className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-semibold">Select Your Institute</DialogTitle>
              <p className="text-muted-foreground mt-2">Choose your institute to continue</p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Institute</label>
            <Select 
              value={selectedInstituteId} 
              onValueChange={setSelectedInstituteId}
              disabled={loading}
            >
              <SelectTrigger data-testid="select-institute">
                <SelectValue placeholder={loading ? "Loading..." : "Select Institute"} />
              </SelectTrigger>
              <SelectContent>
                {institutes.map((institute) => (
                  <SelectItem key={institute.id} value={institute.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{institute.name}</span>
                      <span className="text-xs text-muted-foreground">{institute.domain}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={handleContinue}
            disabled={!selectedInstituteId || loading}
            className="w-full"
            data-testid="button-continue"
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
