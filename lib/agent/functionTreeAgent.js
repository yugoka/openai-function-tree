"use strict";
//
// FunctionTreeを使って再帰的にAPIを叩いてくれるエージェント。
// このライブラリの基幹部分です。
//
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FunctionTreeAgent = void 0;
const model_1 = require("./../constants/model");
const openai_1 = require("openai");
const defaultPrompts_1 = require("../prompts/default/defaultPrompts");
const convertFunctionTreeCategory_1 = require("../utils/convertFunctionTreeCategory");
class FunctionTreeAgent {
    constructor({ apiKey, functionTree, options }) {
        if (!apiKey) {
            throw new Error("OPENAI API key not found");
        }
        this.openai = new openai_1.default({
            apiKey,
        });
        this.functionTreeRoot = (0, convertFunctionTreeCategory_1.convertFunctionTreeCategory)(functionTree);
        this.verbose = (options === null || options === void 0 ? void 0 : options.verbose) || false;
    }
    run(messages, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.next(this.functionTreeRoot, messages, options);
            return result;
        });
    }
    // エージェントを再帰的に実行する
    next(currentCategory, messages, options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const messagesWithPrompt = this.getMessagesForAgent(currentCategory, messages);
                const modelName = currentCategory.modelName || model_1.FUNCTION_TREE_AGENT_DEFAULT_MODEL_NAME;
                // ツールを使わないオプション
                const { noTools = false } = options || {};
                // このカテゴリでやりたいこと
                const instruction = messages[messages.length - 1].content;
                // 現在のステップの選択肢
                const currentChoices = currentCategory.children.filter((node) => node.type === "tool" || node.children.length);
                const tools = noTools ? [] : currentChoices.map((choice) => choice.tool);
                // ChatGPTにリクエストを投げる
                const response = yield this.openai.chat.completions.create({
                    messages: messagesWithPrompt,
                    model: modelName,
                    tools: tools,
                    tool_choice: "auto",
                });
                const newMessage = response.choices[0].message;
                const finishReason = response.choices[0].finish_reason;
                const toolCalls = newMessage === null || newMessage === void 0 ? void 0 : newMessage.tool_calls;
                if (this.verbose) {
                    console.log({
                        category: currentCategory.tool.function.name,
                        instruction,
                        content: newMessage.content,
                        toolCalls: toolCalls === null || toolCalls === void 0 ? void 0 : toolCalls.map((toolCall) => toolCall.function.name),
                    });
                }
                if (finishReason != "tool_calls" || !toolCalls) {
                    // toolCallsがない場合はそのまま返信する
                    const result = newMessage.content || defaultPrompts_1.toolNotFoundDefaultPrompt;
                    return {
                        resultText: result,
                        toolCallResults: [],
                        newMessage,
                        finishReason,
                    };
                }
                else {
                    // ツールを実行する
                    const toolCallResults = yield this.callTools(toolCalls, currentCategory);
                    // メッセージを加工
                    const joinedResultMessage = this.getToolCallResultMessage(toolCalls, toolCallResults.map((result) => result.content || ""));
                    return {
                        resultText: joinedResultMessage,
                        newMessage,
                        toolCallResults,
                        finishReason,
                    };
                }
            }
            catch (error) {
                return {
                    resultText: `${error}`,
                    newMessage: { role: "assistant", content: `${error}` },
                    toolCallResults: [],
                    finishReason: "stop",
                };
            }
        });
    }
    // ツールを実行する
    callTools(toolCalls, currentCategory) {
        return __awaiter(this, void 0, void 0, function* () {
            // 並列実行できるようにPromiseの配列にする
            const toolCallPromises = toolCalls.map((toolCall) => __awaiter(this, void 0, void 0, function* () {
                const toolName = toolCall.function.name;
                const toolArgs = JSON.parse(toolCall.function.arguments);
                const functionTreeNode = currentCategory.children.find((node) => node.tool.function.name === toolName);
                if ((functionTreeNode === null || functionTreeNode === void 0 ? void 0 : functionTreeNode.type) === "category") {
                    // FunctionTreeの2階層目からは最初に与えられたプロンプトをオミットする(instructionだけを次nodeに渡す)
                    const instructionMessage = {
                        role: "user",
                        content: toolArgs._instruction,
                    };
                    // 再帰実行
                    const result = (yield this.next(functionTreeNode, this.getMessagesForAgent(currentCategory, [instructionMessage]))) || "";
                    return {
                        role: "tool",
                        tool_call_id: toolCall.id,
                        content: result.resultText,
                    };
                }
                else if ((functionTreeNode === null || functionTreeNode === void 0 ? void 0 : functionTreeNode.type) === "tool") {
                    const result = (yield (functionTreeNode === null || functionTreeNode === void 0 ? void 0 : functionTreeNode.function(toolArgs))) || "";
                    return {
                        role: "tool",
                        tool_call_id: toolCall.id,
                        content: result,
                    };
                }
                else {
                    return {
                        role: "tool",
                        tool_call_id: toolCall.id,
                        content: "",
                    };
                }
            }));
            const toolCallResults = yield Promise.all(toolCallPromises);
            return toolCallResults;
        });
    }
    // カテゴリ選択用のプロンプトを挿入する
    getMessagesForAgent(currentCategory, messages) {
        const prompt = currentCategory.prompt || defaultPrompts_1.functionTreeAgentDefaultPrompt;
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
    getToolCallResultMessage(toolCalls, results) {
        // toolCallsからinstructionsを抜き出す
        const instructions = toolCalls.map((toolCall) => {
            const toolArgs = JSON.parse(toolCall.function.arguments);
            return toolArgs._instruction;
        });
        let result = "";
        for (let i = 0; i < results.length; i++) {
            if (i >= 1) {
                result += ",";
            }
            // _instructionsがあるかどうかでカテゴリ判定をしているため注意
            result += `"${toolCalls[i].function.name}" => ${instructions[i] ? results[i] : `"${results[i]}"`}`;
        }
        return result;
    }
}
exports.FunctionTreeAgent = FunctionTreeAgent;
