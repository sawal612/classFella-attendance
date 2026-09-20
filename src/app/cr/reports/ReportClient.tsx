"use client";

import { useState } from "react";
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from "@react-pdf/renderer";
import { Download } from "lucide-react";

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12, fontFamily: "Helvetica" },
  header: { marginBottom: 20, textAlign: "center" },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  subtitle: { fontSize: 12, color: "#4b5563" },
  table: { display: "flex", width: "auto", borderStyle: "solid", borderWidth: 1, borderRightWidth: 0, borderBottomWidth: 0 },
  tableRow: { margin: "auto", flexDirection: "row" },
  tableColHeader: { width: "33.33%", borderStyle: "solid", borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, backgroundColor: "#f3f4f6" },
  tableCol: { width: "33.33%", borderStyle: "solid", borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0 },
  tableCell: { margin: 5, fontSize: 10 },
  summary: { marginTop: 20, fontSize: 12, display: "flex", flexDirection: "row", justifyContent: "space-between" },
});

const AttendancePDF = ({ session, className, records, students }: any) => {
  const presentCount = records.filter((r: any) => r.status === "PRESENT").length;
  const totalCount = records.length;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Attendance Report</Text>
          <Text style={styles.subtitle}>{className}</Text>
          <Text style={styles.subtitle}>Subject: {session?.subject} | Date: {new Date(session?.date).toLocaleDateString()}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}><Text style={styles.tableCell}>Roll No</Text></View>
            <View style={styles.tableColHeader}><Text style={styles.tableCell}>Student Name</Text></View>
            <View style={styles.tableColHeader}><Text style={styles.tableCell}>Status</Text></View>
          </View>
          
          {students?.map((student: any) => {
            const record = records.find((r: any) => r.studentId === student.id);
            const status = record ? record.status : "N/A";
            return (
              <View style={styles.tableRow} key={student.id}>
                <View style={styles.tableCol}><Text style={styles.tableCell}>{student.rollNumber}</Text></View>
                <View style={styles.tableCol}><Text style={styles.tableCell}>{student.name}</Text></View>
                <View style={styles.tableCol}><Text style={styles.tableCell}>{status}</Text></View>
              </View>
            );
          })}
        </View>

        <View style={styles.summary}>
          <Text>Total Students: {totalCount}</Text>
          <Text>Present: {presentCount}</Text>
          <Text>Absent: {totalCount - presentCount}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default function ReportClient({ classes }: { classes: any[] }) {
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const selectedClass = classes.find((c) => c.id === selectedClassId);
  const selectedSession = selectedClass?.sessions.find((s: any) => s.id === selectedSessionId);

  const handleGenerate = async () => {
    if (!selectedSessionId) return;
    setLoading(true);
    try {
      // Fetch full session details via API or server action (simulated with a simple fetch here)
      const res = await fetch(`/api/attendance/${selectedSessionId}`);
      if (!res.ok) throw new Error("Failed to fetch report data");
      const data = await res.json();
      setReportData(data);
    } catch (err) {
      alert("Error generating report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
        <select
          className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
          value={selectedClassId}
          onChange={(e) => {
            setSelectedClassId(e.target.value);
            setSelectedSessionId("");
            setReportData(null);
          }}
        >
          <option value="">Select a class</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {selectedClassId && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Session</label>
          <select
            className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
            value={selectedSessionId}
            onChange={(e) => {
              setSelectedSessionId(e.target.value);
              setReportData(null);
            }}
          >
            <option value="">Select a session</option>
            {selectedClass?.sessions.map((s: any) => (
              <option key={s.id} value={s.id}>
                {new Date(s.date).toLocaleDateString()} - {s.subject}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedSessionId && !reportData && (
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors"
        >
          {loading ? "Preparing Data..." : "Prepare Report"}
        </button>
      )}

      {reportData && (
        <div className="mt-6 p-4 border border-green-200 bg-green-50 rounded-lg flex items-center justify-between">
          <div>
            <p className="font-medium text-green-900">Report Ready!</p>
            <p className="text-sm text-green-700">Click below to download your PDF.</p>
          </div>
          <PDFDownloadLink
            document={
              <AttendancePDF
                session={reportData.session}
                className={selectedClass?.name}
                records={reportData.records}
                students={reportData.students}
              />
            }
            fileName={`Attendance_${selectedClass?.name}_${new Date().toISOString().slice(0,10)}.pdf`}
          >
            {({ loading }) => (
              <button
                className={`flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700 transition-colors ${loading ? "opacity-50" : ""}`}
                disabled={loading}
              >
                <Download className="w-4 h-4" /> Download PDF
              </button>
            )}
          </PDFDownloadLink>
        </div>
      )}
    </div>
  );
}
