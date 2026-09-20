import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { Users, CalendarCheck, TrendingUp, AlertCircle } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) return null;

  // Fetch classes and students for this CR
  const classes = await db.class.findMany({
    where: { userId },
    include: {
      _count: {
        select: { students: true, sessions: true },
      },
    },
  });

  const totalClasses = classes.length;
  const totalStudents = classes.reduce((acc, cls) => acc + cls._count.students, 0);
  const totalSessions = classes.reduce((acc, cls) => acc + cls._count.sessions, 0);

  // Fetch recent sessions
  const recentSessions = await db.attendanceSession.findMany({
    where: { class: { userId } },
    orderBy: { date: "desc" },
    take: 5,
    include: {
      class: true,
      records: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight text-gray-100">Dashboard</h2>
        <div className="flex gap-2">
          <Link
            href="/cr/attendance/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-sm transition-colors"
          >
            + New Attendance
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-[#1c1c1e] rounded-xl shadow-sm border border-[#2c2c2e] flex items-center space-x-4 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-500/30 transition-all duration-300 cursor-default group">
          <div className="p-3 bg-blue-500/10 rounded-full group-hover:bg-blue-500/20 transition-colors">
            <Users className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors">Total Students</p>
            <p className="text-2xl font-bold text-gray-100">{totalStudents}</p>
          </div>
        </div>
        <div className="p-6 bg-[#1c1c1e] rounded-xl shadow-sm border border-[#2c2c2e] flex items-center space-x-4 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl hover:shadow-green-500/10 hover:border-green-500/30 transition-all duration-300 cursor-default group">
          <div className="p-3 bg-green-500/10 rounded-full group-hover:bg-green-500/20 transition-colors">
            <CalendarCheck className="w-6 h-6 text-green-400 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors">Total Classes Setup</p>
            <p className="text-2xl font-bold text-gray-100">{totalClasses}</p>
          </div>
        </div>
        <div className="p-6 bg-[#1c1c1e] rounded-xl shadow-sm border border-[#2c2c2e] flex items-center space-x-4 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-500/30 transition-all duration-300 cursor-default group">
          <div className="p-3 bg-purple-500/10 rounded-full group-hover:bg-purple-500/20 transition-colors">
            <TrendingUp className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors">Total Sessions</p>
            <p className="text-2xl font-bold text-gray-100">{totalSessions}</p>
          </div>
        </div>
      </div>

      <div className="bg-[#1c1c1e] rounded-xl shadow-sm border border-[#2c2c2e] overflow-hidden">
        <div className="p-6 border-b border-[#2c2c2e] flex justify-between items-center">
          <h3 className="font-semibold text-gray-100 text-lg">Recent Sessions</h3>
          <Link href="/cr/attendance" className="text-sm text-blue-400 font-medium hover:underline">
            View All
          </Link>
        </div>
        {recentSessions.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center text-gray-400">
            <AlertCircle className="w-10 h-10 mb-4 text-gray-600" />
            <p>No attendance sessions recorded yet.</p>
            <Link href="/cr/attendance/new" className="mt-4 text-blue-400 hover:underline">
              Create your first session
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#2c2c2e]">
            {recentSessions.map((session) => {
              const presentCount = session.records.filter((r) => r.status === "PRESENT").length;
              const totalCount = session.records.length;
              const percentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;
              return (
                <div key={session.id} className="p-4 hover:bg-[#2c2c2e]/50 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-100">
                      {session.class.name} - {session.subject}
                    </p>
                    <p className="text-sm text-gray-400">
                      {new Date(session.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-100">
                        {presentCount}/{totalCount} Present
                      </p>
                      <p className="text-xs text-gray-400">{percentage}% Attendance</p>
                    </div>
                    <Link
                      href={`/cr/attendance/${session.id}`}
                      className="text-sm text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded hover:bg-blue-500/20 font-medium transition-colors"
                    >
                      View
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
