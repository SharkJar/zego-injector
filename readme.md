# zego nodejs端的Injector工具
## 注意Inject的对象是全局唯一的 
> ## Factory.createConstructor 直接创建一个实例/如果已经被创建 则直接返回. 注意传入的class必须被@Injectable
> ## Factory.getInstance 检查当前模块是否已经被实例化过，如果已经实例化过就直接返回实例 否则返回null
> ### 使用方法
```
import { Factory, Injectable } from 'zego-injector'

@Injectable()
class TestInjectA{
    sayBy(){ return "By" }
}
@Injectable()
class TestInjectB{
    constructor(private testA:TestInjectA){}
    log(){
        const testASay = this.testA.sayBy()
        console.log(testASay)
    }
}

Factory.createConstructor<TestInjectB>(TestInjectB).log()
Factpry.getInstance(TestInjectB).log()
```
> ## Factory.createFactory 根据你传递的function返回的结果 当作实例. 这样其他地方也可以拿到当前实例
> ### 使用方法
```
import { Factory, Injectable } from 'zego-injector'

@Injectable()
class TestInjectA{
    sayBy(){ return "By" }
}

const instance = Factory.createFactory(
    // 你需要传递的方法 必须返回一个结果 用于当作实例
    function (testA:TestInjectA){
        return testA.sayBy()
    },
    // 你的key 方便其他地方可以根据key inject到你
    "MYTEST",
    // 你需要依赖的对象 传递给你的function
    [TestInjectA]
)

console.log(instance)
```

> ## Factory.create 是Factory.createConstructor 与 Factory.createFactory的集合 动态判断需要哪种创建方式
> ## Factory.useValue 注册一个module
> ### 使用方法
```
import { Factory, Injectable } from 'zego-injector'
class TestValueA{
    sayBy(){ return "By" }
}

// 注册一个module
Factory.useValue({
    useValue:new TestValueA(),
    // 你的key 方便其他地方可以根据key inject到你
    provide:"MYVALUE"
})

console.log(Factory.create("MYVALUE").sayBy())
```

> ## Factory.useFactory 根据你传递的Function 注册一个module
> ### 使用方法
```
import { Factory, Injectable } from 'zego-injector'
@Injectable()
class TestFactoryA{
    sayBy(){ return "By" }
}

Factory.useFactory({
     useFactory(testA:TestFactoryA){
        return testA
    },
    inject:[TestFactoryA],
    provide:"MYFACTORY"
})

console.log(Factory.create("MYFACTORY").sayBy())
```

> ## Factory.useClass 给一个@Injectable的class 进行别名
> ### 使用方法
```
@Injectable()
class TestClassA{
    sayBy(){ return "By" }
}

// 定义一个module 这时候是不会创建的
Factory.useClass({
    // 必须是@Injectable
    useClass:TestClassA,
    // 你的key 方便其他地方可以根据key inject到你
    provide:"MYCLASS"
})

expect(Factory.create("MYCLASS").sayBy()).toBe("By")

const GetMyClass = function (){
    return createParamDecorator({
        factory(myclass:any){ return myclass },
        inject:["MYCLASS"]
    })
}

@Injectable()
class TestClassB{
    log(
        @GetMyClass()
        myclass:any
    ){
        return myclass.sayBy()
    }
}

console.log(Factory.create<TestClassB>("TestClassB").log())
```