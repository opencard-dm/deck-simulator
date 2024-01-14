
import 'dotenv/config'
import axios from 'axios'

axios.defaults.baseURL = `http://127.0.0.1:${process.env.PORT}`

const deckId = 'd45149e5-6775-426d-b485-4e03aa44562c';
const responses = [];
[...Array(100)].forEach((_, i) => {
  responses.push(axios.get('/api/scrape', {
    params: { deckId }
  }))
});
Promise.all(responses).then(values => {
  console.log(values.length)
})

