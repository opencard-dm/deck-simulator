import { createLog } from '../../services/logService'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    if (!body.histories
      || !body.name
      || !body.deck
      || !body.userId
    ) {
        setResponseStatus(event, 422)
        return {}
    }
    const log = await createLog(
        body.name,
        body.deck,
        body.histories,
        body.userId, {
            deckb: body.deckb
        })
    return { id: log.id }
})
