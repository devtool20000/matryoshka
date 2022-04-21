import {
  AddUpdater,
  MoveUpdater,
  RemoveUpdater,
  RenameUpdater,
  updateObject,
  UpdateUpdater
} from "../src/mock/ObjectUpdater";
import {constantValues, FakeObject, values} from "../src/mock/MockGenerator";
import {Fake} from "../src/mock/FakerField";

describe("Test Add Fields",()=>{
  it('add single field with single value', function () {
    const target:any = {}
    new AddUpdater({
      a:1
    }).updateObject(target)
    expect(target.a).toBe(1)
  });

  it('add new array fields with length', function () {
    const target:any = {}
    new AddUpdater({
      "a[+4]":constantValues(1,2,3)
    }).updateObject(target)
    expect(target).toStrictEqual({
      a:[1,2,3,1]
    })
  });

  it('use array as primitive value', function () {
    const target:any = {}
    new AddUpdater({
      "a":[1,2]
    }).updateObject(target)
    expect(target).toStrictEqual({
      a:[1,2]
    })
  });

  it('add single field with values', function () {
    const target:any = [{n:1},{n:2},{n:3},{n:4}]
    new AddUpdater({
      "[].a":constantValues(1,2,3)
    }).updateObject(target)
    expect(target).toStrictEqual([{n:1,a:1},{n:2,a:2},{n:3,a:3},{n:4,a:1}])
  });

  it('add single field with value generator', function () {
    const target:any = [{n:1},{n:2},{n:3},{n:4}]
    new AddUpdater({
      "[].a":Fake("name.firstName")
    }).updateObject(target)
    expect(target).toStrictEqual([{n:1,a:"Maurine"},{n:2,a:"Mervin"},{n:3,a:"Edison"},{n:4,a:"Hilbert"}])
  });

  it('add single field with fixed value + generator', function () {
    const target:any = [{n:1},{n:2},{n:3},{n:4}]
    new AddUpdater({
      "[].a":constantValues("name1","name2",Fake("name.firstName"))
    }).updateObject(target)
    expect(target).toStrictEqual([{n:1,a:"name1"},{n:2,a:"name2"},{n:3,a:"Maurine"},{n:4,a:"Mervin"}])
  });

  it('add single field with nested path', function () {
    const target:any = [{n:1},{n:2}]
    new AddUpdater({
      "[].a":{
        "b":constantValues("name1",Fake("name.firstName"))
      },
    }).updateObject(target)
    expect(target).toStrictEqual([{n:1,a:{b:"name1"}},{n:2,a:{b:"Maurine"}}])
  });

  it('add single field with multi nested path', function () {
    const target:any = [{n:1},{n:2}]
    new AddUpdater({
      "[].a":{
        "b":constantValues("name1",Fake("name.firstName")),
        "c":1
      },
    }).updateObject(target)
    expect(target).toStrictEqual([{n:1,a:{b:"name1",c:1}},{n:2,a:{b:"Maurine",c:1}}])
  });

  it('add single field with multi nested array', function () {
    const target:any = [{n:1,k:[{a:1}]},{n:2,k:[{a:1}]}]
    new AddUpdater({
      "[].k[]":{
        "a":constantValues("name1",Fake("name.firstName"))
      },
    }).updateObject(target)
    expect(target).toStrictEqual([{n:1,k:[{a:"name1"}]},{n:2,k:[{a:"Maurine"}]}])
  });

  it('add multiple field with fixed value + generator', function () {
    const target:any = [{n:1},{n:2}]
    new AddUpdater({
      "[].a":constantValues("name1",Fake("name.firstName")),
      "[].b":constantValues("name1",Fake("name.firstName"))
    }).updateObject(target)
    expect(target).toStrictEqual([{n:1,a:"name1",b:"name1"},{n:2,a:"Maurine",b:"Maurine"}])
  });

  it('multiple field test skip', function () {
    const target:any = [{n:1},{n:2}]
    new AddUpdater({
      "[].a":constantValues("name1",Fake("name.firstName")),
      "[].b":constantValues("name1",Fake("name.firstName"))
    }).updateObject(target,1)
    expect(target).toStrictEqual([{n:1,a:"Maurine",b:"Maurine"},{n:2,a:"Mervin",b:"Mervin"}])
  });

  it('add object as values', function () {
    const target:any = {
      a:[{b:{}},{b:{}}]
    }
    new AddUpdater({
      "a[].b":constantValues({c:1},{c:2})
    }).updateObject(target)
    expect(target).toStrictEqual({
      "a":[
        {b:{c:1}},
        {b:{c:2}}
      ]
    })
  });

  it('add object as values + fakeObject', function () {
    const target:any = {
      a:[{b:{}},{b:{}},{b:{}},{b:{}},{b:{}}]
    }
    new AddUpdater({
      "a[].b":values({c:1},{c:2},FakeObject({
        c:values(4,6)
      }))
    }).updateObject(target)
    expect(target).toStrictEqual({
      "a":[
        {b:{c:1}},
        {b:{c:2}},
        {b:{c:4}},
        {b:{c:6}},
        {b:{c:4}}
      ]
    })
  });
})


