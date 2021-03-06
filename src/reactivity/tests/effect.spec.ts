import { reactive } from '../reactive'; 
import { effect, stop } from '../effect';

describe("effect",()=>{
    it("happy path",()=>{
        const user = reactive({
            age:10,
        });

        let nextAge;
        effect(()=>{
            nextAge = user.age +1;
        });

        expect(nextAge).toBe(11);

        //update
        user.age++;
        expect(nextAge).toBe(12);
    });

    it('should return runner when call effect',()=>{
        //effect(fn) -> function(runner) ->fn -> return
        let foo = 10;
        const runner = effect(()=>{
            foo++;
            return "foo";
        });
        expect(foo).toBe(11);

        const r = runner();
        expect(foo).toBe(12);
        expect(r).toBe('foo');
    });

    it('scheduler',()=>{
        //1.通过effect的第二个参数给定得到,一个scheduler的 fn
        //2.effect 第一次执行的时候 还会执行fn
        //3.当 响应式对象 set update 不会执行 fn 而是执行scheduler
        //4.如果说当执行 runner的时候,会再次的执行fn
        let dummy;
        let run: any;
        // jest.fn()可以理解为创建一个函数,这个函数会收集一些信息.比如:传入的参数,调用的次数 等 . 主要用于后续的验证
        const scheduler = jest.fn(()=>{
            run = runner;
        });

        const obj = reactive({ foo: 1 });
        const runner = effect(()=>{
            dummy = obj.foo;
        },
        { scheduler }
        );

        expect(scheduler).not.toHaveBeenCalled();//用于判断函数是否有被调用过
        expect(dummy).toBe(1);
        //should be called on first trigger

        obj.foo++;
        expect(scheduler).toHaveBeenCalledTimes(1);//函数被调用的次数
        //should not run yet
        expect(dummy).toBe(1);
        //manually run 
        run();
        //should have run
        expect(dummy).toBe(2);
    });

    it("stop",()=>{
        let dummy;
        const obj = reactive({props: 1});
        const runner = effect(()=>{
            dummy = obj.prop;
        });
        obj.prop = 2;
        expect(dummy).toBe(2);
        stop(runner);
        // obj.prop = 3;
        //get set
        //obj.prop = obj.prop +1;
        obj.prop++;
        expect(dummy).toBe(2);

        //stopped effect should still be manually callable
        runner();
        expect(dummy).toBe(3);
    });

    it('onStop',()=>{
        const obj = reactive({
            foo: 1,
        });
        const onStop = jest.fn();
        let dummy;
        const runner = effect(
            () => {
                dummy = obj.foo;
            },
            { 
                onStop 
            }
        );
        stop(runner);
        expect(onStop).toBeCalledTimes(1);
    });
})