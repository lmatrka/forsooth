let filteredData;
let uniquePlays;

fetch("https://gist.githubusercontent.com/lmatrka/a78299e39648e7185344203d999f8e91/raw/094e11c43a7c37134cadc6f403ad5e74487315ab/shakespeare.json")
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(response.statusText);
      }
    })
    .then((data) => {
      filteredData = data.filter(function(el, index) {
        return index % 2 === 1;
      });
      //console.log(filteredData);
      filteredData.forEach(obj => {
        allPlays.push(obj.play_name);
    });
    uniquePlays = [...new Set(allPlays)];
    console.log(uniquePlays);
    uniquePlays.forEach((playTitle) => {
      const title = document.createElement('li');
      title.innerHTML = playTitle;
      playList.appendChild(title);
    });
    })
    ;

    


//const allPlays = ['Midsummer', "All's Well", 'The Tempest', 'Henry IV', 'Romeo and Juliet'];
const allPlays = [];
/*
filteredData.forEach(obj => {
    allPlays.push(obj.play_name);
});
*/

//let two = data.filter(obj => obj.b === uniqueBees[0]);
//console.log(two);

const playList = document.querySelector('#playList');
//let numberPlayers;
/*
uniquePlays.forEach((playTitle) => {
  const title = document.createElement('li');
  title.innerHTML = playTitle;
  playList.appendChild(title);
});
*/




///////////////////////////////////////////////////// database manipulation tests
/*const data = [
  {
    'a': 1,
    'b': 2,
    'c': 3
  },
  {
    'a': 1,
    'b': 2,
    'c': 3
  },
  {
    'a': 1,
    'b': 2,
    'c': 3
  },
  {
    'a': 1,
    'b': 4,
    'c': 3
  },
  {
    'a': 1,
    'b': 4,
    'c': 3
  },
  {
    'a': 1,
    'b': 6,
    'c': 3
  },
  {
    'a': 1,
    'b': 6,
    'c': 3
  },
  {
    'a': 1,
    'b': 6,
    'c': 3
  },
  {
    'a': 1,
    'b': 5,
    'c': 3
  }
];

let allBees = [];

data.forEach((obj) => {
    allBees.push(obj.b);
});

let uniqueBees = [...new Set(allBees)];

let two = data.filter(obj => obj.b === uniqueBees[0]);
console.log(two);
*/