describe("Test Update Fields",()=>{
  it('update single field', function () {
    const target:any = [{n:1},{n:2}]
    new UpdateUpdater({
      "[].n":(value:number)=>value *2,
    }).updateObject(target)
    expect(target).toStrictEqual([{n:2},{n:4}])
  });

  it('update single object', function () {
    const target:any = [{n:{a:1}},{n:{a:2}}]
    new UpdateUpdater({
      "[].n":(value:any)=>{
        return {
          a:value.a * 2,
          b:value.a > 1
        }
      },
    }).updateObject(target)
    expect(target).toStrictEqual([{n:{a:2,b:false}},{n:{a:4,b:true}}])
  });
})

describe("Test Remove Fields",()=>{
  it('remove single field', function () {
    const target:any = [{n:1},{n:2}]
    new RemoveUpdater({
      "[].n":true,
    }).updateObject(target)
    expect(target).toStrictEqual([{},{}])
  });

  it('remove nested fields', function () {
    const target:any = [{n:{a:1,b:{d:1}}},{n:{a:2,b:{d:2}}}]
    new RemoveUpdater({
      "[].n":{
        a:true,
        b:{d:true}
      }
    }).updateObject(target)
    expect(target).toStrictEqual([{n:{b:{}}},{n:{b:{}}}])
  });
})


describe("Test Move Fields",()=>{
  it('move single field', function () {
    const target:any = [{n:1},{n:2}]
    new MoveUpdater({
      "[].n":"[].n2",
    }).updateObject(target)
    expect(target).toStrictEqual([{n2:1},{n2:2}])
  });

  it('move nested fields', function () {
    const target:any = [{n:{a:1,b:{d:1}}},{n:{a:2,b:{d:2}}}]
    new MoveUpdater({
      "[].n.a":"[].n.a1",
      "[].n.b.d":"[].n.d"
    }).updateObject(target)
    expect(target).toStrictEqual([{n:{a1:1,b:{},d:1}},{n:{a1:2,b:{},d:2}}])
  });
})

describe("Test Rename Fields",()=>{
  it('rename inline single field', function () {
    const target:any = [{n:1},{n:2}]
    new RenameUpdater({
      "[].n":"n2",
    }).updateObject(target)
    expect(target).toStrictEqual([{n2:1},{n2:2}])
  });

  it('rename nested single field', function () {
    const target:any = [{n:1},{n:2}]
    new RenameUpdater({
      "[]":{
        n:"n2"
      },
    }).updateObject(target)
    expect(target).toStrictEqual([{n2:1},{n2:2}])
  });

  it('rename nested fields', function () {
    const target:any = [{n:{a:1,b:{d:1}}},{n:{a:2,b:{d:2}}}]
    new RenameUpdater({
      "[].n.a":"a1",
      "[].n.b.d":"e"
    }).updateObject(target)
    expect(target).toStrictEqual([{n:{a1:1,b:{e:1}}},{n:{a1:2,b:{e:2}}}])
  });
})

describe("Test updateObject",()=>{
  it('test all', function () {
    const target:any  = [
      {
        "rename":1,
        "remove":1,
        "move":1,
        "update":1
      },
      {
        "rename":1,
        "remove":2,
        "move":2,
        "update":4
      }
    ]

    updateObject(target,{
      update:{
        "[].update":(x:any)=>x*2
      },
      remove:{
        "[].remove":true
      },
      move:{
        "[].move":"[].inner.field"
      },
      rename:{
        "[].rename":"new"
      },
      add:{
        "[].name":constantValues(1,2)
      }
    })

    expect(target).toStrictEqual([
      {
        "new":1,
        name:1,
        "inner":{
          field:1
        },
        "update":2
      },
      {
        "new":1,
        name:2,
        "inner":{
          field:2
        },
        "update":8
      }
    ])
  });
})

