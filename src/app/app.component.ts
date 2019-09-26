import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { flatMap, mergeMap, toArray, distinct, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit {
  readonly api = '?apikey=5824d754&';
  readonly ROOT_URL = 'http://www.omdbapi.com/' + this.api;

  constructor(private http: HttpClient) { }

  movies: Observable<any>;
  years: Observable<any>;
  selectedIndex: number;
  basicMovie = 'Batman';

  getMovies(movie: string = this.basicMovie, decade?: number) {
    this.movies = this.http.get(this.ROOT_URL + 's=' + movie)
      .pipe(
        flatMap((res: any) => res.Search),
        mergeMap((x: any) => {
          const movieDecade = Math.floor(x.Year.split('–')[0] / 10) * 10;
          const getItems = this.http.get(this.ROOT_URL + 'i=' + x.imdbID);


          if (decade !== undefined) {
            if (movieDecade === decade) {
              return getItems;
            } else {
              return [];
            }
          } else {
            return getItems;
          }
        }),
        toArray()
      );
  }
  getDecade(movie: string = this.basicMovie) {
    this.years = this.http.get(this.ROOT_URL + 's=' + movie)
      .pipe(
        flatMap((res: any) => res.Search),
        mergeMap((x: any) => this.http.get(this.ROOT_URL + 'i=' + x.imdbID)),
        mergeMap((x: any) => {
          const dates = Math.floor(x.Released.split(' ')[2] / 10) * 10;
          return [dates];
        }),
        distinct(val => val),
        toArray(),
        map(arr => arr.sort())

      );
  }

  filterDecade(index: number = null, decade?: number, movie?: string) {
    if (index != null) {
      this.getMovies(movie !== '' ? movie : this.basicMovie, decade);
      this.selectedIndex = index;
    } else {
      this.selectedIndex = -1;
    }
  }

  refreshAll(m: string) {
    const movie = m !== '' ? m : this.basicMovie;
    this.getMovies(movie);
    this.getDecade(movie);
    this.filterDecade();
  }

  ngOnInit() {
    this.getMovies();
    this.getDecade();
  }

}
