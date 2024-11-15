import { Request, Response } from "express";
import { elasticSearchService } from "../Services/ElasticSearchService";
import { UnfinishedLogsService } from "../Services/QueryService";
import { catchError, combineLatest, map, of, switchMap } from "rxjs";

export const QueryControllerObs = (
  frequency: string,
  action: string[],
  channelCode: string[],
  status: string,
  requestType: string
) => {
  return of(null).pipe(
    switchMap(() => {
      return elasticSearchService
        .getLogsObs({
          frequency,
          action,
          channelCode,
          status,
          requestType,
        })
        .pipe(
          map((logs) => {
            return { rawData: UnfinishedLogsService(logs) };
          })
        );
    }),
    catchError((error) => {
      return of({ error: error.message });
    })
  );
};
