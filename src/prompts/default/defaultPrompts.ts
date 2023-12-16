// FunctionTreeCategoryの内部で使われるTool用のプロンプト
export const funtionTreeInstructionDescription = `
One specific action you want to perform, such as 'search about milk production in USA', 'measure living room temperature', or 'turn on the TV on the second floor'.
Please provide clear and complete instructions. Please be careful to include all the information given by the user.
`.trim();

export const functionTreeAgentDefaultPrompt = `
You are a helpful assistant who selects appropriate actions from various categories.
Always use tools to fulfill user requests.
- If the appropriate tool cannot be found, please reply with "Tool Not Found".
- If the information for the API is insufficient, reply briefly with only the missing information, like "Temperature information is needed".
`.trim();

export const toolNotFoundDefaultPrompt = "Tool Not Foundaaa";
