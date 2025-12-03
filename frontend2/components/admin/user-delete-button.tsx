"use client";

import { deleteUser } from "@/actions/admin-actions";
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

interface UserDeleteButtonProps {
  userId: string;
  userName: string;
}

export function UserDeleteButton({ userId, userName }: UserDeleteButtonProps) {
  
  const handleDelete = async () => {
    const result = await deleteUser(userId);
    
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Korisnik je uspješno obrisan.");
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          size="icon" 
          variant="ghost" 
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
          title="Obriši korisnika"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Jeste li apsolutno sigurni?</AlertDialogTitle>
          <AlertDialogDescription>
            Ova radnja se ne može poništiti. Trajno ćete obrisati korisnika 
            <span className="font-bold text-slate-900"> {userName}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Odustani</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Da, obriši korisnika
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}