import { NextResponse } from "next/server"
import { getSupportUser } from "@/lib/auth-utils"

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
