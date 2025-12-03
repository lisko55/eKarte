"use client";

import { deleteEvent } from "@/actions/admin-actions";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface EventDeleteButtonProps {
  eventId: string;
  eventTitle: string;
}

export function EventDeleteButton({ eventId, eventTitle }: EventDeleteButtonProps) {
  
  const handleDelete = async () => {
    const result = await deleteEvent(eventId);
    
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Događaj je uspješno obrisan.");
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          size="icon" 
          variant="ghost" 
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
          title="Obriši događaj"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Jeste li sigurni?</AlertDialogTitle>
          <AlertDialogDescription>
            Trajno ćete obrisati događaj <span className="font-bold text-slate-900">{eventTitle}</span>.
            Ova radnja se ne može poništiti.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Odustani</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Obriši
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}