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
  ChatCompletionToolMessageParam,
} from "openai/resources";
import { convertFunctionTreeCategory } from "../utils/convertFunctionTreeCategory";

type AgentOptions = {
  apiKey?: string;
  functionTree: FunctionTreeCategory;
  options?: {
    verbose?: boolean;
  };
};

type AgentRunResult = {
  message: string;
  toolCallResults: ChatCompletionToolMessageParam[];
};

export class FunctionTreeAgent {
  private openai: OpenAI;
  private functionTreeRoot: FunctionTreeCategoryWithTool;
  verbose: boolean;

  constructor({ apiKey, functionTree, options }: AgentOptions) {
    if (!apiKey) {
      throw new Error("OPENAI API key not found");
    }

    this.openai = new OpenAI({
      apiKey,
    });
    this.functionTreeRoot = convertFunctionTreeCategory(functionTree);
    this.verbose = options?.verbose || false;
  }

  async run(messages: ChatCompletionMessageParam[]): Promise<AgentRunResult> {
    const result = await this.runAgent(this.functionTreeRoot, messages);
    return result;
  }

  // エージェントを再帰的に実行する
  private async runAgent(
    currentCategory: FunctionTreeCategoryWithTool,
    messages: ChatCompletionMessageParam[]
  ): Promise<AgentRunResult> {
    try {
      const messagesWithPrompt = this.getMessagesForAgent(
        currentCategory,
        messages
      );
      const modelName =
        currentCategory.modelName || FUNCTION_TREE_AGENT_DEFAULT_MODEL_NAME;

      // このカテゴリでやりたいこと
      const instruction = messages[messages.length - 1].content;

      // 現在のステップの選択肢
      const currentChoices = currentCategory.children.filter(
        (node) => node.type === "tool" || node.children.length
      );
      const tools = currentChoices.map((choice) => choice.tool);

      // ChatGPTにリクエストを投げる
      const response = await this.openai.chat.completions.create({
        messages: messagesWithPrompt,
        model: modelName,
        tools: tools,
        tool_choice: "auto",
      });
      const responseMessage = response.choices[0].message;
      const toolCalls = responseMessage?.tool_calls;

      if (this.verbose) {
        console.log({
          category: currentCategory.tool.function.name,
          instruction,
          content: responseMessage.content,
          toolCalls: toolCalls?.map((toolCall) => toolCall.function.name),
        });
      }

      if (!toolCalls) {
        // toolCallsがない場合は返信+instructionをそのまま返す
        const result = responseMessage.content || toolNotFoundDefaultPrompt;
        return {
          message: `{ "action": "${instruction}", "feedback": "${result}" }`,
          toolCallResults: [],
        };
      } else {
        // ツールを実行する
        const toolCallResults: ChatCompletionToolMessageParam[] =
          await this.callTools(toolCalls, currentCategory);

        // メッセージを加工
        const joinedResultMessage = this.getToolCallResultMessage(
          toolCalls,
          toolCallResults.map((result) => result.content || "")
        );

        return { message: joinedResultMessage, toolCallResults };
      }
    } catch (error) {
      return { message: `${error}`, toolCallResults: [] };
    }
  }

  // ツールを実行する
  private async callTools(
    toolCalls: ChatCompletionMessageToolCall[],
    currentCategory: FunctionTreeCategoryWithTool
  ) {
    // 並列実行できるようにPromiseの配列にする
    const toolCallPromises: Promise<ChatCompletionToolMessageParam>[] =
      toolCalls.map(
        async (toolCall): Promise<ChatCompletionToolMessageParam> => {
          const toolName = toolCall.function.name;
          const toolArgs = JSON.parse(toolCall.function.arguments);

          const functionTreeNode = currentCategory.children.find(
            (node) => node.tool.function.name === toolName
          );

          if (functionTreeNode?.type === "category") {
            // FunctionTreeの2階層目からは最初に与えられたプロンプトをオミットする(instructionだけを次nodeに渡す)
            const instructionMessage: ChatCompletionMessageParam = {
              role: "user",
              content: toolArgs._instruction,
            };

            // 再帰実行
            const result =
              (await this.runAgent(
                functionTreeNode,
                this.getMessagesForAgent(currentCategory, [instructionMessage])
              )) || "";
            return {
              role: "tool",
              tool_call_id: toolCall.id,
              content: result.message,
            };
          } else if (functionTreeNode?.type === "tool") {
            const result = (await functionTreeNode?.function(toolArgs)) || "";
            return {
              role: "tool",
              tool_call_id: toolCall.id,
              content: result,
            };
          } else {
            return {
              role: "tool",
              tool_call_id: toolCall.id,
              content: "",
            };
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

  // toolCallsの結果を雑にjsonっぽくする
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
      return toolArgs._instruction;
    });

    let result = "";
    for (let i = 0; i < results.length; i++) {
      if (i >= 1) {
        result += ",";
      }

      // _instructionsがあるかどうかでカテゴリ判定をしているため注意
      result += `{ "${toolCalls[i].function.name}": [${
        instructions[i] ? results[i] : `"${results[i]}"`
      }] }`;
    }
    return result;
  }
}
