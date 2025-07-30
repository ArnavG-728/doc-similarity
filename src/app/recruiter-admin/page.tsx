
import Header from "@/components/Header";
import Link from "next/link";
import { ArrowRight, Search, BarChart, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RecruiterAdminPage() {
    const features = [
    {
      href: "/recruiter-admin/jd-management",
      icon: <Search className="h-6 w-6 text-primary" />,
      title: "JD Management",
      description: "Search, filter, and manage all uploaded Job Descriptions.",
      cta: "Go to JD Management",
    },
    {
      href: "/recruiter-admin/agentic-metrics",
      icon: <BarChart className="h-6 w-6 text-primary" />,
      title: "Agentic Metrics",
      description: "Analyze framework performance with AI-powered insights.",
      cta: "Go to Metrics Tool",
    },
    {
      href: "/recruiter-admin/reporting",
      icon: <FileText className="h-6 w-6 text-primary" />,
      title: "Report Generation",
      description: "Generate and view reports on matching results and performance.",
      cta: "Go to Reporting",
    },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
          <h1 className="font-semibold text-lg md:text-2xl font-headline">Recruiter Admin</h1>
        </div>
        <p className="text-muted-foreground">
          Select a tool below to get started.
        </p>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Link key={feature.href} href={feature.href} className="flex">
              <Card className="w-full hover:bg-card/80 transition-colors flex flex-col">
                <CardHeader className="flex-1">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      {feature.icon}
                    </div>
                    <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                  </div>
                  <CardDescription className="pt-2 text-left">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-semibold text-primary flex items-center">
                    {feature.cta} <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
