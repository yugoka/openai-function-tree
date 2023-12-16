import { FunctionTreeAgent } from "../src/agent/functionTreeAgent";
import { ResponderAgent } from "../src/agent/responderAgent";
import { exampleFunctionTree } from "./exampleFunctionTree";
require("dotenv").config();
console.log("=== Start ===");

// FunctionTreeAgent
(async () => {
  const functionTreeAgent = new FunctionTreeAgent({
    apiKey: process.env.OPENAI_API_KEY,
    functionTree: exampleFunctionTree,
    options: { verbose: true },
  });

  const result = await functionTreeAgent.run([
    {
      role: "user",
      content: "Turn on the air conditioner on the first floor.",
    },
  ]);

  console.log(result);
})();

// ResponderAgent
(async () => {
  const agent = new ResponderAgent({
    apiKey: process.env.OPENAI_API_KEY,
    functionTree: exampleFunctionTree,
    functionTreeAgentOptions: {
      verbose: true,
    },
    options: {
      maxSteps: 3,
      enableFallbackMessage: true,
    },
  });

  const result = await agent.run([
    {
      role: "user",
      content: `Check the temperature in Fujisawa City.`,
    },
  ]);
  const result2 = await agent.run([
    ...result,
    {
      role: "user",
      content: `Turn on the air conditioner on the first floor and make the temperature equal to that.`,
    },
  ]);
  const result3 = await agent.run([
    ...result2,
    {
      role: "user",
      content: `Too Cold!`,
    },
  ]);
})();
