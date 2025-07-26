import "dotenv/config";
import express from "express";
import multer from "multer";
import { create } from "ipfs-http-client";
import path from "path";
import { fileURLToPath } from "url";
import mime from "mime-types";
import all from "it-all";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const ipfs = create({ url: process.env.IPFS_API || "http://127.0.0.1:5001" });

app.use(express.static(path.join(__dirname, "../public")));

app.post("/upload", upload.single("file"), async (req, res) => {
	try {
		const { originalname, buffer } = req.file;

		const { cid } = await ipfs.add(
			{ path: originalname, content: buffer },
			{ wrapWithDirectory: true }
		);

		res.json({ cid: cid.toString(), name: originalname });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.get("/download/:cid", async (req, res) => {
	try {
		const { cid } = req.params;
		const [entry] = await all(ipfs.ls(cid));
		const filename = entry?.name || "file";
		const filePath = `${cid}/${filename}`;

		const mimeType = mime.lookup(filename) || "application/octet-stream";
		res.setHeader("Content-Type", mimeType);
		res.setHeader(
			"Content-Disposition",
			`attachment; filename="${filename}"`
		);

		for await (const chunk of ipfs.cat(filePath)) {
			res.write(chunk);
		}
		res.end();
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
	console.log(`Server running at http://localhost:${PORT}`)
);
