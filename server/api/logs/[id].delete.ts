import { getLog, deleteLog } from '../../services/logService'
import { getUser } from '../../services/userService'

export default defineEventHandler(async (event) => {
    const logId = getRouterParam(event, 'id')
    const query = getQuery(event)
    const userId = query.userId
    const log = await getLog(logId)
    if (!log) {
        setResponseStatus(event, 404)
        return {}
    }
    const user = await getUser(userId)
    if (!user) {
        setResponseStatus(event, 404)
        return {}
    }
    if (!user.logIds.includes(logId)) {
        setResponseStatus(event, 403)
        return {}
    }
    await deleteLog(logId)
    return {}
})
