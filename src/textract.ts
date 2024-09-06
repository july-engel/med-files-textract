import {
  TextractClient,
  DetectDocumentTextCommand,
} from "@aws-sdk/client-textract";
import fs from "fs";

const client = new TextractClient({ region: "us-east-1" });

async function detectTextFromImage(imagePath: string) {
  const imageBytes = fs.readFileSync(imagePath);

  try {
    const command = new DetectDocumentTextCommand({
      Document: {
        Bytes: imageBytes,
      },
    });
    const response = await client.send(command);

    response.Blocks?.forEach((block) => {
      console.log(block.Text);
    });
  } catch (error) {
    console.error("Erro ao detectar texto:", error);
  }
}

const imagePath = process.argv[2];
if (imagePath) {
  detectTextFromImage(imagePath);
} else {
  console.error("Por favor, forneça o caminho de uma imagem como argumento.");
}
