// custom-rules/explicit-error-handling.ts
import { ESLintUtils, TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  name => `https://your-docs.com/rules/${name}`
);

// ルール1: 明示的エラーハンドリングの強制
export const explicitErrorHandling = createRule({
  name: 'explicit-error-handling',
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce explicit error handling pattern like Go',
      recommended: 'error'
    },
    fixable: 'code',
    schema: [],
    messages: {
      requireExplicitError: 'Functions must return explicit error handling pattern: {success: boolean, data?: T, error?: string}',
      noTryCatch: 'Use explicit error handling instead of try-catch blocks'
    }
  },
  defaultOptions: [],
  create(context) {
    return {
      // try-catch文の使用を禁止
      TryStatement(node) {
        context.report({
          node,
          messageId: 'noTryCatch'
        });
      },
      
      // 関数が適切な戻り値型を持つかチェック
      FunctionDeclaration(node) {
        if (node.returnType) {
          const returnType = context.getSourceCode().getText(node.returnType);
          if (!returnType.includes('success') || !returnType.includes('error')) {
            context.report({
              node: node.returnType,
              messageId: 'requireExplicitError'
            });
          }
        }
      }
    };
  }
});

// ルール2: 明示的型変換の強制
export const explicitTypeConversion = createRule({
  name: 'explicit-type-conversion',
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce explicit type conversion functions',
      recommended: 'error'
    },
    fixable: 'code',
    schema: [],
    messages: {
      useExplicitConversion: 'Use explicit type conversion: Number(), String(), Boolean()'
    }
  },
  defaultOptions: [],
  create(context) {
    return {
      // + 演算子での暗黙的変換をチェック
      UnaryExpression(node) {
        if (node.operator === '+' && node.argument.type !== 'Literal') {
          context.report({
            node,
            messageId: 'useExplicitConversion',
            fix(fixer) {
              return fixer.replaceText(node, `Number(${context.getSourceCode().getText(node.argument)})`);
            }
          });
        }
      },
      
      // テンプレートリテラルでの暗黙的変換をチェック
      TemplateLiteral(node) {
        node.expressions.forEach(expr => {
          if (expr.type !== 'Literal' && expr.type !== 'TemplateLiteral') {
            const exprText = context.getSourceCode().getText(expr);
            if (!exprText.startsWith('String(')) {
              context.report({
                node: expr,
                messageId: 'useExplicitConversion'
              });
            }
          }
        });
      }
    };
  }
});

// ルール3: Go風の戻り値パターン強制
export const returnValuePattern = createRule({
  name: 'return-value-pattern',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce Go-like return value pattern',
      recommended: 'error'
    },
    schema: [],
    messages: {
      invalidReturnPattern: 'Return value must follow Go pattern: {success: boolean, data?: T, error?: string}'
    }
  },
  defaultOptions: [],
  create(context) {
    const checkReturnStatement = (node: TSESTree.ReturnStatement): void => {
      if (!node.argument || node.argument.type !== 'ObjectExpression') {
        context.report({
          node,
          messageId: 'invalidReturnPattern'
        });
        return;
      }

      const properties = node.argument.properties;
      const hasSuccess = properties.some(prop => 
        prop.type === 'Property' && 
        prop.key.type === 'Identifier' && 
        prop.key.name === 'success'
      );

      if (!hasSuccess) {
        context.report({
          node,
          messageId: 'invalidReturnPattern'
        });
      }
    };

    return {
      ReturnStatement: checkReturnStatement
    };
  }
});

// ルール4: 関数の複雑度制限（Go風）
export const goLikeComplexity = createRule({
  name: 'go-like-complexity',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Limit function complexity following Go conventions',
      recommended: 'warn'
    },
    schema: [
      {
        type: 'object',
        properties: {
          maxComplexity: { type: 'integer', minimum: 1 },
          maxParams: { type: 'integer', minimum: 1 },
          maxLines: { type: 'integer', minimum: 1 }
        },
        additionalProperties: false
      }
    ],
    messages: {
      tooComplex: 'Function complexity ({{complexity}}) exceeds maximum allowed ({{max}})',
      tooManyParams: 'Function has {{count}} parameters, maximum allowed is {{max}}',
      tooManyLines: 'Function has {{lines}} lines, maximum allowed is {{max}}'
    }
  },
  defaultOptions: [{ maxComplexity: 10, maxParams: 4, maxLines: 50 }],
  create(context, [options]) {
    return {
      FunctionDeclaration(node) {
        // パラメータ数チェック
        if (node.params.length > options.maxParams) {
          context.report({
            node,
            messageId: 'tooManyParams',
            data: {
              count: node.params.length,
              max: options.maxParams
            }
          });
        }

        // 行数チェック
        const lines = node.loc!.end.line - node.loc!.start.line + 1;
        if (lines > options.maxLines) {
          context.report({
            node,
            messageId: 'tooManyLines',
            data: {
              lines,
              max: options.maxLines
            }
          });
        }
      }
    };
  }
});

// ルールのエクスポート
export default {
  'explicit-error-handling': explicitErrorHandling,
  'explicit-type-conversion': explicitTypeConversion,
  'return-value-pattern': returnValuePattern,
  'go-like-complexity': goLikeComplexity
};