function createShitiArray() {
  let shitiArray = []

  for (let i = 0; i < 200; i++) {
    shitiArray[i] = {
      favorite: 0,
      id: 154263 + i,
      TX: (Math.random() * 1 + 1).toFixed(0),
      question: '\\u' + (Math.round(Math.random() * 20901) + 19968).toString(16),
      A: '\\u' + (Math.round(Math.random() * 20901) + 19968).toString(10),
      B: '\\u' + (Math.round(Math.random() * 20901) + 19968).toString(10),
      C: '\\u' + (Math.round(Math.random() * 20901) + 19968).toString(10),
      D: '\\u' + (Math.round(Math.random() * 20901) + 19968).toString(10),
      answer: "D",
      jiexi: '\\u' + (Math.round(Math.random() * 20901) + 19968).toString(36),
      xiaoti: []
    }
  }

  return shitiArray;
}


function getShiti(page) {
  let shitiArray = createShitiArray();
  let newShitiArray = []
  for (let i = 0; i < 10; i++) {
    newShitiArray[i] = shitiArray[(page - 1) * 10 + i]
  }
  return newShitiArray;
}

module.exports = {
  createShitiArray: createShitiArray,
  getShiti: getShiti
}