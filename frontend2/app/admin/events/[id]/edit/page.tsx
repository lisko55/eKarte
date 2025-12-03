import { getEventById } from "@/actions/event-actions";
import EditEventForm from "./edit-form";
import { notFound } from "next/navigation";

interface EditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPage(props: EditPageProps) {
  const params = await props.params;
  const event = await getEventById(params.id);

  if (!event) {
    return notFound();
  }

  return <EditEventForm initialData={event} />;
}