// FunctionTreeCategoryの内部で使われるTool用のプロンプト
export const funtionTreeInstructionDescription = () =>
  `
One specific action you want to perform, such as 'search about milk production in USA', 'measure living room temperature', or 'turn on the TV on the second floor'.
Please provide clear and complete instructions. Please be careful to include all the information given by the user.
`.trim();
