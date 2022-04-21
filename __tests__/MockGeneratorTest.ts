import {MockGenerator, constantValues} from "../src/mock/MockGenerator";
import {Fake} from "../src/mock/FakerField";

describe("Test Mock Generator",()=>{
  it('should generate values in loop only', function () {
    const mock = new MockGenerator([1,2,3])
    const generator = mock.generatorFactory(0)
    expect(generator.next().value).toBe(1)
    expect(generator.next().value).toBe(2)
    expect(generator.next().value).toBe(3)
    expect(generator.next().value).toBe(1)
    expect(generator.next().value).toBe(2)
  });

  it('should generate with generator', function () {
    const mock = new MockGenerator([],()=>{
      return ()=>{
        return 1
      }
    })
    const generator = mock.generatorFactory(0)
    expect(generator.next().value).toBe(1)
    expect(generator.next().value).toBe(1)
    expect(generator.next().value).toBe(1)
  });

  it('should combine values and generator', function () {
    const mock = new MockGenerator([1,2,3],()=>{
      return ()=>{
        return 1
      }
    })

    const generator = mock.generatorFactory(0)
    expect(generator.next().value).toBe(1)
    expect(generator.next().value).toBe(2)
    expect(generator.next().value).toBe(3)
    expect(generator.next().value).toBe(1)
    expect(generator.next().value).toBe(1)
  });

  it('should skip n with values in loop', function () {
    const mock = new MockGenerator([1,2,3])
    const generator = mock.generatorFactory(1)
    expect(generator.next().value).toBe(2)
    expect(generator.next().value).toBe(3)
    expect(generator.next().value).toBe(1)
    expect(generator.next().value).toBe(2)
    expect(generator.next().value).toBe(3)
  });

  it('should skip n with generator', function () {
    const mock = new MockGenerator([],()=>{
      let values = [1,5,8]
      let cursor = 0
      return ()=>{
        const value = values[cursor % values.length]
        cursor++
        return value
      }
    })
    const generator = mock.generatorFactory(2)
    expect(generator.next().value).toBe(8)
    expect(generator.next().value).toBe(1)
    expect(generator.next().value).toBe(5)
    expect(generator.next().value).toBe(8)
  });

  it('should skip n with both values & generator', function () {
    const mock = new MockGenerator([1,2,3],()=>{
      let values = [1,5,8]
      let cursor = 0
      return ()=>{
        const value = values[cursor % values.length]
        cursor++
        return value
      }
    })
    const generator = mock.generatorFactory(2)
    expect(generator.next().value).toBe(3)
    expect(generator.next().value).toBe(1)
    expect(generator.next().value).toBe(5)
    expect(generator.next().value).toBe(8)
    expect(generator.next().value).toBe(1)
    expect(generator.next().value).toBe(5)
    expect(generator.next().value).toBe(8)
  });
})


describe("values",()=>{
  it('should generate only hard code values', function () {
    const generator = constantValues(1,2,3)(0)
    expect(generator.next().value).toBe(1)
    expect(generator.next().value).toBe(2)
    expect(generator.next().value).toBe(3)
    expect(generator.next().value).toBe(1)
    expect(generator.next().value).toBe(2)
    expect(generator.next().value).toBe(3)
  });

  it('should generate both hard code values and fake generator', function () {
    const generator = constantValues("a","b","c",Fake("name.firstName"))(0)
    expect(generator.next().value).toBe("a")
    expect(generator.next().value).toBe("b")
    expect(generator.next().value).toBe("c")
    expect(generator.next().value).toBe("Maurine")
    expect(generator.next().value).toBe("Mervin")
  });

  it('should generate fake generator', function () {
    const generator = constantValues(Fake("name.firstName"))(0)
    expect(generator.next().value).toBe("Maurine")
    expect(generator.next().value).toBe("Mervin")
  });
})
