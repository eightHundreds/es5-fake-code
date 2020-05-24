namespace es5.expression{
    // #region Utils
    function evaluating (exp: Expression) {

    }

    // #endregion
    type Expression = any

    /**
     * 主表达式
     * PrimaryExpression :
     *  this
     *  Identifier
     *  Literal
     *  ArrayLiteral
     *  ObjectLiteral
     *  ( Expression )
     */
    namespace PrimaryExpression {

    }
    type PrimaryExpression = es5.lexical.Identifier

    /**
     * 一元运算符
     *
     *  产生式:
     *  UnaryExpression :
     *      PostfixExpression
     *      delete UnaryExpression
     *      void UnaryExpression
     *      typeof UnaryExpression
     *      ++ UnaryExpression
     *      -- UnaryExpression
     *      + UnaryExpression
     *      - UnaryExpression
     *      ~ UnaryExpression
     *      ! UnaryExpression
     */
    namespace UnaryOperators{
        type UnaryExpression = any

        /**
         * typeof UnaryExpression
         */
        function TypeOfExpression (exp: UnaryExpression) {
            const val = evaluating(exp)
            if (es5.types.Type(val) === 'Reference') {

            }
        }
    }

    /**
     * 后缀表达式
     */
    namespace PostfixExpression{

    }
    type PostfixExpression = any

    /**
     * 左值表达式
     *
     * 产生式
     * MemberExpression :
     *  PrimaryExpression
     *  FunctionExpression
     *  MemberExpression [ Expression ]
     *  MemberExpression . IdentifierName
     *  new MemberExpression Arguments
     *
     * NewExpression :
     *  MemberExpression
     *  new NewExpression
     *
     * CallExpression :
     *  MemberExpression Arguments
     *  CallExpression Arguments
     *  CallExpression [ Expression ]
     *  CallExpression . IdentifierName
     *
     * Arguments :
     *  ( )
     *  ( ArgumentList )
     *
     * ArgumentList :
     *  AssignmentExpression
     *  ArgumentList , AssignmentExpression
     *
     * LeftHandSideExpression :
     *  NewExpression
     *  CallExpression
     */
    namespace LeftHandSideExpression{
        type MemberExpression=any

    }
    type LeftHandSideExpression = any
}
