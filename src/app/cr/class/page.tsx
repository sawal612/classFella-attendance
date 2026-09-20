import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { Users } from "lucide-react";
import AddClassForm from "./AddClassForm";
import AddStudentForm from "./AddStudentForm";
import BulkAddStudentForm from "./BulkAddStudentForm";
import DeleteStudentButton from "./DeleteStudentButton";

export default async function ClassManagementPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const classes = await db.class.findMany({
    where: { userId },
    include: {
      students: true,
      _count: {
        select: { students: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight text-gray-100">Class & Students</h2>
        <div className="flex gap-2">
          <AddClassForm />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {classes.length === 0 ? (
          <div className="col-span-full p-12 bg-[#1c1c1e] rounded-xl shadow-sm border border-[#2c2c2e] text-center text-gray-400">
            <p>You haven't setup any classes yet.</p>
          </div>
        ) : (
          classes.map((cls) => (
            <div key={cls.id} className="bg-[#1c1c1e] rounded-xl shadow-sm border border-[#2c2c2e] overflow-hidden hover:scale-[1.01] hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300">
              <div className="px-6 py-4 border-b border-[#2c2c2e] bg-[#242426] flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-100 text-lg">
                    {cls.name} {cls.section && `- ${cls.section}`}
                  </h3>
                  <p className="text-sm text-gray-400">{cls._count.students} Students</p>
                </div>
                <div className="flex gap-2 items-center">
                  <BulkAddStudentForm classId={cls.id} />
                  <AddStudentForm classId={cls.id} />
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto p-0">
                {cls.students.length === 0 ? (
                  <div className="p-6 text-center text-sm text-gray-400">No students added yet.</div>
                ) : (
                  <table className="min-w-full divide-y divide-[#2c2c2e] text-sm text-left">
                    <thead className="bg-[#1c1c1e] sticky top-0">
                      <tr>
                        <th className="px-6 py-3 font-medium text-gray-400">Roll No</th>
                        <th className="px-6 py-3 font-medium text-gray-400">Name</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2c2c2e] bg-[#1c1c1e]">
                      {cls.students.map((student) => (
                        <tr key={student.id} className="hover:bg-[#2c2c2e]/50">
                          <td className="px-6 py-3 whitespace-nowrap text-gray-200 font-medium">
                            {student.rollNumber}
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap text-gray-400">
                            {student.name}
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap text-right">
                            <DeleteStudentButton studentId={student.id} studentName={student.name} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
