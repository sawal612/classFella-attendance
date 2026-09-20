"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteStudent } from "@/app/actions";

export default function DeleteStudentButton({ studentId, studentName }: { studentId: string, studentName: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to remove ${studentName} from this class?`)) {
      return;
    }
    
    setLoading(true);
    try {
      await deleteStudent(studentId);
    } catch (err: any) {
      alert(err.message || "Failed to delete student");
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 disabled:opacity-50 transition-colors"
      title="Remove Student"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
