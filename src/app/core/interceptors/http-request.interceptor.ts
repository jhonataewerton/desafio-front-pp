import { SpinnerService } from "./../../components/spinner/spinner.service";
import { Injectable } from "@angular/core";
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
} from "@angular/common/http";
import { Observable } from "rxjs";
import { catchError, map } from "rxjs/operators";

@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {
  constructor(private _loading: SpinnerService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    this._loading.setLoading(true, request.url);
    return next
      .handle(request)
      .pipe(
        catchError((err) => {
          this._loading.setLoading(false, request.url);
          return err;
        })
      )
      .pipe(
        map<HttpEvent<any>, any>((evt: HttpEvent<any>) => {
          if (evt instanceof HttpResponse) {
            this._loading.setLoading(false, request.url);
          }
          return evt;
        })
      );
  }
}