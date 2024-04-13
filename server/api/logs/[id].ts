import { getLog } from '../../services/logService'

export default defineEventHandler(async (event) => {
    const logId = getRouterParam(event, 'id')
    const log = await getLog(logId)
    if (!log) {
        setResponseStatus(event, 404)
        return {}
    }
    return log
})
