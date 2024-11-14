import { Request, Response } from "express";
import { elasticSearchService } from "../Services/ElasticSearchService";
import { UnfinishedLogsService } from "../Services/QueryService";
import { VisualizeLogs } from "../Services/ChartService";
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
        .pipe(map((logs) => UnfinishedLogsService(logs)));
    }),
    map((logs) => {
      const canvas = VisualizeLogs(logs);
      return { chartConfig: canvas, rawData: logs };
    }),
    catchError((error) => {
      return of({ error: error.message });
    })
  );
};
