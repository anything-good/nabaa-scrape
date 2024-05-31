const express = require("express");
const multer = require("multer");
const csvParser = require("csv-parser");
const fs = require("node:fs");
const scrape = require("./scrape");

const app = express();
const upload = multer({ dest: "uploads/" });

app.get("/", (req, res) => {
	// print node version
	console.log(process.version);
	res.sendFile(`${__dirname}/index.html`);
});

app.post("/upload", upload.single("csvfile"), async (req, res) => {
	const filePath = req.file.path;

	const listRes = await fetch(
		"https://ali.elitestudents.link/api/laptop-lists",
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: "Bearer rKtFskRVvRK9J1r0X5xMGnqU2NUvMC2JcOtXtLVt",
			},
			body: JSON.stringify({ name: req.body.name }),
		},
	);

	const list = await listRes.json();

	fs.createReadStream(filePath)
		.pipe(csvParser())
		.on("data", async (row) => {
			const privatePrice = row.price;
			const { publicName, publicPrice, publicImages } = await scrape(row.name);

			const res = await fetch(
				`https://ali.elitestudents.link/api/laptop-lists/${list.id}/laptops`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: "Bearer rKtFskRVvRK9J1r0X5xMGnqU2NUvMC2JcOtXtLVt",
					},
					body: JSON.stringify({
						name: publicName === "not found" ? row.name : publicName,
						public_price: publicPrice,
						private_price: privatePrice,
						images: publicImages,
					}),
				},
			);

			console.log("--------start---------");
			console.log("res", res.body);
			console.log("publicName", publicName);
			console.log("publicPrice", publicPrice);
			console.log("privatePrice", privatePrice);
			console.log("--------done---------");
		})
		.on("end", () => {
			fs.unlinkSync(filePath); // Remove the uploaded file
			res.json({ success: true });
		})
		.on("error", (err) => {
			console.error("Error processing CSV:", err);
			res.status(500).json({ error: "Internal server error" });
		});
});

app.listen(3200, () => console.log("Server started on port 3200"));
