import { AfterViewInit, Component, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import * as twModule from '../lib/index';

const tw = twModule.default;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  constructor(
    private http: HttpClient,
    private el: ElementRef,
  ) {
    console.log(tw);
  }


  ngAfterViewInit(): void {


    this.http.get<any>('http://dev.teleporta.me/token')
    .subscribe(({ token }) => {
      console.log('token', token);
      tw.createLocalTracks({
        audio: true,
        video: { width: 640 },
      })
        
      .then((localTracks) => {
        // localTracks.forEach(t => this.addMediaEl(t));
        return tw.connect(
          token,
          {
            name: 'cool-room',
            tracks: localTracks,
          },
        )
      })
      .then((room) => {
        console.log(`Successfully joined a Room: ${room}`);
        room.on('participantConnected', participant => {
          console.log(`A remote Participant connected: ${participant}`);
          participant.tracks.forEach(t => this.addMediaEl(t));
        });

        room.participants.forEach(p => {
          p.tracks.forEach(t => this.addMediaEl(t));
        });
      })
      .catch((err) => {
        console.error(err);
      })

    });
  }


  private addMediaEl(track: any): void {
    this.el.nativeElement.appendChild(track.attach());
  }
}
