"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const responderAgent_1 = require("./agent/responderAgent");
const functionTreeAgent_1 = require("./agent/functionTreeAgent");
const OpenAIFunctionTreeModule = {
    FunctionTreeAgent: functionTreeAgent_1.FunctionTreeAgent,
    ResponderAgent: responderAgent_1.ResponderAgent,
};
module.exports = OpenAIFunctionTreeModule;
