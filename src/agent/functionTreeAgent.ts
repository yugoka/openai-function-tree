import { FUNCTION_TREE_AGENT_DEFAULT_MODEL_NAME } from "./../constants/model";
import OpenAI from "openai";
import {
  FunctionTreeCategory,
  FunctionTreeCategoryToolArgs,
  FunctionTreeCategoryWithTool,
} from "../types/functionTreeCategory";
import {
  functionTreeAgentDefaultPrompt,
  toolNotFoundDefaultPrompt,
} from "../prompts/default/defaultPrompts";
import {
  ChatCompletionMessageParam,
  ChatCompletionMessageToolCall,
} from "openai/resources";
import { convertFunctionTreeCategory } from "../utils/convertFunctionTreeCategory";
import { FunctionTreeNodeWithTool } from "../types/functionTreeNode";

type AgentOptions = {
  apiKey: string;
  functionTree: FunctionTreeCategory;
  options?: {};
};

export class FunctionTreeAgent {
  private openai: OpenAI;
  private functionTreeRoot: FunctionTreeCategoryWithTool;

  constructor({ apiKey, functionTree, ...options }: AgentOptions) {
    this.openai = new OpenAI({
      apiKey,
    });
    this.functionTreeRoot = convertFunctionTreeCategory(functionTree);
  }

  async run(messages: ChatCompletionMessageParam[]): Promise<string> {
    const result = await this.runAgent(this.functionTreeRoot, messages);
    return result;
  }

  // エージェントを再帰的に実行する
  private async runAgent(
    currentCategory: FunctionTreeCategoryWithTool,
    messages: ChatCompletionMessageParam[]
  ): Promise<string> {
    try {
      const messagesWithPrompt = this.getMessagesForAgent(
        currentCategory,
        messages
      );
      const modelName =
        currentCategory.modelName || FUNCTION_TREE_AGENT_DEFAULT_MODEL_NAME;

      // 現在のステップの選択肢
      const currentChoices = currentCategory.children.filter(
        (node) => node.type === "tool" || node.children.length
      );
      const tools = currentChoices.map((choice) => choice.tool);

      const response = await this.openai.chat.completions.create({
        messages: messagesWithPrompt,
        model: modelName,
        tools: tools,
        tool_choice: "auto",
      });
      const responseMessage = response.choices[0].message;
      const toolCalls = responseMessage?.tool_calls;

      if (toolCalls) {
        // ツールを実行する
        const toolCallResults: string[] = await this.callTools(
          toolCalls,
          currentCategory
        );
        const resultMessage = this.getToolCallResultMessage(
          toolCalls,
          toolCallResults
        );
        return resultMessage;
      } else {
        // toolCallsがない場合は返信をそのまま返す
        return responseMessage.content || toolNotFoundDefaultPrompt;
      }
    } catch (error) {
      return `${error}`;
    }
  }

  // ツールを実行する
  private async callTools(
    toolCalls: ChatCompletionMessageToolCall[],
    currentCategory: FunctionTreeCategoryWithTool
  ) {
    // 並列実行できるようにPromiseの配列にする
    const toolCallPromises: Promise<string>[] = toolCalls.map(
      async (toolCall) => {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(
          toolCall.function.arguments
        ) as FunctionTreeCategoryToolArgs;

        const skillNode = currentCategory.children.find(
          (node) => node.tool.function.name === toolName
        );

        if (skillNode?.type === "category") {
          // FunctionTreeの2階層目からは最初に与えられたプロンプトをオミットする(instructionだけを次nodeに渡す)
          const instructionMessage: ChatCompletionMessageParam = {
            role: "user",
            content: toolArgs.instruction,
          };

          // 再帰実行
          const result =
            (await this.runAgent(
              skillNode,
              this.getMessagesForAgent(currentCategory, [instructionMessage])
            )) || "";
          return result;
        } else {
          const result = (await skillNode?.function(toolArgs)) || "";
          return result;
        }
      }
    );

    const toolCallResults = await Promise.all(toolCallPromises);
    return toolCallResults;
  }

  // カテゴリ選択用のプロンプトを挿入する
  private getMessagesForAgent(
    currentCategory: FunctionTreeCategoryWithTool,
    messages: ChatCompletionMessageParam[]
  ): ChatCompletionMessageParam[] {
    const prompt = currentCategory.prompt || functionTreeAgentDefaultPrompt;
    return [
      {
        role: "system",
        content: prompt,
      },
      ...messages,
    ];
  }

  // toolCallsの結果を雑にjoinする
  // そのうち変えたい
  getToolCallResultMessage(
    toolCalls: ChatCompletionMessageToolCall[],
    results: string[]
  ) {
    // toolCallsからinstructionsを抜き出す
    const instructions = toolCalls.map((toolCall) => {
      const toolArgs = JSON.parse(
        toolCall.function.arguments
      ) as FunctionTreeCategoryToolArgs;
      return toolArgs.instruction;
    });

    let result = "";
    for (let i = 0; i < results.length; i++) {
      result += `[action: ${instructions[i]}, result: ${results[i]}]\n`;
    }
    return result;
  }
}
