namespace es5 {

    /**
     * 7 词法
     */
    namespace lexical {
        export type Identifier = any
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

        /**
         * 判断是否是原始类型
         * @deprecated 非规范 方法
         * @param x 
         */
        export declare function isPrimitive(x: any): boolean;
        // #endregion

        export class Object {
            /**
             *说明规范定义的对象分类的一个字符串值
             */
            '[[Class]]': string

            /**
             * 对象的原型
             */
            '[[Proptype]]': Object | null

            /**
             *如果是 true，可以向对象添加自身属性。
             */
            '[[Extensible]]': boolean

            /**
             * 与此对象的内部状态信息关联
             */
            '[[PrimitiveValue]]': boolean | number | undefined | string
            /**
             * 返回命名属性的值
             * @param P 属性名
             */
            '[[GET]]'(P: string) {
                // const desc =
            }

            /**
             * 返回此对象的完全填入的自身命名属性的属性描述，如果不存在返回 undefined
             * @param P 属性名
             */
            '[[GetProperty]]'(P: string): PropertyDescriptor | undefined {
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
            '[[GetOwnProperty]]'(P: string) {
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
                D['[[Configurable]]'] = X['[[Configurable]]']
                return D
            }

            /**
             * 创建或修改自身命名属性为拥有属性描述里描述的状态。flag 控制失败处理
             */
            '[[DefineOwnProperty]]'(P: string, Desc: Partial<PropertyDescriptor>, Throw: boolean) {

            }

            /**
             * 返回对象的默认值
             * @param hint hint 是一个字符串 
             */
            '[[DefaultValue]]'(hint?: 'String' | 'Number') {
                if (hint === 'String') {
                    const toString = this["[[GET]]"]('toString');
                    if (conversion.IsCallable(toString)) {
                        const str = toString.call(this)
                        if (isPrimitive(str)) {
                            return str
                        }
                    }

                    const valueOf = this["[[GET]]"]('valueOf');
                    if (conversion.IsCallable(valueOf)) {
                        const val = valueOf.call(this)
                        if (isPrimitive(val)) {
                            return val
                        }
                    }
                    throw TypeError()
                } else if (hint === 'Number') {
                    // 同上, 只是顺序是先尝试调用valueOf,后调用toString
                } else { // hint为空时
                    if (this instanceof Date) {
                        this["[[DefaultValue]]"]('String')
                    } else {
                        this["[[DefaultValue]]"]('Number')
                    }
                }
            }
        }
        // #region 属性描述符
        /**
         * 属性描述符类型是用来解释命名属性具体操作的特性集
         */
        abstract class PropertyDescriptorBase {
            '[[Enumerable]]': boolean
            '[[Configurable]]': boolean
        }
        /**
         * 访问器属性描述符
         */
        abstract class AccessorPropertyDescriptor extends PropertyDescriptorBase {
            // [[Get]] 或 [[Set]]
            '[[Get]]'(): any {

            }

