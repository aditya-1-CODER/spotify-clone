    import { doc } from "prettier";
    import { fetchRequest } from "../api";
    import {ENDPOINT, getItemFromLocalStorage, LOADED_TRACKS, logout, SECTIONTYPE, setItemInLocalStorage} from "../common";
  
const audio = new Audio();
let displayName;
let count = 0;


    const loadUserProfile=()=>{
        return new Promise(async(resolve,reject)=>{

            const defaultImage = document.querySelector("#default-image");
            const profileButton = document.querySelector("#user-profile-button");
            const displayNameElement = document.querySelector("#display-name");
        
            const {display_name:displayName,images} = await fetchRequest(ENDPOINT.userInfo);
        
            const onProfileClick = (event)=>{
                event.stopPropagation();
                const profileMenu = document.querySelector("#profile-menu");
                profileMenu.classList.toggle("hidden");
                if(!profileMenu.classList.contains("hidden")){
                    profileMenu.querySelector("#logout").addEventListener("click",logout);
                }
        
            }
        
        
            if(images?.length){
                defaultImage.classList.add("hidden");
        
            }else{
                defaultImage.classList.remove("hidden");
            }
            displayNameElement.textContent = displayName;
            resolve({displayName})
        
            profileButton.addEventListener("click",onProfileClick)
        })

    }

    const loadPlaylist=async(endpoint,elementId)=>{
        const {playlists:{items}} = await fetchRequest(endpoint);

        const playlistSection = document.querySelector(`#${elementId}`);
    
        for(let {name,description,images,id} of items){  
            const playlistItem = document.createElement("section");
            playlistItem.className = "hover:bg-light-black bg-black-secondary rounded-xl p-4 hover:cursor-pointer";
            playlistItem.id = id;
            playlistItem.setAttribute("data-type","playlist");
            playlistItem.addEventListener("click",(event) => onPlaylistItemClicked(event,id));
        

            const [{url:imageUrl}] = images;
            playlistItem.innerHTML = `
            <img class="rounded-xl mb-2 object-contain shadow" src="${imageUrl}" alt="${name}">
            <h2 class="text-base font-semibold mb-4 truncate">${name}</h2>
            <h3 class="text-sm text-secondary line-clamp-2 ">${description}
            </h3>
        `
        playlistSection.appendChild(playlistItem);
        
        }

    }

    const loadPlaylists = ()=>{
        loadPlaylist(ENDPOINT.featuredPlaylist,"featured-playlist-items");
        loadPlaylist(ENDPOINT.toplists,"top-playlist-items");
    }

    const fillContentForDashboard=()=>{
        
        const coverContent = document.querySelector("#cover-content");
        if(count ===  0){
        coverContent.innerHTML=` <article class="grid grid-cols-[auto_1fr]"><img class="h-8 w-8 " src ="../assets/Spotify_Primary_Logo_RGB_Green.png">
        <h1 class="text-3xl font-semibold ">Listen to your favourite songs...</h1></article>
      <article class="grid grid-cols-[1.5fr_auto]">
        <h1 class=" text-4xl font-bold text-center mt-20 items-start"> Hello ${displayName}!!!</h1>
      <h1 class = "text-2xl font-semibold text-end ">Spotify clone by Parikshit</h1>
      </article>`;}
       
        const playListMap = new Map([["featured","featured-playlist-items"],["top playlists","top-playlist-items"]]);
        let innerHTML = "";
    
        for(let[type,id] of playListMap){
            innerHTML += `<article class="p-4">
        <h1 class="text-2xl mb-4 font-bold capitalize">${type}</h1>
        <section class="featured-songs grid grid-cols-auto-fill-cards gap-4" id="${id}">
    </section>

    </article>`;
        }
        document.getElementById("page-content").innerHTML = innerHTML;

    }
    const onPlaylistItemClicked=(event,id)=>{
        console.log(event.target);
        const section = {type:SECTIONTYPE.PLAYLIST,playlist:id};
        history.pushState(section,"",`playlist/${id}`);
        loadSection(section);
        
    }
    const onTrackSelection=(id,event)=>{
        document.querySelectorAll("#tracks .track").forEach(trackItem=>{
            if(trackItem.id ===id){
                trackItem.classList.add("bg-gray","selected");
            }else{
                trackItem.classList.remove("bg-gray","selected");
            }
        })
    }
