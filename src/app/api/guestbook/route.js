import client from "@/lib/mongodb";


export async function GET() {
  try {
    await client.connect();
    const db = client.db("sally_mostafa_wedding");
    
    const messages = await db
      .collection("guestbook")
      .find({})
      .sort({ timestamp: -1 })
      .toArray();

    // If database is empty, return empty array
    if (messages.length === 0) {
      return Response.json([]);
    }
    
    // Convert Mongo ObjectId to string for safety
    const formatted = messages.map(msg => ({
      ...msg,
      id: msg._id.toString(),
      date: new Date(msg.timestamp).toISOString().split("T")[0]
    }));

    return Response.json(formatted);
  } catch (error) {
    console.error("Database fetch failed:", error.message);
    return Response.json([]);
  }
}

export async function POST(request) {
  try {
    await client.connect();
    const db = client.db("sally_mostafa_wedding");
    const { name, note, status } = await request.json();

    if (!name || !note) {
      return Response.json({ error: "الاسم والرسالة مطلوبان" }, { status: 400 });
    }

    const doc = {
      name,
      note,
      status: status === "yes" ? "سأحضر بالتأكيد" : "أعتذر عن الحضور",
      timestamp: Date.now(),
    };

    const result = await db.collection("guestbook").insertOne(doc);
    return Response.json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error("Database save failed:", error);
    return Response.json({ error: "حدث خطأ أثناء حفظ التهنئة في قاعدة البيانات" }, { status: 500 });
  }
}
