import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { findIndex } from 'rxjs';
import { MediaItem } from './interfaces';
import { OptionsService } from './options';

@Injectable({
  providedIn: 'root',
})
export class MediaService {
  media: MediaItem[] = [];
  audio?: HTMLAudioElement;
  current?: MediaItem;
  index = 0;

  get canPrevious() {
    return this.index > 0;
  }

  get canNext() {
    return this.index < this.media.length - 1;
  }

  constructor(private options: OptionsService, private snackBar: MatSnackBar) {
    navigator.mediaSession.setActionHandler('play', async () => {
      if (!this.audio) {
        return;
      }

      // Resume playback
      try {
        await this.audio.play();
      } catch (err: any) {
        console.error(err.name, err.message);
      }
    });

    navigator.mediaSession.setActionHandler('pause', () => {
      if (!this.audio) {
        return;
      }

      // Pause active playback
      this.audio.pause();
    });

    navigator.mediaSession.setActionHandler('seekbackward', () => {
      this.rewind(10);
    });
    navigator.mediaSession.setActionHandler('seekforward', () => {
      this.forward(10);
    });
    navigator.mediaSession.setActionHandler('previoustrack', () => {
      if (this.canPrevious) {
        this.previous();
      }
    });
    navigator.mediaSession.setActionHandler('nexttrack', () => {
      if (this.canNext) {
        this.next();
      }
    });
  }

  exit() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio = undefined;
    }

    this.index = -1;
    this.current = undefined;
    this.options.values.showMediaPlayer = false;
    this.media = [];
  }

  play(file: MediaItem) {
    this.options.values.showMediaPlayer = true;
    this.media = [];
    this.media.push(file);

    // this.stop();

    this.start();
  }

  enque(file: MediaItem) {
    // TODO: Clean the file.source URL!
    this.options.values.showMediaPlayer = true;
    this.media.push(file);
    // this.snackBar.open('Added to media queue', 'Hide', {
    //   duration: 1500,
    //   horizontalPosition: 'center',
    //   verticalPosition: 'bottom',
    // });
  }

  dequeue (file : MediaItem) {
    const index = this.media.findIndex((e)=>e=== file);
    if (index === -1){
      return
    }
    this.media.splice(index, 1)
  }

  async start() {
    if (this.index === -1) {
      this.index = 0;
    }

    const file = this.media[this.index];

    console.log(file);

    if (!file) {
      return;
    }

    this.current = file;

    this.options.values.showMediaPlayer = true;

    if (!this.audio) {
      this.audio = new Audio(file.source);
    } else {
      this.audio.src = file.source;
    }

    await this.audio.play();

    navigator.mediaSession.metadata = new MediaMetadata({
      title: file.title,
      artist: file.artist,
      album: 'Blockcore Notes',
      artwork: [{ src: file.artwork }],
    });

    navigator.mediaSession.playbackState = 'playing';
  }

  async resume() {
    if (!this.audio) {
      this.start();
      return;
    }

    console.log('RESUME!');
    try {
      await this.audio.play();
    } catch (err) {
      console.error(err);
    }
  }

  pause() {
    if (!this.audio) {
      return;
    }

    this.audio.pause();

    navigator.mediaSession.playbackState = 'paused';
  }

  next() {
    this.index++;
    this.start();
  }

  previous() {
    this.index--;
    this.start();
  }

  get error() {
    return this.audio?.error;
  }

  get paused() {
    if (!this.audio) {
      return true;
    }

    return this.audio.paused;
  }

  get muted() {
    if (!this.audio) {
      return false;
    }

    return this.audio.muted;
  }

  get time() {
    if (!this.audio) {
      return 10;
    }

    return Math.floor(this.audio.currentTime);
  }

  set time(value) {
    if (!this.audio) {
      return;
    }

    this.audio.currentTime = value;
  }

  get duration() {
    if (!this.audio) {
      return 100;
    }

    return Math.floor(this.audio.duration);
  }

  mute() {
    if (!this.audio) {
      return;
    }

    this.audio.muted = !this.audio.muted;
  }

  forward(value: number) {
    if (!this.audio) {
      return;
    }

    this.audio.currentTime += value;
  }

  rewind(value: number) {
    if (!this.audio) {
      return;
    }

    this.audio.currentTime -= value;
  }

  rate() {
    if (!this.audio) {
      return;
    }

    console.log(this.audio.playbackRate);

    if (this.audio.playbackRate == 2.0) {
      this.audio.playbackRate = 1.0;
    } else {
      this.audio.playbackRate = 2.0;
    }
  }
}
