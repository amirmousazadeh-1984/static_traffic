import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname } from "path";

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const mockAdminsPath = path.join(__dirname, "src/data/mockAdmins.ts");

app.post("/api/updateAdmins", (req, res) => {
  try {
    const admins = req.body;

    const formatZones = (zones) => {
      return zones
        .map(
          (zone) => `        {
          id: "${zone.id}",
          cameras: [${zone.cameras.map((cam) => `"${cam}"`).join(", ")}]
        }`,
        )
        .join(",\n");
    };

    const formatArray = (arr) => {
      return `[\n        ${arr.map((item) => `"${item}"`).join(",\n        ")}\n    ]`;
    };

    const formatAdmin = (admin) => {
      return `  {
    id: ${admin.id},
    name: "${admin.name}",
    access: {
      zones: [
${formatZones(admin.access.zones)}
      ],
      sections: ${formatArray(admin.access.sections)}
    }
  }`;
    };

    const formatAdminsFile = (admins) => {
      return `export type AccessType = {
  zones: {
    id: string;
    cameras: string[];
  }[];
  sections: string[];
};

export type AdminType = {
  id: number;
  name: string;
  access: AccessType;
};

export const mockAdmins: AdminType[] = [
${admins.map(formatAdmin).join(",\n")}
];\n`;
    };

    const content = formatAdminsFile(admins);
    fs.writeFileSync(mockAdminsPath, content, "utf-8");
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating admins:", error);
    res.status(500).json({ error: "Failed to update admins" });
  }
});

const PORT = 3001;
app.listen(PORT, () => {});
