import { defineStore } from 'pinia'
import { DecksSource } from '@/entities/Deck';

interface State {
    data: DecksSource[]
}

export const useDecksStore = defineStore('decks', {
    persist: {
        storage: persistedState.localStorage,
        paths: ['decks'],
    },
    state: (): State => ({
        data: []
    }),
    actions: {
        addDecksSource (source: DecksSource) {
            const index = this.data.findIndex((d: DecksSource) => {
                return d.url === source.url
            })
            if (index === -1) {
                this.data.push(source)
            } else {
                this.data[index] = source
            }
        }
    },
})
