import { add } from "../index";
// const add = require("../index");

it("test",()=>{
    expect(true).toBe(true);
})

test("init",()=>{
    expect(add(1,1)).toBe(2);
})