            '[[Set]]'(): void {

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
        export function IsDataDescriptor(Desc: any): Desc is DataPropertyDescriptor {
            if (Desc === undefined) {
                return false
            }
            if (!Desc['[[Value]]'] && !Desc['[[Writable]]']) {
                return false
            }
            return true
        }

        export function IsAccessorDescriptor(Desc: any): Desc is AccessorPropertyDescriptor {
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
            constructor(public readonly baseValue: Object | undefined | execution.EnvironmentRecord, public readonly name: string, public readonly strict: boolean) {
            }
        }

        export function IsUnresolvableReference(V: Reference) {
            return V.baseValue === undefined
        }

        export function GetBase(V: Reference) {
            return V.baseValue
        }

        /**
         * 是否是属性引用
         * @param V
         */
        export function IsPropertyReference(V: Reference) {
            return V.baseValue instanceof types.Object || HasPrimitiveBase(V)
        }

        /**
        * 是否有有原始类型的基值
        * @param V
        */
        export function HasPrimitiveBase(V: Reference) {
            return (V.baseValue instanceof Boolean || V.baseValue instanceof String || V.baseValue instanceof Number)
        }

        /**
         * 返回引用值 V 的引用名称部分
         * @param V
         */
        export function GetReferencedName(V: Reference) {
            return V.name
        }

        /**
         * 返回引用值 V 的严格引用部分
         * @param V
         */
        export function IsStrictReference(V: Reference) {
            return V.strict
        }

        /**
         * 获得值，如果V是引用类型会解析出引用的基值
         * @param V
         */
        export function GetValue(V: any) {
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
    namespace conversion {
        export function ToObject(V: any) {
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
        export function ToBoolean(V: any): false | true {
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
         * 是否可调用对象
         * @param V 
         */
        export declare function IsCallable(V: any): boolean;

        /**
         * 将V转换成非对象类型，ToNumber，ToString等方法内部都调用它
         * 返回该对象的默认值。调用该对象的内部方法 [[DefaultValue]] 来恢复这个默认值，调用时传递暗示期望类型（所有 ECAMScript 本地对象的 [[DefaultValue]] 一樣）。
         * @param V
         */
        export declare function ToPrimitive(V: any, hint?: 'String' | 'Number'): any {
            if (types.Type(V) !== 'Object') {
                return V;
            }
            return (V as types.Object)['[[DefaultValue]]'](hint);
        }

        /**
         * 检查V是否能ToObject
         * @param V
         */
        export function CheckObjectCoercible(V: any) {
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
        function GetCurrentLexicalEnvironment(): LexicalEnvironment {
            // TODO
            let env: LexicalEnvironment
            // @ts-ignore
            return env
        }
        /**
          * 获得当前环境是否是严格模式
          */
        declare function GetStrictFlag(): boolean

        /**
         * 获得代码的类型,全局代码,eval代码,function代码
         */
        declare function GetCodeType(code: string): 'eval' | 'global' | 'function'

        // #endregion

        // #region 词法环境
        export class LexicalEnvironment {
            envRec!: EnvironmentRecord
            outer?: LexicalEnvironment | null
        }
        /**
         * 全局环境 (词法环境)
         */
        const GlobalEnvironment = (function () {
            const C = new LexicalEnvironment()
            const record = new ObjectEnvironmentRecord()
            record.bindingObject = globalThis
            C.envRec = record
            C.outer = null
            return C
        })()
        /**
         * 环境记录项
         */
        export class EnvironmentRecord {
            /**
             * 判断环境记录项是否包含对某个标识符的绑定
             * @param N 标识符文本
             */
            HasBinding(N: string): boolean {
                // TODO
                return true
            }

            /**
             * 返回环境记录项中一个已经存在的绑定的值
             * @param N 指定绑定的名称
             * @param S 是否是严格模式
             */
            GetBindingValue(N: string, S: boolean) {

            }
        }
        // declarative environment records and object environment records.

        /**
         * 声明式环境记录项
         *
         * 声明式环境记录项都与一个包含`变量`和（或）`函数声明`的 ECMA 脚本的程序作用域相关联
         * 例如 FunctionDeclaration、VariableDeclaration 以及 Catch 语句
         *
         */
        export class DeclarativeEnvironmentRecord extends EnvironmentRecord {
            /**
             * 这个是规范中没有直接提到的结构,是我自己定义的.
             * 它保存了标识符文本与数据的映射
             */
            private readonly bindingMap: Record<string, {
                value: any
                mutable: boolean // 是否可变
            }> = {}

            /**
             * 返回环境记录项中一个已经存在的绑定的值
             * @param N 指定绑定的名称
             * @param S 是否是严格模式
             */
            GetBindingValue(N: string, S: boolean) {
                const envRec = this // 令 envRec 为函数调用时对应的声明式环境记录项
                assert(envRec.HasBinding(N))
                // 未初始化的不可变绑定
                if (this.bindingMap[N].mutable && this.bindingMap[N].value === undefined) {
                    throw ReferenceError()
                }
                return this.bindingMap[N].value
            }
        }

        /**
         * 对象环境记录项
         * 对象式环境记录项用于定义那些将标识符与具体对象的属性绑定的 ECMA 脚本元素，例如 Program 以及 WithStatement 表达式
         */
        export class ObjectEnvironmentRecord extends EnvironmentRecord {
            /**
             * 绑定对象
             * 对象式环境记录项没有不可变绑定
             */
            public bindingObject!: Record<string, any>
            provideThis: boolean = false
        }
        // #endregion

        // #region 执行环境
        /**
         * 执行环境包含所有用于追踪与其相关的代码的执行进度的状态
         *
         * 当控制器转入 ECMA 脚本的可执行代码时，控制器会进入一个执行环境
         * 当前活动的多个执行环境在逻辑上形成一个栈结构。该逻辑栈的最顶层的执行环境称为当前运行的执行环境
         * 任何时候，当控制器从当前运行的执行环境相关的可执行代码转入与该执行环境无关的可执行代码时，会创建一个新的执行环境。
         * 新建的这个执行环境会推入栈中，成为当前运行的执行环境。
         */
        export class ExecutionContext {
            /**
             *指定该执行环境内的 ECMA 脚本代码中 this 关键字所关联的值
             */
            ThisBinding: any

            /**
             * 词法环境
             * 指定一个词法环境对象，用于解析该执行环境内的代码创建的标识符引用。
             * 在该执行环境相关联的代码的执行过程中，变量环境组件永远不变，而词法环境组件有可能改变
             */
            LexicalEnvironment!: LexicalEnvironment

            /**
             * 变量环境
             *指定一个词法环境对象，其环境数据用于保存由该执行环境内的代码通过 VariableStatement 和 FunctionDeclaration 创建的绑定。
             */
            VariableEnvironment!: LexicalEnvironment
        }

        /**
         * 进入全局代码
         */
        function EnterGlobalCode() {
            const C = new ExecutionContext()
            C.VariableEnvironment = GlobalEnvironment
            C.LexicalEnvironment = GlobalEnvironment
            C.ThisBinding = globalThis
        }

        /**
         * 当控制流根据一个函数对象 F、调用者提供的 thisArg 以及调用者提供的 argumentList，进入函数代码的执行环境时
         */
        function EnterFunctionCode(F: any, thisArg: any, ...argumentList: any[]) {

        }

        /**
         * 声明式绑定初始化
         */
        function DeclarationBindingInstantiation(code: string) {
            const env = GetCurrentLexicalEnvironment().envRec
            let configurableBindings = false
            let strict = false

            if (GetCodeType(code) === 'eval') {
                configurableBindings = true
            }
            if (currentCodeIsStrict()) {
                strict = true
            }
            if (GetCodeType(code) === 'function') {
                // TODO
            }
        }

        // #endregion

        /**
         * 标识符解析
         */
        function resolveIdentifier(identifier: string) {
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
        function GetIdentifierReference(lex: LexicalEnvironment | null, name: string, strict: boolean): types.Reference {
            if (lex === null) {
                return new types.Reference(undefined, name, strict)
            }
            const envRec = lex.envRec
            const exists = envRec.HasBinding(name)
            if (exists) {
                return new types.Reference(envRec, name, strict)
            } else {
                const outer = lex.outer!
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
        function evaluating(exp: Expression): any {

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
        namespace LeftHandSideExpression {
            type MemberExpression = any
            /**
             * 属性访问表达式
             * left[right]
             */
            function MemberExpression(left: MemberExpression, right: Expression) {
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
        namespace PostfixExpression {

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
        namespace UnaryOperators {
            type UnaryExpression = any

            /**
             * typeof 表达式
             * typeof UnaryExpression
             */
            function TypeOfExpression(exp: UnaryExpression) {
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
            function LogicalNOTOperator(exp: UnaryExpression) {
                const expr = evaluating(exp)
                const oldValue = conversion.ToBoolean(types.GetValue(expr))
                if (oldValue) {
                    return false
                }
                return true
            }
        }


        /**
         * 11.5 乘法运算符
         *    MultiplicativeExpression :
         *        UnaryExpression
         *        MultiplicativeExpression * UnaryExpression
         *        MultiplicativeExpression / UnaryExpression
         *        MultiplicativeExpression % UnaryExpression
         */
        namespace MultiplicativeOperators {
            export type MultiplicativeExpression = any;
        }

        /**
         * 11.6 加法运算符
         * AdditiveExpression :
         *  MultiplicativeExpression
         *  AdditiveExpression + MultiplicativeExpression
         *  AdditiveExpression - MultiplicativeExpression
         */
        namespace AdditiveOperators {
            export type AdditiveExpression = any

            /**
             * AdditiveExpression + MultiplicativeExpression
             * @param left 
             * @param right 
             */
            function AdditionOperator(left: AdditiveExpression, right: MultiplicativeOperators.MultiplicativeExpression) {
                const lref = evaluating(left);
                const lval = types.GetValue(lref);
                const rref = evaluating(right);
                const rval = types.GetValue(rref);

                const lprim = conversion.ToPrimitive(lval);
                const rprim = conversion.ToPrimitive(rval);

                if (types.Type(lprim) === 'String' || types.Type(rprim) === 'String') {
                    return `${conversion.ToString(lprim)}${conversion.ToBoolean(rprim)}`
                }

                // 当两个都是数值时
                
                /*
                加法遵循 IEEE 754 二进制双精度幅度浮点算法规则：
                    若两个操作数之一为 NaN，结果为 NaN。
                    两个正负号相反的无穷之和为 NaN。
                    两个正负号相同的无穷大之和是具有相同正负的无穷大。
                    无穷大和有穷值之和等于操作数中的无穷大。
                    两个负零之和为 -0。
                    两个正零，或者两个正负号相反的零之和为 +0。
                    零与非零有穷值之和等于非零的那个操作数。
                    两个大小相等，符号相反的非零有穷值之和为 +0。
                    其它情况下，既没有无穷大也没有 NaN 或者零参与运算，并且操作数要么大小不等，要么符号相同，结果计算出来后会按照 IEEE 754 round-to-nearest 取到最接近的能表示的数。如果值过大不能表示，则结果为相应的正负无穷大。如果值过小不能表示，则结果为相应的正负零。ECMAScript 要求支持 IEEE 754 规定的渐进下溢。
                    - 运算符作用于两个数字类型时表示减法，产生两个操作数之差。左边操作数是被减数右边是减数。给定操作数 a 和 b，总是有 a–b 产生与 a + (-b) 产生相同结果。
                */
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
            function LogicalANDExpression(left: LogicalANDExpression, right: BitwiseORExpression) {
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
            function LogicalORExpression(left: LogicalORExpression, right: LogicalANDExpression) {

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
     * 13 函数定义
     */
    namespace functionDeclaration {
        // #region Utils
        /**
         * 获得参数列表的标识符字符串
         */
        declare function getArgumentNames(argumentList): string[]

        // #endregion

        /**
         * 创建函数对象
         */
        export function createFunctionObject(argumentList, functionBody, scope: execution.LexicalEnvironment, strict: boolean) {
            let F = new types.Object()
            F = F as builtins.Function
            F['[[Class]]'] = 'Function'
            // 设定 F 的 [[Prototype]] 内部属性为 15.3.3.1 指定的标准内置 Function 对象的 prototype 属性。
            F['[[Proptype]]'] = builtins.Function.prototype
            // 依照 15.3.5.4 描述，设定 F 的 [[Get]] 内部属性。即F.[[Get]]
            // 依照 13.2.1 描述，设定 F 的 [[Call]] 内部属性。即F.[[Call]]
            // 依照 13.2.2 描述，设定 F 的 [[Construct]] 内部属性。即F.[[Construct]]
            // 依照 15.3.5.3 描述，设定 F 的 [[HasInstance]] 内部属性。即F.[[HasInstance]]
            F['[[Scope]]'] = scope
            const names = getArgumentNames(argumentList)
            F['[[FormalParameters]]'] = names
            F['[[Code]]'] = functionBody
            F['[[Extensible]]'] = true

            const len = argumentList.length
            F['[[DefineOwnProperty]]']('length', {
                '[[Value]]': len,
                '[[Enumerable]]': false
            }, false)
            const proto = new types.Object()
            proto['[[DefineOwnProperty]]']('constructor', {
                '[[Value]]': proto,
                '[[Writable]]': true,
                '[[Enumerable]]': false,
                '[[Configurable]]': true
            }, false)
            F['[[DefineOwnProperty]]']('prototype', {
                '[[Value]]': proto,
                '[[Writable]]': true,
                '[[Enumerable]]': false,
                '[[Configurable]]': false
            }, false)

            if (strict) {
                const thrower = ThrowTypeError
                F['[[DefineOwnProperty]]']('caller', {
                    '[[Get]]': thrower,
                    '[[Set]]': thrower,
                    '[[Enumerable]]': false,
                    '[[Configurable]]': false
                }, false)
                F['[[DefineOwnProperty]]']('arguments', {
                    '[[Get]]': thrower,
                    '[[Set]]': thrower,
                    '[[Enumerable]]': false,
                    '[[Configurable]]': false
                }, false)
            }
            return F
        }

        /**
         * [[ThrowTypeError]] 对象是个唯一的函数对象
         */
        const ThrowTypeError = (function () {
            return () => { }
        })()
    }

    /**
     * 15 内置类型
     */
    namespace builtins {
        export class Boolean extends types.Object {
            constructor(value: any) {
                super()
                // @ts-ignore
                return conversion.ToBoolean(value)
            }
        }
        export class Number extends types.Object {
            constructor(value: any) {
                super()
            }
        }
        export class String extends types.Object {
            constructor(value: any) {
                super()
            }
        }
        export class Function extends types.Object {
            /**
             * 对象自身是一个函数对象 ( 它的 [[Class]] 是 "Function")，调用这个函数对象时，接受任何参数并返回 undefined
             * 对象的 [[Prototype]] 内部属性值是标准内置 Object 的 prototype 对象 (15.2.4)。Function 的 prototype 对象的 [[Extensible]] 内部属性的初始值是 true
             * 对象自身没有 valueOf 属性 ; 但是，它从 Object 的 prototype 对象继承了 valueOf 属性
             * 对象的 length 属性是 0
             */
            // @ts-ignore
            static prototype!: functionDeclaration.FunctionObject

            /**
             * 返回一个表示参数对象是否可能是由本对象构建的布尔值。在标准内置 ECMAScript 对象中只有 Function 对象实现 [[HasInstance]]
             */
            '[[HasInstance]]'() {

            }

            /**
             * 一个定义了函数对象执行的环境的词法环境。在标准内置 ECMAScript 对象中只有 Function 对象实现 [[Scope]]。
             */
            '[[Scope]]': execution.LexicalEnvironment

            /**
             *一个包含 Function 的 FormalParameterList 的标识符字符串的可能是空的列表。在标准内置 ECMAScript 对象中只有 Function 对象实现 [[FormalParameterList]] Question.png。
             */
            '[[FormalParameters]]': string[]

            /**
             *函数的 ECMAScript 代码。在标准内置 ECMAScript 对象中只有 Function 对象实现 [[Code]]。
             */
            '[[Code]]': any

            // 本项目的其他地方会调用原生的call,但实际上就是调用这个[[Call]]
            '[[Call]]'(thisArgs, ...args: any[]) {

            }

            '[[Construct]]'(argumentList?: any[]) {

            }
        }

    }

}
