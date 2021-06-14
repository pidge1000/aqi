import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from '../environments/environment';
import { catchError, tap, switchAll } from 'rxjs/operators';
import { EMPTY, Subject } from 'rxjs';
const subject = webSocket(environment.wsEndpoint);
  
@Injectable({
  providedIn: 'root'
})
export class DataService {
  private messagesSubject$ = new Subject();
  public messages$ = this.messagesSubject$.pipe(switchAll(), catchError(e => { throw e }));
  
  public connect(): void {
    subject.subscribe(
      msg => this.messagesSubject$.next(msg), // Called whenever there is a message from the server.
      err => console.log(err), // Called if at any point WebSocket API signals some kind of error.
      () => console.log('complete') // Called when connection is closed (for whatever reason).
    );
  }
}