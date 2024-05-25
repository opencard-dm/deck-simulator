import { createRoom } from '../../services/roomService'

export default defineEventHandler(async (event) => {
    const roomId = getRouterParam(event, 'id')
    const room = await createRoom(roomId)
    return room
})
