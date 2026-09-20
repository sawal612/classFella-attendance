"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ClassSchema = z.object({
  name: z.string().min(1, "Name is required"),
  section: z.string().optional(),
});

export async function createClass(data: z.infer<typeof ClassSchema>) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validatedFields = ClassSchema.safeParse(data);
  if (!validatedFields.success) throw new Error("Invalid data");

  await db.class.create({
    data: {
      userId,
      name: validatedFields.data.name,
      section: validatedFields.data.section,
    },
  });

  revalidatePath("/cr/class");
}

const StudentSchema = z.object({
  classId: z.string().min(1, "Class is required"),
  name: z.string().min(1, "Name is required"),
  rollNumber: z.string().min(1, "Roll number is required"),
});

export async function addStudent(data: z.infer<typeof StudentSchema>) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validatedFields = StudentSchema.safeParse(data);
  if (!validatedFields.success) throw new Error("Invalid data");

  // Verify class belongs to CR
  const cls = await db.class.findUnique({
    where: { id: validatedFields.data.classId, userId },
  });
  if (!cls) throw new Error("Class not found or unauthorized");

  try {
    await db.student.create({
      data: {
        classId: validatedFields.data.classId,
        name: validatedFields.data.name,
        rollNumber: validatedFields.data.rollNumber,
      },
    });
    revalidatePath("/cr/class");
  } catch (error) {
    // Unique constraint on rollNumber + classId
    throw new Error("Student with this roll number already exists in this class");
  }
}

export async function bulkAddStudents(classId: string, studentsText: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const cls = await db.class.findUnique({
    where: { id: classId, userId },
  });
  if (!cls) throw new Error("Class not found or unauthorized");

  // Parse lines: expected format "RollNo, Name" or "RollNo - Name" or just tab separated
  const lines = studentsText.split("\n").filter((line) => line.trim().length > 0);
  
  const parsedStudents = lines.map((line) => {
    // Try splitting by comma, dash, or tab
    let parts = line.split(/[,\t-]/).map((p) => p.trim());
    if (parts.length < 2) {
      // Fallback: split by first space if no other delimiters
      const firstSpace = line.indexOf(" ");
      if (firstSpace > 0) {
        parts = [line.slice(0, firstSpace).trim(), line.slice(firstSpace + 1).trim()];
      }
    }
    
    if (parts.length < 2) {
      throw new Error(`Invalid format on line: "${line}". Ensure it has a Roll Number and Name.`);
    }
    
    return {
      classId,
      rollNumber: parts[0],
      name: parts.slice(1).join(" "), // in case name had a delimiter inside it
    };
  });

  if (parsedStudents.length === 0) {
    throw new Error("No valid students found in text");
  }

  // Create many (Prisma's createMany handles arrays)
  // use skipDuplicates so if a roll number is already in there, it skips rather than failing the whole batch
  try {
    await db.student.createMany({
      data: parsedStudents,
      skipDuplicates: true,
    });
    revalidatePath("/cr/class");
  } catch (err) {
    throw new Error("Failed to bulk insert students. Check for duplicates.");
  }
}

export async function deleteStudent(studentId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const student = await db.student.findUnique({
    where: { id: studentId },
    include: { class: true },
  });

  if (!student || student.class.userId !== userId) {
    throw new Error("Unauthorized or not found");
  }

  await db.student.delete({
    where: { id: studentId },
  });

  revalidatePath("/cr/class");
}

export async function saveAttendanceRecords(
  sessionId: string,
  records: { studentId: string; status: "PRESENT" | "ABSENT" }[]
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const session = await db.attendanceSession.findUnique({
    where: { id: sessionId },
    include: { class: true },
  });

  if (!session || session.class.userId !== userId) {
    throw new Error("Unauthorized or not found");
  }

  // Use a transaction to upsert all records efficiently
  await db.$transaction(
    records.map((record) =>
      db.attendanceRecord.upsert({
        where: {
          sessionId_studentId: {
            sessionId,
            studentId: record.studentId,
          },
        },
        update: { status: record.status },
        create: {
          sessionId,
          studentId: record.studentId,
          status: record.status,
        },
      })
    )
  );

  revalidatePath(`/cr/attendance/${sessionId}`);
  revalidatePath(`/cr/attendance`);
}

const SessionSchema = z.object({
  classId: z.string().min(1, "Class is required"),
  subject: z.string().min(1, "Subject is required"),
  date: z.string().min(1, "Date is required"),
  lectureTime: z.string().optional(),
});

export async function createAttendanceSession(data: z.infer<typeof SessionSchema>) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validatedFields = SessionSchema.safeParse(data);
  if (!validatedFields.success) throw new Error("Invalid data");

  const cls = await db.class.findUnique({
    where: { id: validatedFields.data.classId, userId },
  });
  if (!cls) throw new Error("Class not found or unauthorized");

  const session = await db.attendanceSession.create({
    data: {
      classId: validatedFields.data.classId,
      subject: validatedFields.data.subject,
      date: new Date(validatedFields.data.date),
      lectureTime: validatedFields.data.lectureTime,
    },
  });

  revalidatePath("/cr/attendance");
  return session.id;
}