const updateIconsForPlaymode = (id)=>{
    const playButton = document.querySelector("#play");
    const playButtonFromTracks=
    document.querySelector(`#play-track-${id}`);
    playButton.querySelector("span").textContent=`pause_circle`;
    if(playButtonFromTracks){
    playButtonFromTracks.textContent ="pause";}
    
}
// const timeline = document.querySelector(#)
const updateIconsForPause=(id)=>{
    const playButton = document.querySelector("#play");
    playButton.querySelector("span").textContent=`play_circle`;

    const playButtonFromTracks=
    document.querySelector(`#play-track-${id}`);
    if(playButtonFromTracks){
    playButtonFromTracks.textContent ="play_arrow";}

}
    const onAudioMetadataLoaded = ()=>{
        const totalSongDuration = document.querySelector("#total-song-duration");
        totalSongDuration.textContent = `0:${audio.duration.toFixed(0)}`;
       
       
    }
 

    const togglePlay =()=>{
     if(audio.src){
        if(audio.paused){
            audio.play();
            }
                else{audio.pause();  }


    }
}
const findCurrentTrack = ()=>{
    const audioControl = document.querySelector("#audio-control");
    const trackId = audioControl.getAttribute("data-track-id");
    if(trackId){
        const  loadedTracks = getItemFromLocalStorage(LOADED_TRACKS);
        const currentTrackIndex = loadedTracks?.findIndex(trk=>trk.id === trackId);
        return {currentTrackIndex,tracks:loadedTracks};
    }

}
const playNextTrack =()=>{
    const {currentTrackIndex=-1,tracks = null}=findCurrentTrack()??{};
    if(currentTrackIndex>-1 && currentTrackIndex < tracks?.length - 1){
        playTrack(null,tracks[currentTrackIndex+1]);
    }
}

