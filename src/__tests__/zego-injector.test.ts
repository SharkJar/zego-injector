import { Factory, Injectable, createParamDecorator, createPropertyDecorator } from '../index';

describe('Injector test', () => {
  it('Injectable', () => {
    @Injectable()
    class TestInjectA {
      sayBy() {
        return 'By';
      }
    }
    @Injectable()
    class TestInjectB {
      constructor(private testA: TestInjectA) {}
      log() {
        const testASay = this.testA.sayBy();
        return testASay;
      }
    }

    expect(Factory.create<TestInjectB>(TestInjectB).log()).toBe('By');
  });

  it('createPropertyDecorator', () => {
    @Injectable()
    class TestPropA {
      sayBy() {
        return 'By';
      }
    }

    const GetTestA = function () {
      return createPropertyDecorator({
        factory(testA: TestPropA) {
          return testA;
        },
        inject: [TestPropA],
      });
    };

    @Injectable()
    class TestPropB {
      @GetTestA()
      testA?: TestPropA;

      log() {
        const testASay = this.testA?.sayBy();
        return testASay;
      }
    }

    expect(Factory.create<TestPropB>(TestPropB).log()).toBe('By');
  });

  it('createParamDecorator', () => {
    @Injectable()
    class TestParamsA {
      sayBy() {
        return 'By';
      }
    }

    const GetTestA = function () {
      return createParamDecorator({
        factory(testA: TestParamsA) {
          return testA;
        },
        inject: [TestParamsA],
      });
    };

    @Injectable()
    class TestParamsB {
      log(
        @GetTestA()
        testA?: TestParamsA,
      ) {
        return testA?.sayBy();
      }
    }

    expect(Factory.create<TestParamsB>(TestParamsB).log()).toBe('By');
  });

  it('Factory.craeteFactory', () => {
    @Injectable()
    class TestFactoryA {
      sayBy() {
        return 'By';
      }
    }

    const instance = Factory.createFactory(
      // 你需要传递的方法 必须返回一个结果 用于当作实例
      function (testA: TestFactoryA) {
        return testA.sayBy();
      },
      // 你的key 方便其他地方可以根据key inject到你
      'MYTEST',
      // 你需要依赖的对象 传递给你的function
      [TestFactoryA],
    );
    expect(instance).toBe('By');
    expect(Factory.getInstance('MYTEST')).toBe('By');

    const GetMyTest = function () {
      return createParamDecorator({
        factory(mytest: any) {
          return mytest;
        },
        inject: ['MYTEST'],
      });
    };

    @Injectable()
    class TestFactoryB {
      log(
        @GetMyTest()
        mytest: any,
      ) {
        return mytest;
      }
    }

    expect(Factory.create<TestFactoryB>(TestFactoryB).log()).toBe('By');
  });

  it('Factory.useValue', () => {
    class TestValueA {
      sayBy() {
        return 'By';
      }
    }

    Factory.useValue({
      useValue: new TestValueA(),
      // 你的key 方便其他地方可以根据key inject到你
      provide: 'MYVALUE',
    });

    expect(Factory.create('MYVALUE').sayBy()).toBe('By');
  });

  it('Factory.useFactory', () => {
    @Injectable()
    class TestFactoryA {
      sayBy() {
        return 'By';
      }
    }

    Factory.useFactory({
      useFactory(testA: TestFactoryA) {
        return testA;
      },
      inject: [TestFactoryA],
      provide: 'MYFACTORY',
    });

    expect(Factory.create('MYFACTORY').sayBy()).toBe('By');
  });

  it('Factory.useClass', () => {
    @Injectable()
    class TestClassA {
      sayBy() {
        return 'By';
      }
    }

    // 定义一个module 这时候是不会创建的
    Factory.useClass({
      // 必须是@Injectable
      useClass: TestClassA,
      // 你的key 方便其他地方可以根据key inject到你
      provide: 'MYCLASS',
    });

    expect(Factory.create('MYCLASS').sayBy()).toBe('By');

    const GetMyClass = function () {
      return createParamDecorator({
        factory(myclass: any) {
          return myclass;
        },
        inject: ['MYCLASS'],
      });
    };

    @Injectable()
    class TestClassB {
      log(
        @GetMyClass()
        myclass: any,
      ) {
        return myclass.sayBy();
      }
    }

    expect(Factory.create<TestClassB>(TestClassB).log()).toBe('By');
  });
});
