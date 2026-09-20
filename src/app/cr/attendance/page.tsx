import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function AttendanceHistoryPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const sessions = await db.attendanceSession.findMany({
    where: { class: { userId } },
    orderBy: { date: "desc" },
    include: {
      class: true,
      records: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight text-gray-100">Attendance History</h2>
        <div className="flex gap-2">
          <Link
            href="/cr/attendance/new"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium text-sm transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Session
          </Link>
        </div>
      </div>

      <div className="bg-[#1c1c1e] rounded-xl shadow-sm border border-[#2c2c2e] overflow-hidden hover:shadow-lg transition-all duration-300">
        {sessions.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            No attendance sessions recorded yet.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-[#2c2c2e] text-sm text-left">
            <thead className="bg-[#242426]">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-400">Date</th>
                <th className="px-6 py-3 font-medium text-gray-400">Class</th>
                <th className="px-6 py-3 font-medium text-gray-400">Subject</th>
                <th className="px-6 py-3 font-medium text-gray-400">Attendance</th>
                <th className="px-6 py-3 text-right text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2c2c2e] bg-[#1c1c1e]">
              {sessions.map((session) => {
                const presentCount = session.records.filter((r) => r.status === "PRESENT").length;
                const totalCount = session.records.length;
                const percentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

                return (
                  <tr key={session.id} className="hover:bg-[#2c2c2e]/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-100 font-medium">
                      {new Date(session.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                      {session.class.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                      {session.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-[#0a0a0a] rounded-full h-2.5 max-w-[100px] border border-[#2c2c2e]">
                          <div
                            className={`h-2.5 rounded-full ${percentage >= 75 ? "bg-green-500" : percentage >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-400">{percentage}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/cr/attendance/${session.id}`} className="text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded transition-colors hover:bg-indigo-500/20">
                        View Details
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
