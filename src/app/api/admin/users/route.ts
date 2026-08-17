import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSupportUser } from "@/lib/auth-utils"

export async function GET() {
  try {
    const sessionUser = await getSupportUser()

    // Only SUPER_ADMIN can manage users
    if (!sessionUser || sessionUser.role !== 'SUPER_ADMIN') {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("[ADMIN_USERS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const sessionUser = await getSupportUser()

    // Only SUPER_ADMIN can change roles
    if (!sessionUser || sessionUser.role !== 'SUPER_ADMIN') {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { userId, role } = body

    if (!userId || !role) {
      return new NextResponse("Missing fields", { status: 400 })
    }

    // Don't let a super admin demote themselves by accident
    if (userId === sessionUser.id && role !== 'SUPER_ADMIN') {
      return new NextResponse("Cannot demote yourself", { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("[ADMIN_USERS_PUT]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const sessionUser = await getSupportUser()

    // Only SUPER_ADMIN can add new admins
    if (!sessionUser || sessionUser.role !== 'SUPER_ADMIN') {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { email } = body

    if (!email) {
      return new NextResponse("Email is required", { status: 400 })
    }

    let user = await prisma.user.findUnique({
      where: { email }
    })

    if (user) {
      if (user.role === 'SUPER_ADMIN') {
        return new NextResponse("User is already a Super Admin", { status: 400 })
      }
      user = await prisma.user.update({
        where: { email },
        data: { role: 'ADMIN' }
      })
    } else {
      user = await prisma.user.create({
        data: {
          email,
          role: 'ADMIN'
        }
      })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("[ADMIN_USERS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
