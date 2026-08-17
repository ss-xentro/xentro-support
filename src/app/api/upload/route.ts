import { NextResponse } from "next/server"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSupportUser } from "@/lib/auth-utils"
import { v4 as uuidv4 } from "uuid"
import path from "path"

export async function POST(req: Request) {
  try {
    const sessionUser = await getSupportUser()

    if (!sessionUser) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    const folder = (formData.get("folder") as string) || "tickets"

    if (!file) {
      return new NextResponse("No file provided", { status: 400 })
    }

    // Enforce 10 MB file-size limit
    const max_size = 10 * 1024 * 1024
    if (file.size > max_size) {
      return new NextResponse(`File too large. Maximum allowed size is 10MB.`, { status: 400 })
    }

    // Cloudflare R2 variables
    const accountId = process.env.R2_ACCOUNT_ID
    const accessKeyId = process.env.R2_ACCESS_KEY_ID
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
    const bucketName = process.env.R2_BUCKET_NAME
    const publicUrl = process.env.R2_PUBLIC_URL

    if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicUrl) {
      console.error("Missing R2 credentials")
      return new NextResponse("Server configuration error", { status: 500 })
    }

    const s3 = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    })

    const ext = path.extname(file.name)
    const safeName = `${uuidv4()}${ext}`
    const objectName = `support/${folder}/${safeName}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: objectName,
        Body: buffer,
        ContentType: file.type,
      })
    )

    const fileUrl = `${publicUrl}/${objectName}`

    return NextResponse.json({ success: true, url: fileUrl })
  } catch (error) {
    console.error("[UPLOAD_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