const playPrevTrack =()=>{
    const {currentTrackIndex=-1,tracks = null}=findCurrentTrack()??{};
    if(currentTrackIndex>0){
        playTrack(null,tracks[currentTrackIndex-1]);
    }
}



    const playTrack = (event,{image,artistNames,name,duration_ms,previewUrl,id})=>{
       if(event?.stopPropagation){
            event.stopPropagation();
       }
       
       if(audio.src ===previewUrl){
          togglePlay();
       }else{
       
            const nowPlayingSongImage = document.querySelector("#now-playing-image");
            
            const nowPlayingSongArtist = document.querySelector("#now-playing-artists");
            
            const nowPlayingSongName = document.querySelector("#now-playing-song");
            const audioControl = document.querySelector("#audio-control");
            const  songInfo = document.querySelector("#song-info");
            

            audioControl.setAttribute("data-track-id", id);
            nowPlayingSongArtist.textContent = artistNames;
            nowPlayingSongName.textContent = name;
            nowPlayingSongImage.src = image.url;
            audio.src = previewUrl;
            audio.play();
            songInfo.classList.remove("invisible");
            // timeline.addEventListener("click",)
           }
    }

    const loadPlaylistTracks=({tracks})=>{
        
        
        const trackSections = document.querySelector("#tracks");
        let trackNo =1;
        const loadedTracks = [];
        for(let trackItem of tracks.items.filter(item=>item.track.preview_url)
        ){
            let {id,artists,name,album,duration_ms,preview_url:previewUrl} = trackItem.track;


            let track = document.createElement("section");
            track.id = id;
            track.className= "track p-1 grid grid-cols-[50px_1fr_1fr_50px] gap-4 text-secondary items-center justify-items-start rounded-md hover:bg-light-black"

            let image = album.images.find(img=>img.height === 64 );
            let artistNames = Array.from(artists,artist=>artist.name).join(", ");

            track.innerHTML=` 
    <p class="justify-self-center relative w-full flex items-center justify-center"><span class="track-no">${trackNo++}</span></p>
    <section class="grid grid-cols-[auto_1fr]  place-items-center ">
    <img class="w-12 h-10 pr-2" src="${image.url}" alt="${name}"> 
    <article class="flex flex-col justify-center gap-2">
        <h2 class="song-title text-primary text-base line-clamp-1">
        ${name}
        </h2>
    <p class="text-xs line-clamp-1">
        ${artistNames}
    </p>
    </article>
    </section>
    <p class="text-sm">${album.name}</p>
    <p class="text-sm">${formatTime(duration_ms)}</p>
    </section>
            `
            track.addEventListener("click",(event)=>onTrackSelection(id,event))
            const playButton = document.createElement("button");
            playButton.id = `play-track-${id}`;
            playButton.className=`play w-full absolute left-0 text-lg invisible text-white material-symbols-outlined`;
            playButton.textContent ="play_arrow";

            playButton.addEventListener("click",(event)=>playTrack(event,{image,artistNames,name,duration_ms,previewUrl,id}))
            
            track.querySelector("p").appendChild(playButton);
            trackSections.appendChild(track);
            loadedTracks.push({id,artistNames,name,album,duration_ms,previewUrl,image});
            
        }
        setItemInLocalStorage(LOADED_TRACKS,loadedTracks);
    }
    const formatTime = (duration)=>{
        const min = Math.floor(duration/60000);
        const sec = ((duration%6000)/1000).toFixed(0);
        const formattedTime = sec == 60?
        min+1 +":00":min+":"+(sec<10?"0":"")+sec

        return formattedTime;
    }

    const fillContentForPlaylist = async(playListId)=>{
        const playlist = await fetchRequest(`${ENDPOINT.playlist}/${playListId}`);
        const {tracks,name ,description,images} = playlist;
        const coverElement = document.querySelector("#cover-content")
       
        coverElement.innerHTML =`<img class="object-contain h-40 w-40" src="${images[0].url}" alt=""><section>
     <h2 id="playlist-name" class="text-6xl font-bold ">${name}</h2>
      <p id="playlist-details" class="font-thin">${tracks.items.length} songs</p>
    </section>`;
        count++;
        
       
    const pageContent = document.querySelector("#page-content");
    pageContent.innerHTML=` <header id="playlist-header" class="mx-8 border-secondary border-b-[0.5px] z-10">
                <nav class="py-2">
                <ul class="grid grid-cols-[50px_2fr_1fr_50px] gap-4 text-secondary ">
                    <li>#</li>
                    <li>Title</li>
                    <li>Albums</li>
                    <li>🕛</li>
                </ul>
                </nav>
            </header>
            <section id="tracks" class="px-8 text-secondary mt-4 ">
    `;

        loadPlaylistTracks(playlist)
    


    }

    const onContentScroll = (event)=>{
        const scrollTop = event.target.scrollTop;
        const header = document.querySelector(".header");
        const coverElement = document.querySelector("#cover-content");
        const totalHeight = coverElement.offsetHeight;
        const coverOpacity = 100 - (scrollTop >= totalHeight ?100:(scrollTop/totalHeight)*100);
        const headerOpacity = scrollTop>=header.offsetHeight?100:(scrollTop/header.offsetHeight)*100;
        coverElement.style.opacity = `${coverOpacity}%`;
        header.style.background = `rgba(0 0 0 /${headerOpacity}%)`;

  
    if(history.state.type === SECTIONTYPE.PLAYLIST){
       
        const playlistHeader = document.querySelector("#playlist-header");
        if(coverOpacity<=35 ){
            playlistHeader.classList.add("sticky","bg-black-secondary","px-8")
            playlistHeader.classList.remove("mx-8");
            playlistHeader.style.top = `${header.offsetHeight}px`
        }
        else{ playlistHeader.classList.remove("sticky","bg-black-secondary","px-8")
            playlistHeader.classList.add("mx-8");
            playlistHeader.style.top = `revert`
        }
    
    }

    }


    const loadSection = (section)=>{
        if(section.type === SECTIONTYPE.DASHBOARD){
            fillContentForDashboard();
            loadPlaylists();
        }
        else{
            //elemts for playlist
            fillContentForPlaylist(section.playlist);
        
        } 
        document.querySelector(".content").removeEventListener("scroll",onContentScroll);
        document.querySelector(".content").addEventListener("scroll",onContentScroll);
                
    
    }

 const onUserPlaylistClick = (id)=>{
    const section = {type:SECTIONTYPE.PLAYLIST,playlist:id};
    history.pushState(section,"",`playlist/${id}`);
    loadSection(section);
 }

    const loadUserPlaylist =async()=>{
        const playlists = await fetchRequest(ENDPOINT.userPlaylist);
        
        const userPlaylistSection = document.querySelector("#user-playlists > ul");
        userPlaylistSection.innerHTML="";

        for(let {name,id} of playlists.items){
            const li = document.createElement("li");
            li.textContent = name;
            li.className ="cursor-pointer hover:text-primary"
            li.addEventListener("click",()=>onUserPlaylistClick(id));
            userPlaylistSection.appendChild(li);

        }
    }

    document.addEventListener("DOMContentLoaded",async ()=>{
        const audioControl = document.querySelector("#audio-control");
        const next = document.querySelector("#next");
        const prev = document.querySelector("#prev");
        const volume = document.querySelector("#volume");
        
        const playButton = document.querySelector("#play");
       
        const songDurationCompleted = document.querySelector("#song-duration-completed");
        const songProgress = document.querySelector("#progress");
        const timeline = document.querySelector("#timeline");
        let progressInterval;
        ({displayName} = await loadUserProfile());
        loadUserPlaylist();
        const section = {type:SECTIONTYPE.DASHBOARD};
        
        // const section = {
        //     type:SECTIONTYPE.PLAYLIST,playlist:"37i9dQZF1DX0XUfTFmNBRM"
        // }

        history.pushState(section,"","");
        // history.pushState(section,"",`/dashboard/playlist/${section.playlist}`);
        loadSection(section);
        document.addEventListener("click",()=>{
            const profileMenu = document.querySelector("#profile-menu");
        if(!profileMenu.classList.contains("hidden")){
            profileMenu.classList.add("hidden");
        }
        
        })

        audio.addEventListener("play",()=>{
            
            const selectedTrackId = audioControl.getAttribute("data-track-id");
            const tracks = document.querySelector("#tracks");
            const selectedTrack = tracks?.querySelector(`[id="${selectedTrackId}"]`);
            const playingTrack=tracks?.querySelector("section.playing");

            if(playingTrack?.id !== selectedTrack?.id){
                playingTrack?.classList.remove("playing");
            }
            
            selectedTrack?.classList.add("playing");
          

            progressInterval = setInterval(() => {
                if(audio.paused){
                    return
                }
                songDurationCompleted.textContent = `${audio.currentTime.toFixed(0)<10 ?"0:0"+audio.currentTime.toFixed(0):"0:"+audio.currentTime.toFixed(0)}`;
                songProgress.style.width = `${(audio.currentTime/audio.duration)*100}%`;
            }, 100);
            updateIconsForPlaymode(selectedTrackId);
        });
        audio.addEventListener("pause",()=>{
            if(progressInterval){
           clearInterval(progressInterval);}
           const selectedTrackId = audioControl.getAttribute("data-track-id");
           updateIconsForPause(selectedTrackId);
        })

        audio.addEventListener("loadedmetadata",onAudioMetadataLoaded);
        playButton.addEventListener("click",togglePlay);

        next.addEventListener("click",playNextTrack);
        prev.addEventListener("click",playPrevTrack);


volume.addEventListener("change",()=>{
    audio.volume = volume.value/100;
})
timeline.addEventListener("click",(e)=>{
    const timelineWidth = window.getComputedStyle(timeline).width;
    const timeToSeek = (e.offsetX / parseInt(timelineWidth)) * audio.duration;
    audio.currentTime = timeToSeek;
    songProgress.style.width = (audio.currentTime / audio.duration)*100;

},false);
    
    
    window.addEventListener("popstate",(event)=>{
        loadSection(event.state);
        
    })
    })
  