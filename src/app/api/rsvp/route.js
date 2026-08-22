import client from "@/lib/mongodb";

export async function POST(request) {
  try {
    await client.connect();
    const db = client.db("sally_mostafa_wedding");
    const { name, attending, note } = await request.json();

    if (!name) {
      return Response.json({ error: "الاسم الكريم مطلوب لتأكيد الحضور" }, { status: 400 });
    }

    const doc = {
      name,
      attending, // 'yes' or 'no'
      note: note || "",
      timestamp: Date.now(),
      dateFormatted: new Date().toLocaleDateString("ar-EG"),
    };

    const result = await db.collection("rsvps").insertOne(doc);
    return Response.json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error("RSVP save failed:", error);
    return Response.json({ error: "حدث خطأ أثناء حفظ تأكيد الحضور في قاعدة البيانات" }, { status: 500 });
  }
}
