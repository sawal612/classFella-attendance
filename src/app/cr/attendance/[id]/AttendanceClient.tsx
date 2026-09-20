"use client";

import { useState } from "react";
import { Check, X, Save, FileDown } from "lucide-react";
import { saveAttendanceRecords } from "@/app/actions";

type Student = { id: string; name: string; rollNumber: string };
type RecordStatus = "PRESENT" | "ABSENT";

export default function AttendanceClient({
  sessionId,
  students,
  existingRecords,
}: {
  sessionId: string;
  students: Student[];
  existingRecords: Record<string, string>;
}) {
  const [records, setRecords] = useState<Record<string, RecordStatus>>(() => {
    // Initialize with existing or default to PRESENT to save time
    const initial: Record<string, RecordStatus> = {};
    students.forEach((s) => {
      initial[s.id] = (existingRecords[s.id] as RecordStatus) || "PRESENT";
    });
    return initial;
  });
  const [isSaving, setIsSaving] = useState(false);

  const presentCount = Object.values(records).filter((s) => s === "PRESENT").length;
  const absentCount = students.length - presentCount;

  const toggleStatus = (studentId: string) => {
    setRecords((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === "PRESENT" ? "ABSENT" : "PRESENT",
    }));
  };

  const markAll = (status: RecordStatus) => {
    const newRecords: Record<string, RecordStatus> = {};
    students.forEach((s) => {
      newRecords[s.id] = status;
    });
    setRecords(newRecords);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const recordsArray = Object.entries(records).map(([studentId, status]) => ({
        studentId,
        status,
      }));
      await saveAttendanceRecords(sessionId, recordsArray);
      alert("Attendance saved successfully!");
    } catch (error) {
      alert("Failed to save attendance.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-[#1c1c1e] rounded-xl shadow-sm border border-[#2c2c2e] overflow-hidden flex flex-col h-[calc(100vh-250px)] hover:shadow-lg transition-all duration-300">
      <div className="p-4 border-b border-[#2c2c2e] bg-[#242426] flex justify-between items-center sticky top-0 z-10">
        <div className="flex gap-4 items-center">
          <div className="text-sm font-medium">
            <span className="text-green-600 font-bold">{presentCount}</span> Present
          </div>
          <div className="text-sm font-medium">
            <span className="text-red-600 font-bold">{absentCount}</span> Absent
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => markAll("PRESENT")}
            className="px-3 py-1.5 text-sm bg-gray-800 text-gray-300 rounded hover:bg-gray-700 font-medium transition-colors hidden sm:block border border-[#2c2c2e]"
          >
            Mark All Present
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {isSaving ? "Saving..." : <><Save className="w-4 h-4" /> Save</>}
          </button>
        </div>
      </div>

      <div className="overflow-y-auto flex-1 p-0">
        <table className="min-w-full divide-y divide-[#2c2c2e] text-sm text-left">
          <thead className="bg-[#1c1c1e] sticky top-0 shadow-sm border-b border-[#2c2c2e]">
            <tr>
              <th className="px-6 py-3 font-medium text-gray-400 w-24">Roll No</th>
              <th className="px-6 py-3 font-medium text-gray-400">Student</th>
              <th className="px-6 py-3 font-medium text-gray-400 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2c2c2e] bg-[#1c1c1e]">
            {students.map((student) => {
              const isPresent = records[student.id] === "PRESENT";
              return (
                <tr key={student.id} className="hover:bg-[#2c2c2e]/50 transition-colors cursor-pointer" onClick={() => toggleStatus(student.id)}>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-100 font-medium">
                    {student.rollNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-100">
                    {student.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all hover:scale-[1.05] ${
                        isPresent
                          ? "bg-green-500/10 text-green-400 border border-green-500/30"
                          : "bg-red-500/10 text-red-400 border border-red-500/30"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStatus(student.id);
                      }}
                    >
                      {isPresent ? (
                        <><Check className="w-4 h-4" /> Present</>
                      ) : (
                        <><X className="w-4 h-4" /> Absent</>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
