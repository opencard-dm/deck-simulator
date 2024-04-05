import { getLog } from '../../services/logService'

export default defineEventHandler(async (event) => {
    const logId = getRouterParam(event, 'id')
    const logDoc = await getLog(logId)
    if (!logDoc.exists) {
        setResponseStatus(event, 404)
        return {}
    }
    return logDoc.data()
})
