function createShitiArray() {
  let shitiArray = []

  for (let i = 0; i < 200; i++) {
    shitiArray[i] = {
      favorite: 0,
      id: 154263 + i,
      TX: parseInt((Math.random() * 1 + 1).toFixed(0)),
      question: '\\u' + (Math.round(Math.random() * 20901) + 19968).toString(16),
      A: (i+1)+'\\u' + (Math.round(Math.random() * 20901) + 19968).toString(10),
      B: (i + 1) +'\\u' + (Math.round(Math.random() * 20901) + 19968).toString(10),
      C: (i + 1) +'\\u' + (Math.round(Math.random() * 20901) + 19968).toString(10),
      D: (i + 1) +'\\u' + (Math.round(Math.random() * 20901) + 19968).toString(10),
      E: (i + 1) +'\\u' + (Math.round(Math.random() * 20901) + 19968).toString(10),
      answer: "D",
      jiexi: (i + 1) +'\\u' + (Math.round(Math.random() * 20901) + 19968).toString(36),
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