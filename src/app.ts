import express from "express";
import bodyParser from "body-parser";
import { elasticSearchService } from "./Services/ElasticSearchService";
import { QueryController } from "./Controllers/QueryController";

export const createServer = () => {
  const app = express();
  app.use(bodyParser.json());

  app.get("/index-log", async (req, res) => {
    const response = await elasticSearchService.indexLog();
    res.status(200).json(response);
  });

  app.post("/query", QueryController);

  app.get("*", (req, res) => {
    res.status(404).send("Not Found");
  });

  return app;
};
