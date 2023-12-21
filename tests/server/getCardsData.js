// node test/server/getCardsData.js

const axios = require('axios')

axios.get('https://d23r8jlqp3e2gc.cloudfront.net/api/v1/dm/cards?main-card-ids=21002,10639').then(res => {
  console.log(res.data)
})
