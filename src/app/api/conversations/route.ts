import { NextRequest, NextResponse } from 'next/server'
import { dbGetConversations } from '@/server/db/queries'
import { verifyUser } from '@/server/actions/user'

export async function GET(req: NextRequest) {
    try {
        const session = await verifyUser()
        const userId = session?.data?.data?.id

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const conversations = await dbGetConversations({ userId })
        return NextResponse.json(conversations)
    } catch (error) {
        console.error('Error fetching conversations:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
} 