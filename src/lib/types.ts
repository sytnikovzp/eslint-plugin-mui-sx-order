import { Rule } from 'eslint';

export type RuleContext = Rule.RuleContext;
export type RuleListener = Rule.RuleListener;
export type RuleModule = Rule.RuleModule;
export type ASTNode = Rule.Node;
export type ObjectExpression = any;
export type Property = any;
export type JSXAttribute = any;
export type VariableDeclarator = any;
export type ExportNamedDeclaration = any;
export type CallExpression = any;

export interface StyleObjectName {
  (name: string): boolean;
}

export interface CheckAndReportFunction {
  (
    context: RuleContext,
    node: ObjectExpression,
    getOrder: GetOrderFunction
  ): void;
}

export interface GetOrderFunction {
  (key: string): number;
}
