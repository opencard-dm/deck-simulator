<template>
  <div class="folderDrop"
    @dragover.prevent
    @drop="onDrop($event)"
  >
  </div>
  <div v-for="deck in decks">
    <span>{{ Object.keys(deck.images).length }} / {{ Object.keys(deck.images).length + deck.loadingFiles }}</span>
    <div v-for="json in deck.json">
      <div v-for="card in json.cards">
        <span>{{ card.times }}</span>
        <img :src="deck.images[card.path]" width="50">
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDecksStore } from '@/stores/decks';
import { reactive } from 'vue';


const decksStore = useDecksStore()
const images = reactive<string[]>([])
const IMAGE_TYPES = ['image/gif', 'image/jpeg', 'image/png']

const decks = reactive<DroppedDeck[]>([])

interface DroppedDeck {
  name: string
  files?: FileSystemFileEntry[]
  loadingFiles: number 
  images: {[key: string]: string}
  json: {
    name: string
    cards: {
      path: string
      times: number
    }[]
  }[]
}

function onLoadDeckFile(deck: DroppedDeck, file: File) {
  const loadedFile = (deck: DroppedDeck) => {
    deck.loadingFiles = deck.loadingFiles - 1
    console.log(deck.loadingFiles)
  if (deck.loadingFiles === 0) {
    console.debug(`all files loaded for '${deck.name}'`)
    decksStore.addDecksSource(fromDroppedDataToDecks(deck))
  }
  }
  if (file.name === 'decks.json') {
    file.text().then(t => {
      console.debug(JSON.parse(t))
      deck.json.push(...JSON.parse(t) as never[])
      loadedFile(deck)
    })
  } else if (IMAGE_TYPES.includes(file.type)) {
    const reader = new FileReader();
    reader.onload = function (e) {
        // Should look like data:,<jibberish_data> based on which method you called
      if (e.target) {
        deck.images[file.name] = e.target.result as string
        loadedFile(deck)
      }
    };
    reader.readAsDataURL(file);
  } else {
    loadedFile(deck)
  }
}

function fromDroppedDataToDecks(dropped: DroppedDeck) {
  return dropped.json.map((deck) => {
    return {
      name: deck.name,
      cards: deck.cards.map(c => {
        return {
          imageUrl: dropped.images[c.path],
          times: c.times,
        }
      }),
      chojigenCards: [],
      grCards: [],
    }
  })
}

async function getDeckImages(dir: FileSystemDirectoryEntry) {
  if (!(dir.isDirectory)) {
    console.assert('item is not directory')
    return []
  }

  const dirReader = dir.createReader();
  const getEntries = () => {
    return new Promise<FileSystemEntry[]>((resolve) => {
      dirReader.readEntries((entries) => {
        resolve(entries);
      });
    });
  }
  const entries = await getEntries();
  return entries.filter(f => f.isFile) as FileSystemFileEntry[]
}

const onDrop = async (event: DragEvent) => {
  event.preventDefault();
  console.log(caches)
  if (!event.dataTransfer) return
  const items = event.dataTransfer.items;
  Array.from(items).forEach(async item => {
    const entry = item.webkitGetAsEntry()
    if (entry?.isDirectory) {
      const deck: DroppedDeck = reactive({
        name: entry.name,
        images: {},
        json: [],
        loadingFiles: 0,
      })
      const files = await getDeckImages(entry as FileSystemDirectoryEntry)
      deck.loadingFiles = files.length
      files.forEach(f => {
        f.file(f => {
          console.log(f.name)
          onLoadDeckFile(deck, f)
        })
      })
      decks.push(deck)
    }
  })
  // console.log(decks)
}
</script>

<style lang="scss">
.folderDrop {
  width: 200px;
  height: 200px;
  background: red;
}
</style>
