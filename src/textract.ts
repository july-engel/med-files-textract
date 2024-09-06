import {
  TextractClient,
  DetectDocumentTextCommand,
} from "@aws-sdk/client-textract";
import { Comprehend } from "@aws-sdk/client-comprehend";
import fs from "fs";

async function detectTextFromImage(
  imagePath: string
): Promise<string[] | undefined> {
  const imageBytes = fs.readFileSync(imagePath);

  try {
    const command = new DetectDocumentTextCommand({
      Document: {
        Bytes: imageBytes,
      },
    });

    const instancyTextractClient = new TextractClient({ region: "us-east-1" });
    const response = await instancyTextractClient.send(command);

    const lines =
      response.Blocks?.map((block) =>
        block.BlockType === "LINE" ? block.Text || "" : ""
      ).filter(Boolean) || [];

    return lines || [];
  } catch (error) {
    console.error("Erro ao detectar texto:", error);
  }
}

async function detectEntitiesFromText(lines: string[]): Promise<string[][]> {
  const responseEntities: string[][] = [];

  const instancyComprehendClient = new Comprehend({
    region: "us-east-1",
  });

  for (const line of lines) {
    const entitiesList: string[] = [];

    const foundEntities = await instancyComprehendClient.detectEntities({
      Text: line,
      LanguageCode: "en",
    });

    for (const item of foundEntities.Entities || []) {
      if (item.Text) {
        entitiesList.push(item.Text);
        console.log(item.Text);
      }
    }
    responseEntities.push(entitiesList);
  }

  return responseEntities;
}

async function main(imagePath: string) {
  const response_lines = await detectTextFromImage(imagePath);
  if (!response_lines) {
    console.error("Erro ao detectar texto na imagem.");
    return;
  }

  console.log(response_lines);

  // const response_entities = await detectEntitiesFromText(response_lines);
  // console.log(response_entities);
}

const imagePath = process.argv[2];
if (imagePath) {
  main(imagePath);
} else {
  console.error("Por favor, forneça o caminho de uma imagem como argumento.");
}
