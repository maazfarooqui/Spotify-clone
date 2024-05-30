console.log("hello");
let currentsong = new Audio();
let songs=[];
let currfolder;

async function getSongs(folder) {
  currfolder = folder;
  try {
    // Fetch the directory listing
    let response = await fetch(`http://127.0.0.1:5500/${folder}/`);

    // Check if the response is okay
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Get the response text (HTML)
    let res = await response.text();
   

    // Parse the HTML to extract song information
    let parser = new DOMParser();
    let doc = parser.parseFromString(res, "text/html");

    // Select the list items (assuming the directory listing is in a UL)
    let listItems = doc.querySelectorAll("ul#files li a");

    // Iterate over list items and extract song details
    listItems.forEach((item) => {
      let name = item.querySelector(".name").textContent;
      let size = item.querySelector(".size").textContent;
      let dateModified = item.querySelector(".date").textContent;
      console.log(
        `Name: ${name}, Size: ${size}, Date Modified: ${dateModified}`
      );
    });

    let div = document.createElement("div");
    div.innerHTML = res;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
      const element = as[index];
      if (element.href.endsWith(".mp3")) {
        songs.push(element.href.split("/").pop());
      }
    }
    // return songs;
  } catch (error) {
    // Log any errors
    console.error("Error fetching the songs directory:", error);
  }

  let songul = document.querySelector(".songlist ul");
  songul.innerHTML = ""
  for (const song of songs) {
    let songName = song.split("/").pop().split("%20").join(" ");
    songul.innerHTML =
      songul.innerHTML +
      `<li> 
        <img class="invert" src="music.svg" alt="">
        <div class="info">
          <div class="musicname">${songName}</div>
          <div class="musicartist">song artist</div>
        </div>
        <div class="playnow">
          <span>play now</span>
          <img class="invert" src="play.svg" alt="">
        </div>
       </li>`;
  }

  //attatch an event listener
  Array.from(
    document.querySelector(".songlist").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      
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

//this function solves the issue of landing page song not loading with playbar play button
const initializeFirstSong = (track) => {
  console.log("Initializing first song:", track);
  currentsong.src = `/${currfolder}/` + track;
  currentsong.load(); // Ensure the new source is loaded
  document.querySelector(".songinfo").innerHTML = decodeURI(
    track.split("/").pop()
  );
  document.querySelector(".songtime").innerHTML = "00:00";
};

async function main() {
  //get the list of songs
   await getSongs("songs/eng");
  // playmusic(songs[0], true);

  //coded with gpt
  if (songs.length > 0) {
    initializeFirstSong(songs[0]);
  }

  //displays all the songs in the playlist


  //define play pause next prev behaviour
  play.addEventListener("click", () => {
    if (currentsong.paused) {
      currentsong.play();
      play.src = "pause.svg";
    } else {
      currentsong.pause();
      play.src = "play.svg";
    }
  });

  //listen for time udpate listener
  currentsong.addEventListener("timeupdate", () => {
    
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currentsong.currentTime
    )}/${secondsToMinutesSeconds(currentsong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentsong.currentTime / currentsong.duration) * 100 + "%";
  });

  // adding an event listener to seekbar

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentsong.currentTime = (currentsong.duration * percent) / 100;
  });

  //adding event listener to hamburger

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = 0;
  });
  //adding event listener to close
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });


  previous.addEventListener("click", () => {
    console.log("previous clicked");
    let currentSrc = currentsong.src.split("/").pop();
    let index = songs.indexOf(currentSrc);
    if (index > 0) {
      playmusic(songs[index - 1]);
    }
    console.log(songs);
  });

  next.addEventListener("click", () => {
    console.log("next clicked");
    let currentSrc = currentsong.src.split("/").pop();
    let index = songs.indexOf(currentSrc);
    console.log(currentsong);
    
    if (index < songs.length - 1) {
      playmusic(songs[index + 1]);
    }
  });

  //adding event listener to volume button
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currentsong.volume = parseInt(e.target.value) / 100;
    });

  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      console.log(item.target);

      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
    });
  });

 
}

main();
