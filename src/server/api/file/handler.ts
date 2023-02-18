import formidable from "formidable";
import type { NextApiRequest, NextApiResponse } from "next";
import express from "express";
import path from "path";
import fs from "fs";
import { route } from "nextjs-routes";
import { getServerAuthSession } from "@/server/auth";
import { maxFileSize, uploadResponseSchema } from "./schema";

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

const imagesDirectory = path.join(process.cwd(), "upload", "images");
const acceptedImageTypes = ["image/png", "image/jpeg", "image/svg+xml"];

const app = express();
const serveFiles = express.static(imagesDirectory);
app.use(["/api/file"], serveFiles);

const handleFileGet = (req: NextApiRequest, res: NextApiResponse) => {
  return app(req, res) as unknown;
};

const handleFileUpload = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerAuthSession({
    req,
    res,
  });

  if (
    !session ||
    (session.user.role !== "ADMIN" && session.user.role !== "OWNER")
  ) {
    res.writeHead(403, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not authorized" }));
    return;
  }

  if (!fs.existsSync(imagesDirectory)) {
    fs.mkdirSync(imagesDirectory, { recursive: true });
  }

  const form = new formidable.IncomingForm({
    uploadDir: imagesDirectory,
    keepExtensions: true,
    maxFiles: 1,
    maxFileSize,
  });

  form.onPart = (part) => {
    if (!part.mimetype || !acceptedImageTypes.includes(part.mimetype)) {
      return;
    }
    form._handlePart(part);
  };

  form.parse(
    req,
    (err: { httpCode: number; message: string }, _fields, files) => {
      if (err) {
        res.writeHead(err.httpCode || 400, {
          "Content-Type": "application/json",
        });
        res.end(JSON.stringify({ error: err.message }));
        return;
      }

      if (files.file instanceof Array) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Too many files" }));
        return;
      }

      if (!acceptedImageTypes.includes(files.file?.mimetype ?? "")) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "File is not an image" }));
        return;
      }

      if (!files.file) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "No file" }));
        return;
      }

      const response = uploadResponseSchema.parse({
        url: route({
          pathname: "/api/file/[name]",
          query: {
            name: files.file.newFilename,
          },
        }),
      });

      res.send(response);
    }
  );
};

export const handler = (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "HEAD":
    case "GET":
      return handleFileGet(req, res);
    case "POST":
      return handleFileUpload(req, res);
    default:
      res.status(405).end();
  }
};
