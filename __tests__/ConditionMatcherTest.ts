import {StructureConditionMatcher} from "../src/server/ConditionMatcher";

describe("Test Structural Matcher",()=>{
  it('should match single value success', function () {
    const target = {
      a:1,
      b:[
        {
          c:2
        }
      ]
    }
    const validations = {
      "a":1
    }
    const isValid = new StructureConditionMatcher(()=>target,validations).evaluate({} as any, {} as any)
    expect(isValid).toBe(true)
  });

  it('should match single value fail', function () {
    const target = {
      a:1,
      b:[
        {
          c:2
        }
      ]
    }
    const validations = {
      "a":2
    }
    const isValid = new StructureConditionMatcher(()=>target,validations).evaluate({} as any, {} as any)
    expect(isValid).toBe(false)
  });

  it('should match multiple value success', function () {
    const target = {
      a:1,
      b:[
        {
          c:2
        }
      ]
    }
    const validations = {
      "a":1,
      "b[0].c":2
    }
    const isValid = new StructureConditionMatcher(()=>target,validations).evaluate({} as any, {} as any)
    expect(isValid).toBe(true)
  });

  it('should match multiple value fail', function () {
    const target = {
      a:1,
      b:[
        {
          c:2
        }
      ]
    }
    const validations = {
      "a":1,
      "b[0].c":3
    }
    const isValid = new StructureConditionMatcher(()=>target,validations).evaluate({} as any, {} as any)
    expect(isValid).toBe(false)
  });

  it('should match nested value success', function () {
    const target = {
      a:1,
      b:[
        {
          c:2
        }
      ]
    }
    const validations = {
      "a":1,
      "b[0]":{
        c:2
      }
    }
    const isValid = new StructureConditionMatcher(()=>target,validations).evaluate({} as any, {} as any)
    expect(isValid).toBe(true)
  });

  it('should match function for single value', function () {
    const target = {
      a:1,
      b:[
        {
          c:2
        }
      ]
    }
    const validations = {
      "a":(x:number)=>x > 0
    }
    const isValid = new StructureConditionMatcher(()=>target,validations).evaluate({} as any, {} as any)
    expect(isValid).toBe(true)
  });

  it('should match function for nest value', function () {
    const target = {
      a:1,
      b:[
        {
          c:2
        }
      ]
    }
    const validations = {
      "b[0]":(x:any)=>x.c == 2
    }
    const isValid = new StructureConditionMatcher(()=>target,validations).evaluate({} as any, {} as any)
    expect(isValid).toBe(true)
  });


})
