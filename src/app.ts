import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { getElasticSearchService } from "./Services/ElasticSearchService";
import { QueryControllerObs } from "./Controllers/QueryController";
import promClient from "prom-client";

export const createServer = () => {
  const app = express();
  app.use(bodyParser.json());
  /*
  app.get("/index-log", async (req, res) => {
    const response = await getElasticSearchService().indexLog();
    res.status(200).json(response);
  });
*/
  app.post("/query", (req: Request, res: Response) => {
    QueryControllerObs(
      req.body.frequency,
      req.body.action,
      req.body.channelCode,
      req.body.status,
      req.body.requestType
    ).subscribe({
      next: (data) => res.status(200).json(data),
      error: (error) => {
        console.error("Query error:", error);
        res.status(error.status || 500).json({
          error: error.message || "Internal Server Error",
        });
      },
    });
  });

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
