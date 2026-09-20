import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import ReportClient from "./ReportClient";

export default async function ReportsPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const classes = await db.class.findMany({
    where: { userId },
    include: {
      sessions: {
        orderBy: { date: "desc" },
      },
    },
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Attendance Reports</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-gray-600 mb-6">
          Select a class and an attendance session to generate and download a professional PDF report.
        </p>
        
        <ReportClient classes={classes} />
      </div>
    </div>
  );
}
