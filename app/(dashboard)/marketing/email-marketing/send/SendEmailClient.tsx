"use client";

import { useSendEmail } from "../hooks/useSendEmail";
import { SendEmailSection } from "../components/SendEmailSection";

export function SendEmailClient({ initialTemplateId }: { initialTemplateId?: string }) {
  const state = useSendEmail(initialTemplateId);
  
  return (
    <SendEmailSection
      {...state}
      onSend={state.handleSend}
    />
  );
}
