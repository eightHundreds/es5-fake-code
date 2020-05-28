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

    /**
     * 词法环境
     */
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

    // #region 建立执行环境

    // #endregion
}
