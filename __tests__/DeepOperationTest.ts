import {deepGet, deepSet} from "../src/utils/DeepOperation";
import {constantValues} from "../src/mock/MockGenerator";
import {extractObject, From} from "../src/server/Rewriter";

describe("test deep get",()=>{
  it('should get nested value', function () {
    expect(deepGet({a:{b:"value"}},"a.b")).toBe("value")
  });

  it('should get nested array', function () {
    expect(deepGet({a:{b:[1,2,3]}},"a.b[]")).toStrictEqual([1,2,3])
  });

  it('should get nested array nest field', function () {
    expect(deepGet({a:{b:[{n:1},{n:2}]}},"a.b[].n")).toStrictEqual([1,2])
  });

  it('should get nested array nest object', function () {
    expect(deepGet({a:{b:[{n:1},{n:2}]}},"a.b[]")).toStrictEqual([{n:1},{n:2}])
  });
})


describe("test deep set",()=>{
  it('should set nested value', function () {
    const target = {a:{b:"value"}}
    deepSet(target,"a.b","another")
    expect(target.a.b).toBe("another")
  });

  it('should set nested array value', function () {
    const target = {a:{b:[{n:1},{n:2}]}}
    deepSet(target,"a.b[0].n",3)
    expect(target.a.b[0].n).toBe(3)
  });

  it('should remove nested value', function () {
    const target = {a:{b:[{n:1},{n:2}]}}
    deepSet(target,"a.b",undefined)
    expect(target.a.b).toBe(undefined)
  });

  it('should generator value', function () {
    function* generator():Generator{
      yield 2
      yield 3
    }
    const gen = generator()
    const target = {a:{b:[{n:1},{n:2}]}}
    deepSet(target,"a.b[0].n",gen)
    deepSet(target,"a.b[1].n",gen)
    expect(target.a.b[0].n).toBe(2)
    expect(target.a.b[1].n).toBe(3)
  });

  it('should apply to all array value', function () {
    function* generator():Generator{
      yield 2
      yield 3
    }
    const gen = generator()
    const target = {a:{b:[{n:1},{n:2}]}}
    deepSet(target,"a.b[].n",gen)
    expect(target.a.b[0].n).toBe(2)
    expect(target.a.b[1].n).toBe(3)
  });

  it('should apply to array primitive value', function () {
    function* generator():Generator{
      yield 2
      yield 3
    }
    const gen = generator()
    const target = [1,2]
    deepSet(target,"[]",gen)
    expect(target[0]).toBe(2)
    expect(target[1]).toBe(3)
  });

  it('should apply to first level array value', function () {
    function* generator():Generator{
      yield 2
      yield 3
    }
    const gen = generator()
    const target = [{n:1},{n:2}]
    deepSet(target,"[].n",gen)
    expect(target[0].n).toBe(2)
    expect(target[1].n).toBe(3)
  });

  it('should apply to nest level array value', function () {
    function* generator():Generator{
      yield 2
      yield 3
      yield 4
    }
    const gen = generator()
    const target = [
      {n:[
        {n2:1}
      ]},
      {n:[
        {n2:2},
        {n2:3}
      ]}
    ]
    deepSet(target,"[].n[].n2",gen)
    expect(target[0].n[0].n2).toBe(2)
    expect(target[1].n[0].n2).toBe(3)
    expect(target[1].n[1].n2).toBe(4)
  });

  it('should apply to continue nest level array value', function () {
    function* generator():Generator{
      yield 2
      yield 3
      yield 4
    }
    const gen = generator()
    const target = [
      [1],
      [2,3]
    ]
    deepSet(target,"[][]",gen)
    expect(target[0][0]).toBe(2)
    expect(target[1][0]).toBe(3)
    expect(target[1][1]).toBe(4)
  });

  it('should set array count with simple value', function () {
    function* generator():Generator{
      yield 2
      yield 3
      yield 4
    }
    const gen = generator()
    const target ={
      a:1
    }
    deepSet(target,"b[+2]",gen)
    expect(target).toStrictEqual({
      a:1,
      b:[2,3]
    })
  });

  it('should set array count in nest value', function () {
    function* generator():Generator{
      yield 2
      yield 3
      yield 4
    }
    const gen = generator()
    const target = {
      a:1
    }
    deepSet(target,"b[+3].c",gen)
    expect(target).toStrictEqual({
      a:1,
      b:[
        {c:2},
        {c:3},
        {c:4}
      ]
    })
  });
})


describe("Test Extract Object",()=>{
  it('should extract with string', function () {
    const target = {
      a:[1,2,3]
    }
    const result = extractObject(target,{
      "b":"a"
    })

    expect(result).toStrictEqual({
      b:[1,2,3]
    })
  });

  it('should extract single field', function () {
    const target = {
      result_code:2003,
      hits:{
        data:[
          {a:1},
          {a:2},
        ]
      }
    }
    const result = extractObject(target,"hits.data")

    expect(result).toStrictEqual([
      {a:1},
      {a:2},
    ])
  });

  it('should extract single field with converter', function () {
    const target = {
      result_code:2003,
      hits:{
        data:[
          {a:1},
          {a:2},
        ]
      }
    }
    const result = extractObject(target,(data)=>data.hits.data)

    expect(result).toStrictEqual([
      {a:1},
      {a:2},
    ])
  });

  it('should extract with function', function () {
    const target = {
      a:[1,2,3]
    }
    const result = extractObject(target,{
      "b":(data:any)=>data.a
    })

    expect(result).toStrictEqual({
      b:[1,2,3]
    })
  });

  it('should extract nested field', function () {
    const target = {
      result_code:2003,
      hits:{
        data:[
          {a:1},
          {a:2},
        ]
      }
    }
    const result = extractObject(target,{
      "result":"result_code",
      "data":"hits.data"
    })

    expect(result).toStrictEqual({
      result:2003,
      data:[
        {a:1},
        {a:2},
      ]
    })
  });
})

describe("Test Extract Object with From",()=>{
  it('should extract with converter', function () {
    const target = {
      a:[1,2,3]
    }
    const result = extractObject(target,{
      "b":From("a",(x)=>x.map((y:any)=>y+1))
    })

    expect(result).toStrictEqual({
      b:[2,3,4]
    })
  });

  it('should extract with multiple converter', function () {
    const target = {
      a:[1,2,3]
    }
    const result = extractObject(target,{
      "b":From("a",(x)=>x.map((y:any)=>y+1),(x)=>x.map((y:any)=>y+1))
    })

    expect(result).toStrictEqual({
      b:[3,4,5]
    })
  });
})
