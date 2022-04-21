import {Fake, FakeExpr} from "../src/mock/FakerField";
import {FakeObject, values} from "../src/mock/MockGenerator";

describe("Test fakerjs field",()=>{
  it('generate faker field', function () {
    const generateValueFn = Fake("address.city")()
    const field = generateValueFn()
    expect(field).toBe("Rathburgh")
  });

  it('generate faker field with custom seed', function () {
    const generateValueFn = Fake("address.city",{
      seed:100
    })()
    const field = generateValueFn()
    expect(field).toBe("Marcusburgh")
  });

  it('generate faker field with custom seed', function () {
    const generateValueFn = Fake("name.firstName",{
      locale:"zh_CN"
    })()
    const field = generateValueFn()
    expect(field).toBe("昊天")
  });

  it('generate faker field with options', function () {
    const length = 5
    const generateValueFn = Fake("lorem.word",{options:[length]})()
    const field = generateValueFn()
    expect(field.length).toBe(length)
  });

  it('individual FakeField should generte same sequence', function () {
    const generateValueFn1 = Fake("address.city")()
    const generateValueFn2 = Fake("address.city")()
    expect(generateValueFn1()).toBe(generateValueFn2())
    expect(generateValueFn1()).toBe(generateValueFn2())
    expect(generateValueFn1()).toBe(generateValueFn2())
    expect(generateValueFn1()).toBe(generateValueFn2())
  });
})

describe("Test Fakerjs Expr",()=>{
  it('should merge several fields', function () {
    const generateValueFn = FakeExpr("{{name.firstName}} {{name.lastName}}")()
    expect(generateValueFn()).toBe("Maurine Rath")
    expect(generateValueFn()).toBe("Edison Keebler")
  });
})

describe("Test FakeObject",()=>{
  it('should generate different fake Object', function () {
    const generateValueFn = FakeObject({
      a:values(1,2),
      b:values(3,4)
    })()
    expect(generateValueFn()).toStrictEqual({a:1,b:3})
    expect(generateValueFn()).toStrictEqual({a:2,b:4})
  });
})

