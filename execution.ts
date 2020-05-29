namespace es5.execution {
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
    function GetIdentifierReference (lex: LexicalEnvironment|null, name: string, strict: boolean): es5.types.Reference {
        if (lex === null) {
            return new es5.types.Reference(undefined, name, strict)
        }
        const envRec = lex.envRec
        const exists = envRec.HasBinding(name)
        if (exists) {
            return new es5.types.Reference(envRec, name, strict)
        } else {
            const outer = lex.outer
            return GetIdentifierReference(outer, name, strict)
        }
    }
}
