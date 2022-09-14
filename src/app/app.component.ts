import { AfterViewInit, Component, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import * as twModule from '../lib/index';
import { ActivatedRoute } from '@angular/router';
import { filter, map, pluck, switchMap } from 'rxjs';

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
    private route: ActivatedRoute,
  ) {
    console.log(tw);
  }


  ngAfterViewInit(): void {

    this.route.queryParams
    .pipe(
      map((params) => {
        return params?.identity;
      }),
      filter(Boolean),
      switchMap((identity) => this.http.get<any>(`http://dev.teleporta.me/token?identity=${identity}`)),
    )
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
        window['twRoom'] = room;
        console.log(`Successfully joined a Room: ${room}`);
        room.on('participantConnected', participant => {
          console.log(`A remote Participant connected: ${participant}`);
          participant.tracks.forEach(publication => {
            if (publication.isSubscribed) {
              const track: any = publication.track;
              this.addMediaEl(track);
            }
          });
        
          participant.on('trackSubscribed', (track: any) => {
            this.addMediaEl(track);
          });
        });

        room.participants.forEach(p => {
          console.log(p);
          p.on('trackSubscribed', (track: any) => {
            this.addMediaEl(track);
          });
          p.tracks.forEach(p => {
            if (p.track) {
              this.addMediaEl(p.track);
            }
          });
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
