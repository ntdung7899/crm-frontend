"use client";

import { useTemplateForm } from "../hooks/useTemplateForm";
import { TemplateForm } from "../components/forms/TemplateForm";

export function CreateTemplateClient() {
  const formState = useTemplateForm();
  
  return <TemplateForm {...formState} />;
}
