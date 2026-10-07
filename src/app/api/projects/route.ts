import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";

export const dynamic = "force-dynamic";

// GET all projects
export async function GET() {
  try {
    await connectDB();
    const projects = await Project.find().lean();
    return NextResponse.json(projects);
  } catch (err: any) {
    console.error("GET /api/projects error:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}

// ADD new project
export async function POST(req: Request) {
  try {
    await connectDB();
    const data = await req.json();

    const name = data.name?.trim();
    if (!name) {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 },
      );
    }

    const exists = await Project.findOne({ name });
    if (exists) {
      return NextResponse.json(
        { error: `A project with the name "${name}" already exists` },
        { status: 400 },
      );
    }

    await Project.create({
      ...data,
      name,
    });
    const projects = await Project.find().lean();
    return NextResponse.json(projects);
  } catch (err: any) {
    console.error("POST /api/projects error:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}

// UPDATE existing project
export async function PUT(req: Request) {
  try {
    await connectDB();
    const updated = await req.json();

    const name = updated.name?.trim();
    if (!name) {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 },
      );
    }

    const project = await Project.findOneAndUpdate({ name }, updated, {
      new: true,
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const projects = await Project.find().lean();
    return NextResponse.json(projects);
  } catch (err: any) {
    console.error("PUT /api/projects error:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}

// DELETE project
export async function DELETE(req: Request) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const name = url.searchParams.get("name");

    if (!name)
      return NextResponse.json(
        { error: "Missing project name" },
        { status: 400 },
      );

    await Project.findOneAndDelete({ name });
    const projects = await Project.find().lean();
    return NextResponse.json(projects);
  } catch (err: any) {
    console.error("DELETE /api/projects error:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
