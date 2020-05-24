namespace es5.builtins{
    export class Boolean extends types.Object {
        constructor (value: any) {
            super()
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
