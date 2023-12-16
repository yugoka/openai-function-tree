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
  options?: ResponderAgentOptions;
};
type ResponderAgentOptions = {
  maxSteps?: number;
  enableFallbackMessage?: boolean;
};

export class ResponderAgent {
  private functionTreeAgent: FunctionTreeAgent;
  private maxSteps: number;
  private enableFallbackMessage: boolean;

  constructor({
    apiKey,
    functionTree,
    functionTreeAgentOptions,
    options = {},
  }: AgentOptions) {
    const { maxSteps = 5, enableFallbackMessage = true } = options;
    this.maxSteps = maxSteps;
    this.enableFallbackMessage = enableFallbackMessage;

    if (!apiKey) {
      throw new Error("OPENAI API key not found");
    }

    this.functionTreeAgent = new FunctionTreeAgent({
      apiKey,
      functionTree: {
        ...functionTree,
        // rootだけ対話専用のプロンプトに置き換える
        prompt: functionTree.prompt || responderDefaultPrompt,
      },
      options: functionTreeAgentOptions,
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
    const { toolCallResults, newMessage, resultText } =
      await this.functionTreeAgent.run(prevMessages);

    console.log("content: ", newMessage.content);

    if (toolCallResults.length && step < this.maxSteps) {
      // 結果にツール呼び出しがあるならもう1段階生成する
      const result = await this.next(
        [...prevMessages, newMessage, ...toolCallResults],
        step + 1
      );
      return result;
    } else if (
      this.enableFallbackMessage &&
      toolCallResults.length &&
      step === this.maxSteps
    ) {
      // enableFallbackMessageがtrueかつ、stepsを使い切ったにも関わらずtoolCallを要求している場合
      // フォールバックメッセージを生成する
      const result = await this.generateFallbackMessage(prevMessages);
      return [...prevMessages, result];
    } else {
      // 正常終了
      return [...prevMessages, { role: "assistant", content: resultText }];
    }
  }

  // stepsを使い切った時用に最後の返信を生成
  private async generateFallbackMessage(
    messages: ChatCompletionMessageParam[]
  ) {
    const { newMessage } = await this.functionTreeAgent.run(messages, {
      noTools: true,
    });
    return newMessage;
  }
}
