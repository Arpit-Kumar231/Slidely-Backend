import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import { Request, Response } from "express";

const app = express();
const PORT = 3000;
const dbFilePath = path.join(__dirname, "db.json");

app.use(bodyParser.json());
interface Submission {
  Name: string;
  Email: string;
  PhoneNumber: string; // keeping it string for now, type will generally be number
  GitHubLink: string;
  StopwatchTime: string;
}

if (!fs.existsSync(dbFilePath)) {
  fs.writeFileSync(dbFilePath, JSON.stringify([]));
}

const loadSubmissions = (): Submission[] => {
  const data = fs.readFileSync(dbFilePath, "utf-8");
  return JSON.parse(data) as Submission[];
};

const saveSubmissions = (submissions: Submission[]) => {
  fs.writeFileSync(dbFilePath, JSON.stringify(submissions, null, 2));
};

app.get("/ping", (req: Request, res: Response) => {
  res.send(true);
});

app.post("/submit", (req: Request, res: Response) => {
  const { Name, Email, PhoneNumber, GitHubLink, StopwatchTime } = req.body;

  console.log(Name, Email, PhoneNumber, GitHubLink, StopwatchTime);
  const submissions = loadSubmissions();
  submissions.push({ Name, Email, PhoneNumber, GitHubLink, StopwatchTime });
  saveSubmissions(submissions);
  //   res.json({ success: true });
  res.send(submissions);
});

app.get("/read", (req: Request, res: Response) => {
  const index = parseInt(req.query.index as string, 10);
  const submissions = loadSubmissions();
  if (index >= 0 && index < submissions.length) {
    res.json(submissions[index]);
  } else {
    res.status(404).json({ error: "Submission not found" });
  }
});
