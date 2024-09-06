import {
  TextractClient,
  DetectDocumentTextCommand,
} from "@aws-sdk/client-textract";
import fs from "fs";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

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

async function main(imagePath: string) {
  const responseText = await detectTextFromImage(imagePath);

  const AWS_REGION = "us-east-1";

  const MODEL_ID = "amazon.titan-text-express-v1";

  const PROMPT = `Hi. please stract crm number from${responseText}`;

  const payload = {
    inputText: PROMPT,
    textGenerationConfig: {
      maxTokenCount: 4096,
      stopSequences: [],
      temperature: 0,
      topP: 1,
    },
  };
  if (!responseText) {
    console.error("Erro ao detectar texto na imagem.");
    return;
  }

  const client = new BedrockRuntimeClient({ region: AWS_REGION });

  const apiResponse = await client.send(
    new InvokeModelCommand({
      contentType: "application/json",
      body: JSON.stringify(payload),
      modelId: MODEL_ID,
    })
  );

  const decodedResponseBody = new TextDecoder().decode(apiResponse.body);
  const responseBody = JSON.parse(decodedResponseBody);

  console.log(responseBody);
}

const imagePath = process.argv[2];
if (imagePath) {
  main(imagePath);
} else {
  console.error("Por favor, forneça o caminho de uma imagem como argumento.");
}
