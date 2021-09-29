//Enter a Messenger, with two heads and a hand
const firebaseConfig = {
  apiKey: 'AIzaSyDQ3-rZzCs-LwixdPDzitmOBkGdiqjLDCg',
  authDomain: 'forsooth-27fe4.firebaseapp.com',
  databaseURL: 'https://forsooth-27fe4-default-rtdb.firebaseio.com/',
  projectId: 'forsooth-27fe4',
  storageBucket: 'forsooth-27fe4.appspot.com',
  messagingSenderId: '558006587830',
  appId: '1:558006587830:web:727b8c4bb89a47f1873117'
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const plays = [];
const playerScenes = [];
const roleElements = [];
let currentPlay;
let playerCount = 0;
let assignedRoleLists;
let selectedRole;
let playerButtons;

const playList = document.getElementById('playList');
const playTitle = document.querySelector('#playTitle h1');
const playerList = document.getElementById('playerList');
const roleList = document.getElementById('characterList');
document.getElementById('about').addEventListener('click', function(){});
document.getElementById('reset').addEventListener('click', resetLower );

document.getElementById('load').addEventListener('click', function(){});

(function() {
  document.getElementById('save').addEventListener('click', function(){
    const username = document.getElementById('username').value;
    if(username !== '' && currentPlay !== undefined){
      const progressRef = db.ref('savedPlays');
      progressRef.push({
        u: username,
        cP: currentPlay,
        pC: playerCount,
        rE: roleElements
      });
    }
  });
  document.getElementById('load').addEventListener('click', function(){
    const username = document.getElementById('username').value;
    db.ref('savedPlays').on('value', function(results) {
      const allSavedPlays = results.val();
      for (let savedPlay in allSavedPlays) {
        if(allSavedPlays[savedPlay].u === username){
          loadSavedPlay(allSavedPlays[savedPlay]);
          break;
        }
      }
    });
  });
})();


document.getElementById('submit').addEventListener('click', sortPlays );




fetch('https://gist.githubusercontent.com/lmatrka/a78299e39648e7185344203d999f8e91/raw/094e11c43a7c37134cadc6f403ad5e74487315ab/shakespeare.json')
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
    
    ////////////////////////////////////////////////////////////////// create play object ///////////////
    
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

      indexScenes(playObj);
      playObj.lines.forEach(line => {
        if(line.speaker !== ''){
          if(!playObj.characters.all.includes(line.speaker)){
            playObj.characters.all.push(line.speaker);
          }
        }
      });

      playObj.characters.all.shift(); /*act and scene entries list the last speaker in line.speaker, so each play starts with a speaker from the previous play*/
      playObj.characters.all = playObj.characters.all.map(x => [x]);
      characterDetails(playObj);
      playObj.characters.all.forEach(charArray => {
        if(charArray[2] > 50){
          playObj.characters.major.push(charArray[0]);
        }else{
          playObj.characters.minor.push(charArray[0]);
        }
      });

      plays.push(playObj);
    });

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    
    plays.forEach(play => {
      const title = document.createElement('li');
      title.innerHTML = `<strong>${play.title}</strong>  <span>${play.characters.all.length} characters (${play.characters.major.length} major/ ${play.characters.minor.length} minor)</span>`;
      title.classList.add('unavail');
      playList.appendChild(title);
    });
  });

 /////////////////////////////////////////////////////////////////////////////////////////////////////
