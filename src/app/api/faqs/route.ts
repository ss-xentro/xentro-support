import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthCookieServer } from "@/lib/auth-utils"

export async function GET() {
  try {
    const faqs = await prisma.fAQ.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        author: {
          select: { name: true }
        }
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
    const sessionUser = await getAuthCookieServer()

    if (!sessionUser || !sessionUser.id || (sessionUser.role !== 'admin' && sessionUser.role !== 'ADMIN')) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    await prisma.user.upsert({
      where: { id: sessionUser.id },
      update: { name: sessionUser.name, email: sessionUser.email, role: 'ADMIN' },
      create: { id: sessionUser.id, name: sessionUser.name, email: sessionUser.email, role: 'ADMIN' }
    })

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
        authorId: sessionUser.id
      }
    })

    return NextResponse.json(faq)
  } catch (error) {
    console.error("[FAQS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
