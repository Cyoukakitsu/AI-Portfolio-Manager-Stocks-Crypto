import { redirect } from "next/navigation";

const DashboardPage = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}) => {
  const { locale } = await params;
  redirect(`/${locale}/dashboard/assets`);
};

export default DashboardPage;
