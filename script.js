(() => {
  "use strict";

  const bgAudio = document.getElementById("backgroundAudio");
  const songAudio = document.getElementById("ourSongAudio");

  const playPauseButton = document.getElementById("playPauseButton");
  const muteButton = document.getElementById("muteButton");
  const volumeSlider = document.getElementById("volumeSlider");
  const progressSlider = document.getElementById("progressSlider");

  const currentTime = document.getElementById("currentTime");
  const durationTime = document.getElementById("durationTime");
  const playerTitle = document.getElementById("playerTitle");
  const playerArtist = document.getElementById("playerArtist");
  const playerStatus = document.getElementById("playerStatus");

  const headerMusicButton =
    document.getElementById("headerMusicButton");
  const headerMusicLabel =
    document.getElementById("headerMusicLabel");

  const readHeartButton =
    document.getElementById("readHeartButton");
  const ourSongButton =
    document.getElementById("ourSongButton");

  const songArt = document.getElementById("songArt");
  const miniArt = document.getElementById("miniArt");

  const revealButton =
    document.getElementById("revealProposalButton");
  const proposalReveal =
    document.getElementById("proposalReveal");
  const closeProposalButton =
    document.getElementById("closeProposalButton");

  let activeAudio = bgAudio;
  let activeKind = "background";
  let preferredVolume = 0.55;
  let isMuted = false;
  let songMissing = false;

  const titles = {
    background: [
      "A Quiet Beginning",
      "Soft piano instrumental"
    ],
    song: [
      "Our Song",
      "A song chosen for us"
    ]
  };

  bgAudio.volume = preferredVolume;
  songAudio.volume = preferredVolume;

  function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) {
      return "0:00";
    }

    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");

    return `${minutes}:${secs}`;
  }

  function setStatus(message) {
    playerStatus.textContent = message;
  }

  function setTrack(kind) {
    activeKind = kind;
    activeAudio = kind === "song" ? songAudio : bgAudio;

    const meta = titles[kind];

    playerTitle.textContent = meta[0];
    playerArtist.textContent = meta[1];

    document.getElementById("ourSongTitle").textContent =
      meta[0];

    document.getElementById("ourSongArtist").textContent =
      meta[1];

    progressSlider.value = 0;
    currentTime.textContent = "0:00";
    durationTime.textContent = formatTime(activeAudio.duration);

    syncUI();
  }

  function syncUI() {
    const playing =
      !activeAudio.paused && !activeAudio.ended;

    playPauseButton.textContent = playing ? "Ⅱ" : "▶";

    playPauseButton.setAttribute(
      "aria-label",
      playing ? "Pause music" : "Play music"
    );

    muteButton.textContent =
      isMuted || preferredVolume === 0 ? "×" : "◖";

    muteButton.setAttribute(
      "aria-label",
      isMuted ? "Unmute audio" : "Mute audio"
    );

    document.body.classList.toggle("is-playing", playing);

    headerMusicLabel.textContent = playing
      ? "Pause soundtrack"
      : "Play our soundtrack";

    headerMusicButton.setAttribute(
      "aria-label",
      playing
        ? "Pause background music"
        : "Play background music"
    );

    songArt.classList.toggle(
      "rotating",
      playing && activeKind === "song"
    );

    miniArt.classList.toggle("rotating", playing);

    const bars = document.getElementById("audioBars");
    bars.style.opacity = playing ? "1" : ".5";

    if (playing) {
      setStatus(
        activeKind === "song"
          ? "Our song is playing"
          : "Now playing"
      );
    }
  }

  // Never allow both tracks to play simultaneously.
  function pauseAll(except) {
    [bgAudio, songAudio].forEach(audio => {
      if (audio !== except) {
        audio.pause();
      }
    });
  }

  async function playAudio(kind) {
    const target =
      kind === "song" ? songAudio : bgAudio;

    if (kind === "song" && songMissing) {
      setStatus("Add assets/music/our-song.mp3");
      return;
    }

    pauseAll(target);
    setTrack(kind);

    target.muted = isMuted;
    target.volume = preferredVolume;

    try {
      await target.play();

      setStatus(
        kind === "song"
          ? "Our song is playing"
          : "Now playing"
      );
    } catch (error) {
      setStatus(
        "Audio unavailable — check your music files"
      );

      console.warn(
        "Audio playback could not start:",
        error
      );
    }

    syncUI();
  }

  function togglePlayPause() {
    if (!activeAudio.paused) {
      activeAudio.pause();
      setStatus("Paused");
      syncUI();
    } else {
      playAudio(activeKind);
    }
  }

  // Handle missing audio files gracefully.
  songAudio.addEventListener("error", () => {
    songMissing = true;

    if (activeKind === "song") {
      setStatus("Add assets/music/our-song.mp3");
    }
  });

  bgAudio.addEventListener("error", () => {
    if (activeKind === "background") {
      setStatus(
        "Add assets/music/background-piano.mp3"
      );
    }
  });

  // Update playback time and progress.
  [bgAudio, songAudio].forEach(audio => {
    audio.addEventListener("timeupdate", () => {
      if (audio !== activeAudio) return;

      currentTime.textContent =
        formatTime(audio.currentTime);

      if (
        Number.isFinite(audio.duration) &&
        audio.duration > 0
      ) {
        progressSlider.value =
          (audio.currentTime / audio.duration) * 100;

        durationTime.textContent =
          formatTime(audio.duration);
      }
    });

    audio.addEventListener("loadedmetadata", () => {
      if (audio === activeAudio) {
        durationTime.textContent =
          formatTime(audio.duration);
      }
    });

    audio.addEventListener("play", syncUI);
    audio.addEventListener("pause", syncUI);
    audio.addEventListener("ended", syncUI);
  });

  // Main play/pause button.
  playPauseButton.addEventListener(
    "click",
    togglePlayPause
  );

  // Header music button.
  headerMusicButton.addEventListener("click", () => {
    if (!activeAudio.paused) {
      togglePlayPause();
    } else {
      playAudio(activeKind);
    }
  });

  // Read My Heart: start the instrumental after the click.
  readHeartButton.addEventListener("click", () => {
    document.getElementById("memories").scrollIntoView({
      behavior: "smooth"
    });

    if (activeAudio.paused) {
      playAudio("background");
    }
  });

  // Play or pause the special song.
  ourSongButton.addEventListener("click", () => {
    if (activeKind === "song" && !songAudio.paused) {
      songAudio.pause();
      setStatus("Our song paused");
      syncUI();
    } else {
      playAudio("song");
    }
  });

  // Mute/unmute.
  muteButton.addEventListener("click", () => {
    isMuted = !isMuted;

    [bgAudio, songAudio].forEach(audio => {
      audio.muted = isMuted;
    });

    syncUI();

    setStatus(
      isMuted
        ? "Muted"
        : activeAudio.paused
          ? "Ready when you are"
          : "Sound on"
    );
  });

  // Volume control.
  volumeSlider.addEventListener("input", () => {
    preferredVolume = Number(volumeSlider.value);

    [bgAudio, songAudio].forEach(audio => {
      audio.volume = preferredVolume;
    });

    syncUI();
  });

  // Seek through the currently selected track.
  progressSlider.addEventListener("input", () => {
    if (
      Number.isFinite(activeAudio.duration) &&
      activeAudio.duration > 0
    ) {
      activeAudio.currentTime =
        (Number(progressSlider.value) / 100) *
        activeAudio.duration;
    }
  });

  // Reveal the final proposal.
  revealButton.addEventListener("click", () => {
    proposalReveal.hidden = false;

    document.body.classList.add("cinematic");

    proposalReveal.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

    // Respect the visitor's mute preference.
    // Do not restart music if it is already playing.
    if (isMuted) {
      setStatus("Muted");
    } else if (activeAudio.paused) {
      playAudio("background");
    }

    revealButton.textContent =
      "Take your time with this";
  });

  // Let the visitor close the proposal message.
  closeProposalButton.addEventListener("click", () => {
    proposalReveal.hidden = true;

    document.body.classList.remove("cinematic");

    revealButton.textContent =
      "There is one thing I want to ask… ♡";
  });

  // Initial state: no autoplay.
  setTrack("background");
  setStatus("Sound off until you press play");
  syncUI();
})();
