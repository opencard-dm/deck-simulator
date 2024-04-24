import { getLogs } from '../../services/logService'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    if (!query.userId) {
        setResponseStatus(event, 422)
        return {}
    }
    const logs = await getLogs(query.userId)
    return logs
})
