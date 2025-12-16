import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { title, message, user_ids, apiKey, url } = await req.json();

  if (!apiKey || !url) {
    return NextResponse.json(
      {
        alert: {
          type: "error",
          title: "Error",
          description: "กรุณาใส่ API Key และ URL",
        },
      },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({ title, message, user_ids }),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      { alert: { type: "error", title: "Error", description: "ส่งไม่สำเร็จ" } },
      { status: 500 }
    );
  }
}
