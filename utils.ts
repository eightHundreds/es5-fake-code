// 不在规范中定义的工具方法
function assert (expect: boolean) {
    if (!expect) {
        throw Error()
    }
}
/**
 * 断言v一定是T类型
 * @param v
 */
function assertType<T> (v: any): v is T {
    return true
}
