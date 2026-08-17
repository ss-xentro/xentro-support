import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSupportUser } from "@/lib/auth-utils"

export async function GET(req: Request) {
  try {
    const sessionUser = await getSupportUser()

    if (!sessionUser) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    let whereClause: any = {}

    if (sessionUser.role !== 'ADMIN' && sessionUser.role !== 'SUPER_ADMIN') {
      whereClause.userId = sessionUser.id
    }

    if (status) {
      whereClause.status = status
    }

    const tickets = await prisma.ticket.findMany({
      where: whereClause,
      include: {
        user: {
          select: { name: true, email: true }
        },
        _count: {
          select: { messages: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json(tickets)
  } catch (error) {
    console.error("[TICKETS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const sessionUser = await getSupportUser()

    if (!sessionUser) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { title, description, attachments } = body

    if (!title || !description) {
      return new NextResponse("Missing fields", { status: 400 })
    }

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        userId: sessionUser.id,
        attachments: attachments || []
      }
    })

    return NextResponse.json(ticket)
  } catch (error) {
    console.error("[TICKETS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
