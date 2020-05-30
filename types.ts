namespace es5.types {
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
        return V.baseValue instanceof es5.types.Object || HasPrimitiveBase(V)
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
