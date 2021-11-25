import Input from './Input'
import { PHE } from './PHE'

function HTML(str: TemplateStringsArray, ...a: any[]) {
    console.log(' HTML FMT items ', a)
    const s = str.reduce((acm, str, i) => [...acm, str, a[i]], [])
    return s
}

export class App extends PHE {
    constructor(elementSelector: string) {
        super(elementSelector)
        //this.$$ctx.name = "ok";
    }

    ctx: { name: string; counter: number; obj: { c: number } }

    template() {
        //return `the: <div text="counter"></div> <div text="name"></div> <div text="obj.c"></div> <Input/> ${this.ctx.counter}`;
        return HTML`
        <div style="width: 100px; height: 20px; background-color: green;color:white">
            ${this.ctx?.obj?.c}
            <span>${new Input()}</span>
        </div>`
    }

    mounted() {
        console.log('$$ctx', this.$$ctx)
        console.log('ctx', this.ctx)
        //this.ctx.name = "name1";
        this.ctx.name = '__O|O__'

        this.ctx.obj = { c: 0 }

        //@ts-ignore
        this.name = '10'

        //this.ctx = { name: "", counter: 1 };

        let counter = 0
        setInterval(() => {
            this.ctx.counter = counter
            this.ctx.obj.c = counter * 2
            console.log('$$ctx', this.$$ctx);
            counter++
        }, 1000)

        console.log('$$ctx', this.$$ctx)
        console.log('ctx', this.ctx)
    }

    //   get id(){

    //   }
    //   set id(value: string){

    //   }
}
