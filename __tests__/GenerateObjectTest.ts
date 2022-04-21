import {generateArray, generateObject} from "../src/mock/ObjectGenerator";
import {constantValues, values} from "../src/mock/MockGenerator";
import {Fake} from "../src/mock/FakerField";


describe("Test Generate Object",()=>{
  it('should generate object', function () {
    const target = {a:1}
    const result = generateObject({
      a:1
    })
    expect(result).toStrictEqual(target)
  });

  it('should generate nested object', function () {
    const target = {
      a:1,
      b:{
        c:1
      }
    }
    const result = generateObject({
      a:1,
      b:{
        c:1
      }
    })
    expect(result).toStrictEqual(target)
  });

  it('should generate array with single value', function () {
    const target = {
      a:[1,1,1]
    }
    const result = generateObject({
      "a[+3]":1
    })
    expect(result).toStrictEqual(target)
  });

  it('should generate array with nested value', function () {
    const target = {
      a:[
        {
          b:1,
          c:2
        },
        {
          b:1,
          c:2
        }
      ]
    }
    const result = generateObject({
      "a[+2]":{
        b:1,
        c:2
      }
    })
    expect(result).toStrictEqual(target)
  });

  it('should generate array with nested array value', function () {
    const target = {
      a:[
        {
          b:1,
          c:2,
          d:[1,2]
        },
        {
          b:1,
          c:2,
          d:[3,1]
        }
      ]
    }
    const result = generateObject({
      "a[+2]":{
        b:1,
        c:2,
        "d[+2]":constantValues(1,2,3,1)
      }
    })
    expect(result).toStrictEqual(target)
  });

  it('should skip', function () {
    const target = {
      a:2,
      b:{
        c:3
      }
    }
    const result = generateObject({
      a:constantValues(1,2,3),
      b:{
        c:constantValues(2,3,4)
      }
    },1)
    expect(result).toStrictEqual(target)
  });

})

describe("Test Generate Object with variables",()=>{
  it('with size variable', function () {
    const target = {
      a:[1,1,1]
    }
    const result = generateObject({
      "a[+n]":1
    },0,{n:3})
    expect(result).toStrictEqual(target)
  });

  it('with value variable', function () {
    const target = {
      a:"test"
    }
    const result = generateObject({
      "a":values("{{name}}")
    },0,{},{name:"test"})
    expect(result).toStrictEqual(target)
  });

  it('with multiple variables', function () {
    const target = {
      a:"test it"
    }
    const result = generateObject({
      "a":values("{{name}} {{another}}")
    },0,{},{name:"test",another:"it"})
    expect(result).toStrictEqual(target)
  });

  it('with primitive string', function () {
    const target = {
      a:"test it"
    }
    const result = generateObject({
      "a":"{{name}} {{another}}"
    },0,{},{name:"test",another:"it"})
    expect(result).toStrictEqual(target)
  });

  it('merge primitive value and generator', function () {
    const target = {
      a:["test it","Maurine"]
    }
    const result = generateObject({
      "a[+2]":values("{{name}} {{another}}", Fake("name.firstName"))
    },0,{},{name:"test",another:"it"})
    expect(result).toStrictEqual(target)
  });

})
describe("Test Generate Object with variables",()=>{
  it('generate arrray', function () {
    const target = [
      {
        a:["test it","Maurine"]
      },
      {
        a:["Mervin","Edison"]
      }
    ]
    const result = generateArray({
      "a[+2]":values("{{name}} {{another}}", Fake("name.firstName"))
    },2,0,{},{name:"test",another:"it"})
    expect(result).toStrictEqual(target)
  });
})
