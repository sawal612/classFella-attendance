import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AttendanceClient from "./AttendanceClient";

export default async function AttendanceMarkingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { userId } = await auth();
  if (!userId) return null;

  const session = await db.attendanceSession.findUnique({
    where: { id: resolvedParams.id },
    include: {
      class: {
        include: { students: true },
      },
      records: true,
    },
  });

  if (!session || session.class.userId !== userId) {
    redirect("/cr/attendance");
  }

  // Map existing records to the students for easy tracking
  const existingRecords = session.records.reduce((acc, record) => {
    acc[record.studentId] = record.status;
    return acc;
  }, {} as Record<string, string>);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-[#1c1c1e] rounded-xl shadow-sm border border-[#2c2c2e] p-6">
        <h2 className="text-2xl font-bold tracking-tight text-gray-100">Attendance Session</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
          <div>
            <p className="text-gray-400">Subject</p>
            <p className="font-medium text-gray-100">{session.subject}</p>
          </div>
          <div>
            <p className="text-gray-400">Class</p>
            <p className="font-medium text-gray-100">{session.class.name}</p>
          </div>
          <div>
            <p className="text-gray-400">Date</p>
            <p className="font-medium text-gray-100">{new Date(session.date).toLocaleDateString()}</p>
          </div>
          {session.lectureTime && (
            <div>
              <p className="text-gray-400">Time</p>
              <p className="font-medium text-gray-100">{session.lectureTime}</p>
            </div>
          )}
        </div>
      </div>

      <AttendanceClient
        sessionId={session.id}
        students={session.class.students}
        existingRecords={existingRecords}
      />
    </div>
  );
}
