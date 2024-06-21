import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import { Request, Response } from "express";

const app = express();
const PORT = 3000;
const dbFilePath = path.join(__dirname, "db.json");

function readDB(): Submission[] {
  if (fs.existsSync(dbFilePath)) {
    const data = fs.readFileSync(dbFilePath, "utf8");
    return JSON.parse(data);
  }
  return [];
}
function writeDB(data: Submission[]): void {
  fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), "utf8");
}

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
app.delete("/delete", (req: Request, res: Response) => {
  const index = parseInt(req.query.index as string, 10);
  const submissions = readDB();
  if (index >= 0 && index < submissions.length) {
    submissions.splice(index, 1);
    writeDB(submissions);
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

app.put("/update", (req: Request, res: Response) => {
  const index = parseInt(req.query.index as string, 10);
  const { Name, Email, PhoneNumber, GitHubLink, StopwatchTime } = req.body;
  let submissions = readDB();

  if (index >= 0 && index < submissions.length) {
    submissions[index] = {
      Name,
      Email,
      PhoneNumber,
      GitHubLink,
      StopwatchTime,
    };
    writeDB(submissions);
    res.send("Submission updated successfully!");
  } else {
    res.status(404).send("Submission not found");
  }
});
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
