import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getSession } from "@/lib/session";

const f = createUploadthing();

// Definiramo tko može uploadati
const auth = async () => {
  const session = await getSession();
  if (!session || !session.isAdmin) throw new Error("Unauthorized");
  return { userId: session.userId };
};

export const ourFileRouter = {
  // Ruta za slike događaja
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const user = await auth();
      return { userId: user.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload završen:", file.url);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;