import {
  TextractClient,
  DetectDocumentTextCommand,
} from "@aws-sdk/client-textract";
import {
  Comprehend,
  DetectEntitiesCommandOutput,
  LanguageCode,
} from "@aws-sdk/client-comprehend";
import fs from "fs";

async function detectTextFromImage(
  imagePath: string
): Promise<string | undefined> {
  const imageBytes = fs.readFileSync(imagePath);

  try {
    const command = new DetectDocumentTextCommand({
      Document: {
        Bytes: imageBytes,
      },
    });

    const instancyTextractClient = new TextractClient({ region: "us-east-1" });
    const response = await instancyTextractClient.send(command);

    const text = response.Blocks?.map((block) => {
      return block.BlockType === "LINE" ? block.Text || "" : "";
    })
      .filter(Boolean)
      .join(" ");

    return text || "";
  } catch (error) {
    console.error("Erro ao detectar texto:", error);
  }
}

async function detectEntitiesFromText(
  text: string,
  languageCode: LanguageCode = "pt"
): Promise<DetectEntitiesCommandOutput> {
  const instancyComprehendClient = new Comprehend({
    region: "us-east-1",
  });

  const responseEntities = await instancyComprehendClient.detectEntities({
    Text: text,
    LanguageCode: languageCode,
  });

  return responseEntities;
}

async function main(imagePath: string) {
  const responseText = await detectTextFromImage(imagePath);
  if (!responseText) {
    console.error("Erro ao detectar texto na imagem.");
    return;
  }

  const responseEntities = await detectEntitiesFromText(responseText);
  console.log(responseEntities);
}

const imagePath = process.argv[2];
if (imagePath) {
  main(imagePath);
} else {
  console.error("Por favor, forneça o caminho de uma imagem como argumento.");
}
