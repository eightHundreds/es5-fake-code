namespace es5.conversion{
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
    export declare function ToBoolean(V: any): builtins.Boolean
}
