import { createLog } from '../../services/roomService'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    if (!body.histories
      || !body.name
      || !body.deck
    ) {
        setResponseStatus(event, 422)
        return {}
    }
    const log = await createLog(
        body.name,
        body.deck,
        body.histories)
    return { id: log.id }
})
