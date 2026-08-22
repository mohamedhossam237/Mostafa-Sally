import clientPromise from "@/lib/mongodb";

// Default pre-seeded fallback congratulations messages
const defaultMessages = [
  {
    _id: "default_1",
    name: "أحمد ومحمد الخطيب",
    note: "ألف مليون مبروك يا مصطفى ويا سالي، ربنا يتمم لكم على خير ويرزقكم السعادة وراحة البال! فرحتنا بيكم لا توصف.",
    date: "2026-08-22",
    status: "سأحضر بالتأكيد",
  },
  {
    _id: "default_2",
    name: "العائلة الكريمة",
    note: "بارك الله لكما وبارك عليكما وجمع بينكما في خير. ننتظر هذا اليوم السعيد بكل حب وشوق.",
    date: "2026-08-21",
    status: "سأحضر بالتأكيد",
  },
  {
    _id: "default_3",
    name: "منى السيد",
    note: "أجمل وأرق عروسة سالي، ربنا يسعد قلبك الطيب ويكتب لكِ الخير والبركة في حياتك القادمة مع مصطفى.",
    date: "2026-08-20",
    status: "سأحضر بالتأكيد",
  },
];

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("sally_mostafa_wedding");
    
    const messages = await db
      .collection("guestbook")
      .find({})
      .sort({ timestamp: -1 })
      .toArray();

    // If database is empty, return pre-seeded defaults
    if (messages.length === 0) {
      return Response.json(defaultMessages);
    }
    
    // Convert Mongo ObjectId to string for safety
    const formatted = messages.map(msg => ({
      ...msg,
      id: msg._id.toString(),
      date: new Date(msg.timestamp).toISOString().split("T")[0]
    }));

    return Response.json(formatted);
  } catch (error) {
    console.error("Database fetch failed, using fallback messages:", error.message);
    return Response.json(defaultMessages);
  }
}

export async function POST(request) {
  try {
    const client = await clientPromise;
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
