//Enter a Messenger, with two heads and a hand

const plays = [];
const playerScenes = [];
const roleElements = [];
let assignedRoleLists;
let currentPlay;
let playerCount = 0;
let selectedRole;
let playerButtons;
//let lines = new Array(5).fill(0).map(() => new Array(15));
const playList = document.getElementById('playList');
const submitButton = document.getElementById('submit');
const playTitle = document.querySelector('#playTitle h1');
const playerList = document.getElementById('playerList');
const roleList = document.getElementById('characterList');


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
        },
        fullyLoaded: false
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
  currentPlay = play;
  playTitle.innerText = currentPlay.title;
  loadPlayers(playerCount);
  if (currentPlay.fullyLoaded === false){
    indexScenes(currentPlay);
    currentPlay.characters.all = play.characters.all.map(x => [x]);
    currentPlay.characters.all.forEach(charArray => {loadCharacter(charArray)});
    currentPlay.fullyLoaded = true;
  }
  loadRoles(currentPlay);
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
  play.sceneIndex.push(play.lines.length-1);
}

function loadCharacter(charArray){
  let activeScenes = [];
  let numLines = 0;
  //let sceneCounter = 0;
  for(let i = 0; i < currentPlay.sceneIndex.length; i++){
    //sceneCounter++;
    for(let j = currentPlay.sceneIndex[i]; j < currentPlay.sceneIndex[i+1]; j++){
      if(currentPlay.lines[j].speaker === charArray[0]){
        numLines++;
        activeScenes.push(i+1);
      }
    }
  }
  activeScenes = activeScenes.filter((v, i, a) => a.indexOf(v) === i);
  charArray.push(activeScenes, numLines);
  //console.log(charArray);
}

function loadPlayers(num){
  for(let i=0; i < num; i++){
    const playerDiv = document.createElement('div');
    playerDiv.innerHTML = `<input type="text" id="player" placeholder="player ${i+1}"><span><strong> +</strong></span><br>
    <ul id="#player${i}" class="assignedRoles"></ul>`;
    playerList.appendChild(playerDiv);
    playerScenes.push([]);
  }
  assignedRoleLists = document.querySelectorAll('#playerList ul');
}

function loadRoles(play){
  play.characters.all.forEach((charArray, index) => {
    const role = document.createElement('li');
    role.innerHTML = `<strong>${charArray[0]},</strong> ${charArray[2]} lines`;
    role.addEventListener('click', function(){checkPlayers(index)} );
    roleElements.push([role, 'X']);
    roleList.appendChild(role);
    console.log(charArray);
  });
}

function checkPlayers(index){
  selectedRole = index;
  playerButtons = document.querySelectorAll('span');
  playerButtons.forEach((button, i) => {
    button.style.color = 'black';
    if(!checkScenes(selectedRole, i)){

      button.style.color = 'red';
      button.addEventListener('click', function(){
        roleElements[selectedRole][1]=i; 
        sortRoles();
        currentPlay.characters.all[selectedRole][1].forEach(scene => {playerScenes[i].push(scene)});
        this.removeEventListener('click', arguments.callee);
      });
    }
  });
}

function sortRoles(){
  roleList.innerHTML = "";
  assignedRoleLists.forEach(list => {
    list.innerHTML = "";
  });
  roleElements.forEach(role => {
    if(role[1] === 'X'){
      roleList.appendChild(role[0]);
    }else{
      assignedRoleLists[role[1]].appendChild(role[0]);
    }
  });
  playerButtons = document.querySelectorAll('span');
  playerButtons.forEach(button => {button.style.color = 'black'});
}

function checkScenes(role, player){
  return playerScenes[player].some(r=> currentPlay.characters.all[role][1].includes(r));
}


//Exit, pursued by a bear

