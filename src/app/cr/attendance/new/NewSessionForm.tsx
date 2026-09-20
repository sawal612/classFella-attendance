"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAttendanceSession } from "@/app/actions";

export default function NewSessionForm({ classes }: { classes: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      classId: formData.get("classId") as string,
      subject: formData.get("subject") as string,
      date: formData.get("date") as string,
      lectureTime: formData.get("lectureTime") as string,
    };

    try {
      const sessionId = await createAttendanceSession(data);
      router.push(`/cr/attendance/${sessionId}`);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>}

      <div>
        <label htmlFor="classId" className="block text-sm font-medium text-gray-300">Class</label>
        <select
          name="classId"
          id="classId"
          required
          className="mt-1 block w-full rounded-md border-[#2c2c2e] bg-[#0a0a0a] text-gray-100 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">Select a class...</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name} {cls.section ? `(${cls.section})` : ""}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-300">Subject</label>
        <input
          type="text"
          name="subject"
          id="subject"
          required
          placeholder="e.g. Data Structures"
          className="mt-1 block w-full rounded-md border-[#2c2c2e] bg-[#0a0a0a] text-gray-100 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-300">Date</label>
          <input
            type="date"
            name="date"
            id="date"
            required
            defaultValue={new Date().toISOString().split("T")[0]}
            className="mt-1 block w-full rounded-md border-[#2c2c2e] bg-[#0a0a0a] text-gray-100 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        
        <div>
          <label htmlFor="lectureTime" className="block text-sm font-medium text-gray-300">Time (Optional)</label>
          <input
            type="time"
            name="lectureTime"
            id="lectureTime"
            className="mt-1 block w-full rounded-md border-[#2c2c2e] bg-[#0a0a0a] text-gray-100 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Session & Take Attendance"}
        </button>
      </div>
    </form>
  );
}
