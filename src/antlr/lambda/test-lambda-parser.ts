// Test file for lambda parser
import { LambdaParserService } from '../../services/lambda-parser-service';
import { LambdaToExpressionService } from '../../services/lambda-to-expression-service';

// Simple test function
export function testLambdaParser() {
  const lambdaParser = new LambdaParserService();
  const lambdaToExpression = new LambdaToExpressionService();

  const testCases = [
    'λx:Bool. x',
    'λx:Bool. λy:Bool. x',
    'λf:Bool->Bool. λx:Bool. f x',
    'true',
    'false',
    '0',
    'succ 0',
    'pred (succ 0)',
    'iszero 0',
    'if true then false else true',
    '(λx:Bool. x) true',
    'let x = true in x',
    '(true, false)',
    'inl true as Bool + Nat',
    'inr 0 as Bool + Nat'
  ];

  console.log('Testing Lambda Parser...');
  
  testCases.forEach((testCase, index) => {
    try {
      console.log(`\nTest ${index + 1}: ${testCase}`);
      
      // Parse lambda expression
      const parsed = lambdaParser.parseLambdaExpression(testCase);
      console.log('Parsed AST:', parsed);
      
      // Format back to string
      const formatted = lambdaParser.formatLambdaExpression(parsed);
      console.log('Formatted:', formatted);
      
      // Convert to mathematical expression
      const mathExpr = lambdaToExpression.convertLambdaToExpression(parsed);
      console.log('Mathematical expression:', mathExpr);
      
    } catch (error) {
      console.error(`Error in test ${index + 1}:`, error);
    }
  });
}

// Export for use in browser console
(window as any).testLambdaParser = testLambdaParser;
