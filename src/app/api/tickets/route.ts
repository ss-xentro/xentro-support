import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthCookieServer } from "@/lib/auth-utils"

export async function GET(req: Request) {
  try {
    const sessionUser = await getAuthCookieServer()

    if (!sessionUser || !sessionUser.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    await prisma.user.upsert({
      where: { id: sessionUser.id },
      update: { name: sessionUser.name, email: sessionUser.email, role: sessionUser.role === 'admin' ? 'ADMIN' : 'USER' },
      create: { id: sessionUser.id, name: sessionUser.name, email: sessionUser.email, role: sessionUser.role === 'admin' ? 'ADMIN' : 'USER' }
    })

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    let whereClause: any = {}

    if (sessionUser.role !== 'admin' && sessionUser.role !== 'ADMIN') {
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
    const sessionUser = await getAuthCookieServer()

    if (!sessionUser || !sessionUser.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    await prisma.user.upsert({
      where: { id: sessionUser.id },
      update: { name: sessionUser.name, email: sessionUser.email, role: sessionUser.role === 'admin' ? 'ADMIN' : 'USER' },
      create: { id: sessionUser.id, name: sessionUser.name, email: sessionUser.email, role: sessionUser.role === 'admin' ? 'ADMIN' : 'USER' }
    })

    const body = await req.json()
    const { title, description } = body

    if (!title || !description) {
      return new NextResponse("Missing fields", { status: 400 })
    }

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        userId: sessionUser.id
      }
    })

    return NextResponse.json(ticket)
  } catch (error) {
    console.error("[TICKETS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
