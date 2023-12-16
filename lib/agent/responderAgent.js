"use strict";
//
// FunctionTreeAgentを使った対話AI
// ユーザーからの入力が解決するまでステップバイステップでFunctionTreeを使ってくれます
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
exports.ResponderAgent = void 0;
const functionTreeAgent_1 = require("./functionTreeAgent");
const defaultPrompts_1 = require("../prompts/default/defaultPrompts");
class ResponderAgent {
    constructor({ apiKey, functionTree, functionTreeAgentOptions, options = {}, }) {
        const { maxSteps = 5, enableFallbackMessage = true } = options;
        this.maxSteps = maxSteps;
        this.enableFallbackMessage = enableFallbackMessage;
        if (!apiKey) {
            throw new Error("OPENAI API key not found");
        }
        this.functionTreeAgent = new functionTreeAgent_1.FunctionTreeAgent({
            apiKey,
            functionTree: Object.assign(Object.assign({}, functionTree), { 
                // rootだけ対話専用のプロンプトに置き換える
                prompt: functionTree.prompt || defaultPrompts_1.responderDefaultPrompt }),
            options: functionTreeAgentOptions,
        });
    }
    run(messages) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.next(messages, 1);
            return result;
        });
    }
    next(prevMessages, step) {
        return __awaiter(this, void 0, void 0, function* () {
            const { toolCallResults, newMessage, resultText } = yield this.functionTreeAgent.run(prevMessages);
            console.log("content: ", newMessage.content);
            if (toolCallResults.length && step < this.maxSteps) {
                // 結果にツール呼び出しがあるならもう1段階生成する
                const result = yield this.next([...prevMessages, newMessage, ...toolCallResults], step + 1);
                return result;
            }
            else if (this.enableFallbackMessage &&
                toolCallResults.length &&
                step === this.maxSteps) {
                // enableFallbackMessageがtrueかつ、stepsを使い切ったにも関わらずtoolCallを要求している場合
                // フォールバックメッセージを生成する
                const result = yield this.generateFallbackMessage(prevMessages);
                return [...prevMessages, result];
            }
            else {
                // 正常終了
                return [...prevMessages, { role: "assistant", content: resultText }];
            }
        });
    }
    // stepsを使い切った時用に最後の返信を生成
    generateFallbackMessage(messages) {
        return __awaiter(this, void 0, void 0, function* () {
            const { newMessage } = yield this.functionTreeAgent.run(messages, {
                noTools: true,
            });
            return newMessage;
        });
    }
}
exports.ResponderAgent = ResponderAgent;
