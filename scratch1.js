const plays = [];
let playerCount = 0;
const players = [];
//let lines = new Array(5).fill(0).map(() => new Array(15));
const playList = document.querySelector('#playList');
const submitButton = document.querySelector('#submit');
//submitButton.style.color = "red";

fetch("https://gist.githubusercontent.com/lmatrka/a78299e39648e7185344203d999f8e91/raw/094e11c43a7c37134cadc6f403ad5e74487315ab/shakespeare.json")
  .then((response) => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error(response.statusText);
    }
  })
  .then((data) => {
    const filteredData = data.filter(function(el, index) {
      return index % 2 === 1;
    });
    
    const allPlayTitles = [];
    filteredData.forEach(obj => {
      allPlayTitles.push(obj.play_name);
    });
    const uniquePlayTitles = [...new Set(allPlayTitles)];
    
    uniquePlayTitles.forEach(play => {
      const playObj = {
        title: play,
        lines: filteredData.filter(lines => lines.play_name === play),
        sceneIndex: [],
        characters: {
          all: [],
          major: [],
          minor: []
        }
      };
      playObj.lines.forEach(line => {
        if(line.speaker !== ""){
          if(!playObj.characters.all.includes(line.speaker)){
            playObj.characters.all.push(line.speaker);
          }
        }
      });
      playObj.characters.all.shift(); /*act and scene entries list the last speaker in line.speaker, so each play starts with a speaker from the previous play*/
      playObj.characters.all.forEach(character => {
        if(isUpper(character)){
          playObj.characters.major.push(character);
        }else{
          playObj.characters.minor.push(character);
        }
      });
      //playObj.characters.filter((item, index) => playObj.characters.indexOf(item) === index);
      plays.push(playObj);
    });

    plays.forEach(play => {
      const title = document.createElement('li');
      title.innerHTML = `${play.title} - ${play.characters.all.length} characters (${play.characters.major.length}/${play.characters.minor.length})`;
      title.classList.add('unavail');
      playList.appendChild(title);
    });
  });


function isUpper(str) {
  return !/[a-z]/.test(str) && /[A-Z]/.test(str);
}

submitButton.addEventListener('click', sortPlays );

function sortPlays(){
  playList.innerHTML = "";
  playerCount = parseInt(document.getElementById('players').value);
  const single = document.getElementById('single');
  const minor = document.getElementById('minor');
  const multiple = document.getElementById('multiple');
  console.log(playerCount);
  plays.forEach(play => {
    const title = document.createElement('li');
    title.innerHTML = `${play.title} - ${play.characters.all.length} characters (${play.characters.major.length}/${play.characters.minor.length})`;
    if(single.checked && play.characters.all.length === playerCount){
      playList.appendChild(title);
      title.addEventListener('click', function(){loadPlay(play)} );
    }else if(minor.checked && play.characters.major.length <= playerCount && playerCount <= play.characters.all.length){
      playList.appendChild(title);
      title.addEventListener('click', function(){loadPlay(play)} );
    }else if(multiple.checked && play.characters.all.length >= playerCount){
      playList.appendChild(title);
      title.addEventListener('click', function(){loadPlay(play)} );
    }
  });
}

function loadPlay(play){
  indexScenes(play);
}

function indexScenes(play) {
  let previous = 0;
  play.lines.forEach((line, index) => {
    if(line.line_number !== ""){
      const lineNumber = line.line_number.split('.');
      if(lineNumber[1] !== previous){
        play.sceneIndex.push(index);
        previous = lineNumber[1];
      }
    }
  });
}






//  const sceneSearch = /(?<=\.)(.*?)(?=\.)/
//Enter a Messenger, with two heads and a hand
//Exit, pursued by a bear


