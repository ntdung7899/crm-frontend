"use client";

import { useTemplateForm } from "../hooks/useTemplateForm";
import { TemplateForm } from "../components/forms/TemplateForm";

export function EditTemplateClient({ templateId }: { templateId: string }) {
  const formState = useTemplateForm(templateId);
  
  return <TemplateForm {...formState} />;
}
