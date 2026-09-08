import { RequestEditView } from "@/components/client/requests/request-edit-view";

export default async function EditRequestPage({
  params,
}: PageProps<"/client/requests/[id]/edit">) {
  const { id } = await params;
  return <RequestEditView id={id} />;
}
