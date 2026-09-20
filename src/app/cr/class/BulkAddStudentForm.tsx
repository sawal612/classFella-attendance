"use client";

import { useState } from "react";
import { Upload, X } from "lucide-react";
import { bulkAddStudents } from "@/app/actions";

export default function BulkAddStudentForm({ classId }: { classId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    
    const formData = new FormData(e.currentTarget);
    const studentsText = formData.get("students") as string;
    
    try {
      await bulkAddStudents(classId, studentsText);
      setSuccess("Students added successfully!");
      setTimeout(() => setIsOpen(false), 1500);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        title="Bulk Import Students"
        className="px-3 py-1.5 text-sm font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md transition-colors flex items-center gap-1.5"
      >
        <Upload className="w-3.5 h-3.5" />
        Bulk Add
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Upload className="w-4 h-4 text-indigo-600" />
            Bulk Add Students
          </h3>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm whitespace-pre-wrap">{error}</div>}
          {success && <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm">{success}</div>}
          
          <div>
            <label htmlFor="students" className="block text-sm font-medium text-gray-700 mb-2">
              Paste your student list here:
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Format: <code>RollNumber, Student Name</code> or <code>RollNumber [TAB] Student Name</code> per line.
            </p>
            <textarea 
              name="students" 
              id="students" 
              required
              rows={8}
              placeholder="CS-001, Alice Smith&#10;CS-002, Bob Jones&#10;CS-003, Charlie Brown"
              className="w-full rounded-md border-gray-300 shadow-sm p-3 border font-mono text-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          
          <div className="pt-2 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium disabled:opacity-50 transition-colors"
            >
              {loading ? "Importing..." : "Import Students"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
