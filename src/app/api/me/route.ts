import { NextResponse } from "next/server"
import { getSupportUser } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const user = await getSupportUser()
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    return NextResponse.json(user)
  } catch (error) {
    console.error("[ME_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getSupportUser()
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { name, image } = body

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name !== undefined ? name : undefined,
        image: image !== undefined ? image : undefined,
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("[ME_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
