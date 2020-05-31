namespace es5{

    /**
     * 7 词法
     */
    namespace lexical{
        export type Identifier=any
    }

    /**
     * 8 类型
     */
    namespace types {
        // #region utils
        /**
         * 解析x的类型
         * @param x
         * @returns 只规范类型与语言类型
         * ECMAScript语言类型
         *   Undefined、Null、Boolean、String、Number、Object。
         * 规范类型:
         *  引用、列表、完结、属性描述式、属性标示、词法环境、 环境纪录
         */
        export declare function Type(x: any): 'Reference' | 'Undefined' | 'Null' | 'Boolean' | 'String' | 'Number' | 'Object'
        // #endregion

        export class Object {
            /**
             * 对象的原型
             */
            '[[Proptype]]': Object | null

            /**
             * 与此对象的内部状态信息关联
             */
            '[[PrimitiveValue]]': boolean | number | undefined | string
            /**
             * 返回命名属性的值
             * @param P 属性名
             */
            '[[GET]]' (P: string) {
                // const desc =
            }

            /**
             * 返回此对象的完全填入的自身命名属性的属性描述，如果不存在返回 undefined
             * @param P 属性名
             */
            '[[GetProperty]]' (P: string): PropertyDescriptor | undefined {
                const prop = this['[[GetOwnProperty]]'](P)
                if (prop !== undefined) {
                    return prop
                }
                const proto = this['[[Proptype]]']
                if (proto === null) {
                    return undefined
                }
                return proto['[[GetProperty]]'](P) // 到原型上查找属性
            }

            /**
             * 返回此对象的自身命名属性的属性描述，如果不存在返回 undefined
             * @param P 属性名
             */
            '[[GetOwnProperty]]' (P: string) {
                if (!(P in this)) {
                    return undefined
                }
                const D = new PropertyDescriptor()
                const X = this[P] as PropertyDescriptor
                if (X instanceof DataPropertyDescriptor) {
                    D['[[Value]]'] = X['[[Value]]']
                    D['[[Writable]]'] = X['[[Writable]]']
                }
                if (X instanceof AccessorPropertyDescriptor) {
                    D['[[Get]]'] = X['[[Get]]']
                    D['[[Set]]'] = X['[[Set]]']
                }
                D['[[Enumerable]]'] = X['[[Enumerable]]']
                D['[[Configurable]] '] = X['[[Configurable]] ']
                return D
            }

            // 本项目的其他地方会调用原生的call,但实际上就是调用这个[[Call]]
            '[[Call]]' (thisArgs, ...args: any[]) {

            }
        }
        // #region 属性描述符
        /**
         * 属性描述符类型是用来解释命名属性具体操作的特性集
         */
        abstract class PropertyDescriptorBase extends Object {
            '[[Enumerable]]' () {

            }

            '[[Configurable]] ' () {

            }
        }
        /**
         * 访问器属性描述符
         */
        abstract class AccessorPropertyDescriptor extends PropertyDescriptorBase {
            // [[Get]] 或 [[Set]]
            '[[Get]]' (): any {

            }

            '[[Set]]' (): void {

            }
        }
        /**
         * 数据属性描述符
         */
        abstract class DataPropertyDescriptor extends PropertyDescriptorBase {
            '[[Value]]': any
            '[[Writable]]': boolean
        }
        type PropertyDescriptor = AccessorPropertyDescriptor & DataPropertyDescriptor
        type PropertyDescriptorConstructor = new () => PropertyDescriptor
        declare const PropertyDescriptor: PropertyDescriptorConstructor

        /**
         * 属性标识符类型用于关联属性名称与属性描述符
         */
        interface PropertyIdentifier {
            name: string
            descriptor: PropertyDescriptorBase
        }
        export function IsDataDescriptor (Desc: any): Desc is DataPropertyDescriptor {
            if (Desc === undefined) {
                return false
            }
            if (!Desc['[[Value]]'] && !Desc['[[Writable]]']) {
                return false
            }
            return true
        }

        export function IsAccessorDescriptor (Desc: any): Desc is AccessorPropertyDescriptor {
            if (Desc === undefined) {
                return false
            }
            if (!Desc['[[Get]]'] && !Desc['[[Set]]']) {
                return false
            }
            return true
        }
        // #endregion

        /**
         * 引用类型
         *
         * 解析标识符时,得到的不是具体的数据,而是一个引用
         */
        export class Reference {
            /**
             *
             * @param baseValue 基值，一般是存放真实的数据
             * @param name 引用的名称
             * @param strict
             */
            constructor (public readonly baseValue: Object|undefined|execution.EnvironmentRecord, public readonly name: string, public readonly strict: boolean) {
            }
        }

        export function IsUnresolvableReference (V: Reference) {
            return V.baseValue === undefined
        }

        export function GetBase (V: Reference) {
            return V.baseValue
        }

        /**
         * 是否是属性引用
         * @param V
         */
        export function IsPropertyReference (V: Reference) {
            return V.baseValue instanceof types.Object || HasPrimitiveBase(V)
        }

        /**
        * 是否有有原始类型的基值
        * @param V
        */
        export function HasPrimitiveBase (V: Reference) {
            return (V.baseValue instanceof Boolean || V.baseValue instanceof String || V.baseValue instanceof Number)
        }

        /**
         * 返回引用值 V 的引用名称部分
         * @param V
         */
        export function GetReferencedName (V: Reference) {
            return V.name
        }

        /**
         * 返回引用值 V 的严格引用部分
         * @param V
         */
        export function IsStrictReference (V: Reference) {
            return V.strict
        }

        /**
         * 获得值，如果V是引用类型会解析出引用的基值
         * @param V
         */
        export function GetValue (V: any) {
            if (Type(V) !== 'Reference') {
                return V
            }
            const base = GetBase(V)
            if (IsUnresolvableReference(V)) {
                throw ReferenceError()
            }
            let get
            if (IsPropertyReference(V)) {
                if (!HasPrimitiveBase(V)) { // V是对象
                    get = base!['[[GET]]']
                } else {
                    /**
                     * @praram P 属性名
                     */
                    get = function (P: string) {
                        // @ts-ignore
                        const base = this
                        const O = conversion.ToObject(base)
                        const desc = O?.['[[GetProperty]]'](P)
                        if (IsDataDescriptor(desc)) {
                            return desc
                        }
                        assert(IsAccessorDescriptor(desc))
                        const getter = (desc as unknown as AccessorPropertyDescriptor)['[[Get]]']
                        if (getter === undefined) {
                            return undefined
                        }
                        return getter.call(base)
                    }
                    get.call(base, GetReferencedName(V))
                }
            } else {
                assert(base instanceof execution.EnvironmentRecord)

                return (base as unknown as execution.EnvironmentRecord).GetBindingValue(
                    GetReferencedName(V),
                    IsStrictReference(V)
                )
            }
        }
    }

    /**
     * 9 类型转换和测试
     */
    namespace conversion{
        export function ToObject (V: any) {
            if (V === null) {
                throw TypeError()
            }
            switch (typeof V) {
                case 'undefined':
                    throw TypeError()
                case 'boolean':
                {
                    const o = new builtins.Boolean(V)
                    o['[[PrimitiveValue]]'] = V
                    return o
                }
                case 'number': {
                    const o = new builtins.Number(V)
                    o['[[PrimitiveValue]]'] = V
                    return o
                }
                case 'string': {
                    const o = new builtins.String(V)
                    o['[[PrimitiveValue]]'] = V
                    return o
                }
                case 'object': {
                    return V as types.Object
                }
            }
        }
        /**
         * 将V转换成Boolean原始值(不是对象)
         * @param V
         */
        export function ToBoolean (V: any): false | true {
            switch (types.Type(V)) {
                case 'Undefined':
                    return false
                case 'Null':
                    return false
                case 'Boolean':
                    return V
                case 'Number':
                {
                    if (V === 0 || isNaN(V)) {
                        return false
                    }
                    return true
                }
                case 'String':
                {
                    const str = V as string
                    return str.length !== 0
                }
                case 'Object':
                    return true
            }
            return false
        }

        export declare function ToString(V: any): string

        /**
         * 将V转换成非对象类型，ToNumber，ToString等方法内部都调用它
         * @param V
         */
        export declare function ToPrimitive(V: any): any

        /**
         * 检查V是否能ToObject
         * @param V
         */
        export function CheckObjectCoercible (V: any) {
            switch (types.Type(V)) {
                case 'Null':
                case 'Undefined':
                    throw TypeError()
                default:
                    break
            }
        }
    }

    /**
     * 10 可执行代码与执行环境
     */
    namespace execution {
        // #region Utils
        /**
         * 获得当前运行的执行环境的词法环境
         */
        function GetCurrentLexicalEnvironment (): LexicalEnvironment {
            // TODO
            let env: LexicalEnvironment
            // @ts-ignore
            return env
        }
        /**
          * 获得当前环境是否是严格模式
          */
        declare function GetStrictFlag(): boolean
        // #endregion

        // #region 词法环境
        interface LexicalEnvironment{
            envRec: EnvironmentRecord
            outer: LexicalEnvironment|null
        }
        /**
         * 环境记录项
         */
        export class EnvironmentRecord {
            /**
             * 这个是规范中没有直接提到的结构,是我自己定义的.
             * 它保存了标识符文本与数据的映射
             */
            protected bindingMap: Record<string, {
                value: any
                mutable: boolean // 是否可变
            }> = {}

            /**
             * 判断环境记录项是否包含对某个标识符的绑定
             * @param N 标识符文本
             */
            HasBinding (N: string): boolean {
                // TODO
                return true
            }

            /**
             * 返回环境记录项中一个已经存在的绑定的值
             * @param N 指定绑定的名称
             * @param S 是否是严格模式
             */
            GetBindingValue (N: string, S: boolean) {

            }
        }
        // declarative environment records and object environment records.

        /**
         * 声明式环境记录项
         *
         * 声明式环境记录项都与一个包含`变量`和（或）`函数声明`的 ECMA 脚本的程序作用域相关联
         *
         */
        export class DeclarativeEnvironmentRecord extends EnvironmentRecord {

        }

        /**
         * 对象环境记录项
         */
        export class ObjectEnvironmentRecord extends EnvironmentRecord {
            /**
             * 返回环境记录项中一个已经存在的绑定的值
             * @param N 指定绑定的名称
             * @param S 是否是严格模式
             */
            GetBindingValue (N: string, S: boolean) {
                const envRec = this // 令 envRec 为函数调用时对应的声明式环境记录项
                assert(envRec.HasBinding(N))
                // 未初始化的不可变绑定
                if (this.bindingMap[N].mutable && this.bindingMap[N].value === undefined) {
                    throw ReferenceError()
                }
                return this.bindingMap[N].value
            }
        }
        // #endregion
        /**
         * 词法环境
         */

        // #region 执行环境
        /**
         * 执行环境包含所有用于追踪与其相关的代码的执行进度的状态
         *
         * 当控制器转入 ECMA 脚本的可执行代码时，控制器会进入一个执行环境
         * 当前活动的多个执行环境在逻辑上形成一个栈结构。该逻辑栈的最顶层的执行环境称为当前运行的执行环境
         * 任何时候，当控制器从当前运行的执行环境相关的可执行代码转入与该执行环境无关的可执行代码时，会创建一个新的执行环境。
         * 新建的这个执行环境会推入栈中，成为当前运行的执行环境。
         */
        export class ExecutionContexts {
            /**
             *指定该执行环境内的 ECMA 脚本代码中 this 关键字所关联的值
             */
            ThisBinding: any
        }

        /**
         * 当控制流根据一个函数对象 F、调用者提供的 thisArg 以及调用者提供的 argumentList，进入函数代码的执行环境时
         */
        function EnterFunctionCode (F: any, thisArg: any, ...argumentList: any[]) {

        }
        // #endregion

        /**
         * 标识符解析
         */
        function resolveIdentifier (identifier: string) {
            const env = GetCurrentLexicalEnvironment()
            const strict = GetStrictFlag()
            return GetIdentifierReference(env, identifier, strict)
        }

        /**
         * 获得标识符的引用
         * @param lex
         * @param name
         * @param strict
         */
        function GetIdentifierReference (lex: LexicalEnvironment|null, name: string, strict: boolean): types.Reference {
            if (lex === null) {
                return new types.Reference(undefined, name, strict)
            }
            const envRec = lex.envRec
            const exists = envRec.HasBinding(name)
            if (exists) {
                return new types.Reference(envRec, name, strict)
            } else {
                const outer = lex.outer
                return GetIdentifierReference(outer, name, strict)
            }
        }
    }

    /**
     * 11 表达式
     */
    namespace expression {
        // #region Utils
        /**
         * 解析表达式
         * @param exp
         * 即获得exp的结果,比如对于标识符a,它的解析结果是一个 {@type es5.types.Reference}
         */
        function evaluating (exp: Expression): any {

        }

        // #endregion
        type Expression = any

        /**
         * 11.1 主表达式
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
        type PrimaryExpression = lexical.Identifier

        /**
         * 11.2 左值表达式
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
            /**
             * 属性访问表达式
             * left[right]
             */
            function MemberExpression (left: MemberExpression, right: Expression) {
                const baseReference = evaluating(left)
                const baseValue = types.GetValue(baseReference)
                const propertyNameReference = evaluating(right)
                const propertyNameValue = types.GetValue(propertyNameReference)

                conversion.CheckObjectCoercible(baseValue)
                const propertyNameString = conversion.ToString(propertyNameValue)
                const strict = currentCodeIsStrict()

                return new types.Reference(baseValue, propertyNameString, strict)
            }
        }
        type LeftHandSideExpression = any

        /**
         * 11.3 后缀表达式
         */
        namespace PostfixExpression{

        }
        type PostfixExpression = any

        /**
         * 11.4 一元运算符
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
             * typeof 表达式
             * typeof UnaryExpression
             */
            function TypeOfExpression (exp: UnaryExpression) {
                let val = evaluating(exp)
                if (types.Type(val) === 'Reference') {
                    if (types.IsUnresolvableReference(val)) {
                        return 'undefined'
                    }
                    val = types.GetValue(val)
                }
                const map = {
                    Undefined: 'undefiend',
                    Null: 'object',
                    Boolean: 'bollean',
                    Number: 'number',
                    Object: 'object' // 原生，且没有实现 [[Call]]
                    // "Object原生或者宿主且实现了 [[Call]]":"function"
                    // "Object（宿主且没实现 [[Call]]）":"由实现定义，但不能是 "undefined"、"boolean"、"number" 或 "string"。"
                }
                return map[val]
            }

            /**
             * 逻辑非运算符
             * UnaryExpression : ! UnaryExpression
             */
            function LogicalNOTOperator (exp: UnaryExpression) {
                const expr = evaluating(exp)
                const oldValue = conversion.ToBoolean(types.GetValue(expr))
                if (oldValue) {
                    return false
                }
                return true
            }
        }

        /**
         * 11.11 二元逻辑运算符
         *
         *  LogicalANDExpression :
         *      BitwiseORExpression
         *      LogicalANDExpression && BitwiseORExpression
         *  LogicalANDExpressionNoIn :
         *      BitwiseORExpressionNoIn
         *      LogicalANDExpressionNoIn && BitwiseORExpressionNoIn
         *  LogicalORExpression :
         *      LogicalANDExpression
         *      LogicalORExpression || LogicalANDExpression
         *  LogicalORExpressionNoIn :
         *      LogicalANDExpressionNoIn
         *      LogicalORExpressionNoIn || LogicalANDExpressionNoIn
         */
        namespace BinaryLogicalOperators {

            /**
             * 逻辑且表达式
             */
            function LogicalANDExpression (left: LogicalANDExpression, right: BitwiseORExpression) {
                const lref = evaluating(left)
                const lval = types.GetValue(lref)
                if (conversion.ToBoolean(lval) === false) {
                    return lval
                }
                const rref = evaluating(right)
                return types.GetValue(rref)
            }

            /**
             *
             */
            function LogicalORExpression (left: LogicalORExpression, right: LogicalANDExpression) {

            }

            type LogicalANDExpression = any
            type BitwiseORExpression = any
            type LogicalORExpression = any
        }

    }

    /**
     * 12 语句
     */
    namespace statement {

    }

    /**
     * 15 内置类型
     */
    namespace builtins{
        export class Boolean extends types.Object {
            constructor (value: any) {
                super()
                // @ts-ignore
                return conversion.ToBoolean(value)
            }
        }
        export class Number extends types.Object {
            constructor (value: any) {
                super()
            }
        }
        export class String extends types.Object {
            constructor (value: any) {
                super()
            }
        }
    }

}