function sortPlays(){
  playList.innerHTML = '';
  playerCount = parseInt(document.getElementById('players').value);
  const single = document.getElementById('single');
  const minor = document.getElementById('minor');
  const multiple = document.getElementById('multiple');
  plays.forEach(play => {
    const title = document.createElement('li');
    title.innerHTML = `<strong>${play.title}</strong>  <span>${play.characters.all.length} characters (${play.characters.major.length} major/ ${play.characters.minor.length} minor)</span>`;
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

function indexScenes(play) {
  let previous = 0;
  play.lines.forEach((line, index) => {
    if(line.line_number !== ''){
      const lineNumber = line.line_number.split('.');
      if(lineNumber[1] !== previous){
        play.sceneIndex.push(index);
        previous = lineNumber[1];
      }
    }
  });
  play.sceneIndex.push(play.lines.length-1);
}

function characterDetails(play){
  play.characters.all.forEach(charArray => {
    let activeScenes = [];
    let numLines = 0;
    for(let i = 0; i < play.sceneIndex.length; i++){
      for(let j = play.sceneIndex[i]; j < play.sceneIndex[i+1]; j++){
        if(play.lines[j].speaker === charArray[0]){
          numLines++;
          activeScenes.push(i+1);
        }
      }
    }
    activeScenes = activeScenes.filter((v, i, a) => a.indexOf(v) === i);
    charArray.push(activeScenes, numLines);
  });
}
 /////////////////////////////////////////////////////////////////////////////////////////////////////

function loadPlay(play){
  playerList.innerHTML = '<h3>Players</h3>';
  reset();
  currentPlay = play;
  playTitle.innerText = currentPlay.title;
  document.getElementById('lower').style.visibility = 'visible';
  loadPlayers(playerCount);
  loadRoles(currentPlay);
}

function loadPlayers(num){
  for(let i=0; i < num; i++){
    const playerDiv = document.createElement('div');
    playerDiv.innerHTML = `<input type="text" id="player" placeholder="player ${i+1}"><span style="font-size:24px"><strong> +</strong></span><br>
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
    role.addEventListener('click', function(){checkPlayers(index)});
    roleElements.push([role, 'X']);
    roleList.appendChild(role);
    console.log(charArray);
  });
}

 /////////////////////////////////////////////////////////////////////////////////////////////////////

function checkPlayers(index){
  selectedRole = index;
  playerButtons = document.querySelectorAll('#lower span');
  playerButtons.forEach((button, i) => {
    button.style.color = 'black';
    if(!checkScenes(selectedRole, i)){
      button.style.color = 'red';
      button.addEventListener('click', function(){
        roleElements[selectedRole][1]=i; 
        sortRoles();
        this.removeEventListener('click', arguments.callee);
      });
    }
  });
}

function sortRoles(){
  roleList.innerHTML = '';
  assignedRoleLists.forEach(list => list.innerHTML = '');
  playerScenes.forEach(array => array.length = 0);
  roleElements.forEach((role, index) => {
    if(role[1] === 'X'){
      roleList.appendChild(role[0]);
    }else{
      assignedRoleLists[role[1]].appendChild(role[0]);
      currentPlay.characters.all[index][1].forEach(scene => playerScenes[role[1]].push(scene));
    }
  });
  playerButtons = document.querySelectorAll('span');
  playerButtons.forEach(button => button.style.color = 'black');
}

function checkScenes(role, player){
  return playerScenes[player].some(r=> currentPlay.characters.all[role][1].includes(r));
}

 /////////////////////////////////////////////////////////////////////////////////////////////////////

function loadSavedPlay(savedPlay){
  playerList.innerHTML = '<h3>Players</h3>';
  reset();
  currentPlay = savedPlay.cP;
  playTitle.innerText = currentPlay.title;
  document.getElementById('lower').style.visibility = 'visible';
  loadSavedRoles(savedPlay.rE);
  loadPlayers(savedPlay.pC);
  sortRoles();
}

function loadSavedRoles(savedRoles){
  currentPlay.characters.all.forEach((charArray, index) => {
    const role = document.createElement('li');
    role.innerHTML = `<strong>${charArray[0]},</strong> ${charArray[2]} lines`;
    role.addEventListener('click', function(){checkPlayers(index)});
    roleElements.push([role, savedRoles[index][1]]);
  });
}

function resetLower(){
  if (confirm('Are you sure you want to clear this play?')){
    document.getElementById('lower').style.visibility = 'hidden';
    playTitle.innerText = '';
    currentPlay = undefined;
  }
}

function reset() {
  roleList.innerHTML = '';
  playerScenes.length = 0;
  roleElements.length = 0;
  assignedRoleLists = 0;
  selectedRole = 0;
  playerButtons = 0;
  console.log('reset');
}


//Exit, pursued by a bear

