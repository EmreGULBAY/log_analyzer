import express from "express";
import bodyParser from "body-parser";
import { elasticSearchService } from "./Services/ElasticSearchService";
import { QueryController } from "./Controllers/QueryController";
import promClient from "prom-client";

export const createServer = () => {
  const app = express();
  app.use(bodyParser.json());

  app.get("/index-log", async (req, res) => {
    const response = await elasticSearchService.indexLog();
    res.status(200).json(response);
  });

  app.post("/query", QueryController);

  app.get("/metrics", async (req, res) => {
    try {
      res.set("Content-Type", promClient.register.contentType);
      const metrics = await promClient.register.metrics();
      res.end(metrics);
    } catch (err) {
      res.status(500).send(`Error generating metrics: ${err}`);
    }
  });

  app.get("/", (req, res) => {
    res.sendFile(__dirname + "/Assets/index.html");
  });

  app.get("/style.css", (req, res) => {
    res.sendFile(__dirname + "/Assets/style.css");
  });

  app.get("/script.js", (req, res) => {
    res.sendFile(__dirname + "/Assets/script.js");
  });

  app.get("*", (req, res) => {
    res.status(404).send("Not Found");
  });

  return app;
};
