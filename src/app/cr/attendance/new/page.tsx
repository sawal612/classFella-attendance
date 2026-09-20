import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import NewSessionForm from "./NewSessionForm";

export default async function NewAttendanceSessionPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const classes = await db.class.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight text-gray-100">Create New Session</h2>
      </div>

      <div className="bg-[#1c1c1e] rounded-xl shadow-sm border border-[#2c2c2e] p-6">
        {classes.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            You need to create a class first before taking attendance.
          </div>
        ) : (
          <NewSessionForm classes={classes} />
        )}
      </div>
    </div>
  );
}
