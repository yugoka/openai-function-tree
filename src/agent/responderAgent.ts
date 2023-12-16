//
// FunctionTreeAgentを使った対話AI
// ユーザーからの入力が解決するまでステップバイステップでFunctionTreeを使ってくれます
//

import { ChatCompletionMessageParam } from "openai/resources";
import { FunctionTreeCategory } from "../types/functionTreeCategory";
import {
  FunctionTreeAgent,
  FunctionTreeAgentOptions,
} from "./functionTreeAgent";
import { responderDefaultPrompt } from "../prompts/default/defaultPrompts";

type AgentOptions = {
  apiKey?: string;
  functionTree: FunctionTreeCategory;
  functionTreeAgentOptions?: FunctionTreeAgentOptions;
  responderAgentOptions?: ResponderAgentOptions;
};
type ResponderAgentOptions = {
  maxSteps: number;
};

export class ResponderAgent {
  private functionTreeAgent: FunctionTreeAgent;
  private options: ResponderAgentOptions;

  constructor({
    apiKey,
    functionTree,
    responderAgentOptions,
    functionTreeAgentOptions,
  }: AgentOptions) {
    this.options = { maxSteps: responderAgentOptions?.maxSteps || 5 };

    if (!apiKey) {
      throw new Error("OPENAI API key not found");
    }

    this.functionTreeAgent = new FunctionTreeAgent({
      apiKey,
      // rootだけ対話専用のプロンプトに置き換える
      functionTree: {
        ...functionTree,
        prompt: functionTree.prompt || responderDefaultPrompt,
      },
      ...functionTreeAgentOptions,
    });
  }

  async run(
    messages: ChatCompletionMessageParam[]
  ): Promise<ChatCompletionMessageParam[]> {
    const result = await this.next(messages, 1);
    return result;
  }

  private async next(
    prevMessages: ChatCompletionMessageParam[],
    step: number
  ): Promise<ChatCompletionMessageParam[]> {
    const { toolCallResults, newMessage, resultText, finishReason } =
      await this.functionTreeAgent.run(prevMessages);

    // 結果にツール呼び出しがあるならもう1段階生成する
    if (toolCallResults.length && step < this.options.maxSteps) {
      const result = await this.next(
        [...prevMessages, newMessage, ...toolCallResults],
        step + 1
      );
      return result;
    } else {
      return [...prevMessages, { role: "assistant", content: resultText }];
    }
  }
}
