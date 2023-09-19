import { prisma } from "./../../utils/prisma"
import { NextResponse } from "next/server"

export async function POST(req) {
	//console.log('i hath been fetched')
	const data = await req.json()
	const twitter = data.twitterAccount.replace(/^@/, "")

	const user = await prisma.user.upsert({
		where: {
			ContactInfo: twitter,
		},
		update: {
			Model: {
				create: {},
			},
		},
		create: {
			ContactInfo: twitter,
			Model: {
				create: {},
			},
		},
	})

	console.log("prisma: model created for given user")
	//console.log('model created for given user:\n', user)

	return NextResponse.json({
		redirectUrl: `/model/${twitter}?printModel=${data.printModel}`,
	})
}
