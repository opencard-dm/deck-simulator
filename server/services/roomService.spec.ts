
import { createRoom } from './roomService'
import { it, expect } from 'vitest'

it('createRoom', async () => {
    const roomDoc = await createRoom('1', '')
    expect(roomDoc.id).toEqual('1')
    expect(roomDoc.get('histories')).toStrictEqual([])
})
