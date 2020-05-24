namespace es5.types {
    // #region utils
    /**
     * 解析x的类型
     * @param x
     * @returns 引用、列表、完结、属性描述式、属性标示、词法环境、 环境纪录
     */
    export declare function Type (x: any): 'Reference'
    // #endregion

    export class Reference {
        constructor (private readonly baseValue: any, private readonly name: string, private readonly strict: boolean) {

        }

        public GetValue () {

        }
    }

}
