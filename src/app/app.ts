import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngxs/store';
import { CheckAuth, LoadCurrentUser } from './store/auth/auth.actions';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private store = inject(Store);

  ngOnInit(): void {
    this.store.dispatch(new CheckAuth());
    this.store.dispatch(new LoadCurrentUser());
  }
}
