// console.log("hello");
let currentsong = new Audio();
let songs = [];
let currfolder;

async function getSongs(folder) {
  currfolder = folder;
  try {
    let response = await fetch(`/${folder}/`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let res = await response.text();
    

    let div = document.createElement("div");
    div.innerHTML = res;
    let as = div.getElementsByTagName("a");
    let newSongs = [];
    for (let index = 0; index < as.length; index++) {
      const element = as[index];
      if (element.href.endsWith(".mp3")) {
        newSongs.push(element.href.split("/").pop());
      }
    }
    console.log("New songs list:", newSongs);
    return newSongs;
  } catch (error) {
    console.error("Error fetching the songs directory:", error);
    return [];
  }
}

//play the first song

function updateSongListUI(songs) {
  let songul = document.querySelector(".songlist ul");
  songul.innerHTML = "";
  for (const song of songs) {
    let songName = song.split("/").pop().split("%20").join(" ");
    songul.innerHTML +=
      `<li> 
        <img class="invert" src="music.svg" alt="">
        <div class="info">
          <div class="musicname">${songName}</div>
          
        </div>
        <div class="playnow">
          <span>play now</span>
          <img class="invert" src="play.svg" alt="">
        </div>
       </li>`;
  }

  Array.from(
    document.querySelector(".songlist").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      console.log(e.querySelector(".info").firstElementChild.innerHTML.trim());
      playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
 
}

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

const playmusic = (track, pause = false) => {
  console.log("Setting track:", track);
  currentsong.src = `/${currfolder}/` + track;
  currentsong.load(); // Ensure the new source is loaded
  if (!pause) {
    currentsong.play().catch((error) => {
      console.error("Error playing audio:", error);
    });
  }

  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00";
};

const initializeFirstSong = (track) => {
  console.log("Initializing first song:", track.split("/").pop());
  currentsong.src = `/${currfolder}/` + track;
  currentsong.load(); // Ensure the new source is loaded
  document.querySelector(".songinfo").innerHTML = decodeURI(
    track.split("/").pop()
  );
  document.querySelector(".songtime").innerHTML = "00:00";
};


//dislaying albums
async function displayAlbum(){
  
        let response = await fetch(`/songs/`);
        let res = await response.text();
        let div = document.createElement("div");
        div.innerHTML = res;
        let anchors = div.getElementsByTagName("a")
        let cardcontainer = document.querySelector(".cardcontainer")
        // Array.from(anchors).forEach(async e=>{
        //     if(e.href.includes("/songs")){
        //        let folder = (e.href.split("/").slice(3)[1]);
        //        let response = await fetch(`/songs/${folder}/info.json`);
        //        let res = await response.json();
                
        //     }
        // })

            let array = Array.from(anchors)

            for (let index = 0; index < array.length; index++) {
                const e = array[index];
                
                if (e.href && e.href.includes("/songs/") && e.href !== "/songs") {
                    let folderPart = e.href.split('songs/')[1];
                    let folder = folderPart.split('/')[0];
                    let response = await fetch(`/songs/${folder}/info.json`);
                    let res = await response.json();
                    console.log(res);
    
                    cardcontainer.innerHTML = cardcontainer.innerHTML + `
                  <div data-folder="${folder}" class="card">
                    <div class="play"><img src="play.svg" alt=""> </div>
                    <img src="/songs/${folder}/cover.jpg" alt="crown">
                    <h3>${res.title}</h3>
                    <p>${res.description}</p>
                    
                  </div>`
                    
                    
                }
            }
            Array.from(document.getElementsByClassName("card")).forEach((e) => {
                e.addEventListener("click", async (item) => {
                    
                  console.log(item.target);
                  let newSongs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
                  if (newSongs.length > 0) {
                    songs = newSongs; // Update the global songs array
                    updateSongListUI(songs);
                    initializeFirstSong(songs[0]);
                  } else {
                    console.error("No songs found for the selected folder.");
                  }
                });
              });
            
        };
        
        
        



async function main() {
  // Get the initial list of songs
  songs = await getSongs("songs/eng");
 
    displayAlbum();
    
  if (songs.length > 0) {
    initializeFirstSong(songs[0]);
  }

  let playButton = document.querySelector("#play");
  let previousButton = document.querySelector("#previous");
  let nextButton = document.querySelector("#next");

  if (!playButton || !previousButton || !nextButton) {
    console.error("Play, Previous, or Next button not found in the DOM.");
    return;
  }

  playButton.addEventListener("click", () => {
    if (currentsong.paused) {
      currentsong.play();
      playButton.src = "pause.svg";
    } else {
      currentsong.pause();
      playButton.src = "play.svg";
    }
  });

  previousButton.addEventListener("click", () => {
    console.log("Previous clicked");
    if (songs.length === 0) {
      console.error("Songs list is empty or not populated.");
      return;
    }
    let currentSrc = currentsong.src.split("/").pop();
    console.log("Current song:", currentSrc);
    console.log("Songs list:", songs);
    let index = songs.indexOf(currentSrc);
    console.log("Current song index:", index);
    if (index > 0) {
      playmusic(songs[index - 1]);
    }
  });

  nextButton.addEventListener("click", () => {
    console.log("Next clicked");
    if (songs.length === 0) {
      console.error("Songs list is empty or not populated.");
      return;
    }
    let currentSrc = currentsong.src.split("/").pop();
    console.log("Current song:", currentSrc);
    console.log("Songs list:", songs);
    let index = songs.indexOf(currentSrc);
    console.log("Current song index:", index);
    if (index < songs.length - 1) {
      playmusic(songs[index + 1]);
    }
  });

  currentsong.addEventListener("timeupdate", () => {
    
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currentsong.currentTime
    )}/${secondsToMinutesSeconds(currentsong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentsong.currentTime / currentsong.duration) * 100 + "%";
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentsong.currentTime = (currentsong.duration * percent) / 100;
  });

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = 0;
  });

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currentsong.volume = parseInt(e.target.value) / 100;
    });


    // //add mute button

  document.querySelector(".sound>img").addEventListener("click", e=>{
    if(e.target.src.includes("sound.svg"))
        {
        e.target.src= e.target.src.replace("sound.svg", "mute.svg")
            currentsong.volume=0
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
    else{
        e.target.src = e.target.src.replace("mute.svg", "sound.svg")
        currentsong.volume = .10;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
    }
  })



}

main();
