import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('q')

    let whereClause: any = { published: true }

    if (search) {
      whereClause = {
        ...whereClause,
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ]
      }
    }

    const faqs = await prisma.fAQ.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        updatedAt: true,
      }
    })

    return NextResponse.json(faqs)
  } catch (error) {
    console.error("[FAQS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { title, slug, content, published } = body

    if (!title || !slug || !content) {
      return new NextResponse("Missing fields", { status: 400 })
    }

    const faq = await prisma.fAQ.create({
      data: {
        title,
        slug,
        content,
        published: published || false,
        authorId: session.user.id
      }
    })

    return NextResponse.json(faq)
  } catch (error) {
    console.error("[FAQS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
