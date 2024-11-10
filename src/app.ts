import express from "express";
import bodyParser from "body-parser";
import { elasticSearchService } from "./Services/ElasticSearchService";

export const createServer = () => {
  const app = express();
  app.use(bodyParser.json());

  app.get("/index-log", async (req, res) => {
    const response = await elasticSearchService.indexLog();
    res.status(200).json(response);
  });

  app.get("*", (req, res) => {
    res.status(404).send("Not Found");
  });

  return app;
};
