import { LegalDocument } from "@/features/hero/components/legal-document";

const sectionKeys = [
  "acceptance",
  "description",
  "accounts",
  "acceptableUse",
  "financialDisclaimer",
  "thirdParty",
  "warranties",
  "liability",
  "changes",
  "contact",
] as const;

export default function TermsPage() {
  return <LegalDocument namespace="terms" sectionKeys={sectionKeys} />;
}
