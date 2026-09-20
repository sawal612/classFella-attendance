import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const session = await db.attendanceSession.findUnique({
      where: { id: resolvedParams.id },
      include: {
        class: {
          include: { students: { orderBy: { rollNumber: "asc" } } },
        },
        records: true,
      },
    });

    if (!session || session.class.userId !== userId) {
      return new NextResponse("Not Found or Unauthorized", { status: 404 });
    }

    return NextResponse.json({
      session: {
        subject: session.subject,
        date: session.date,
        lectureTime: session.lectureTime,
      },
      students: session.class.students,
      records: session.records,
    });
  } catch (error) {
    console.error("[REPORT_API]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
