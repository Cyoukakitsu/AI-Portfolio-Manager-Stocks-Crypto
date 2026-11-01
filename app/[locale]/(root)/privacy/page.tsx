import { LegalDocument } from "@/features/hero/components/legal-document";

const sectionKeys = [
  "collection",
  "usage",
  "thirdParty",
  "security",
  "retention",
  "rights",
  "changes",
  "contact",
] as const;

export default function PrivacyPage() {
  return <LegalDocument namespace="privacy" sectionKeys={sectionKeys} />;
}
