var TestError = AV.Object.extend("TestError");
describe("error",function(){

  it("return error",function(done){
    var test = new TestError();
    test.set("num",1);
    test.save();
    var test1 = new TestError();
    test.set("num","s");
    test.save(null,{
      success:function(obj){
        debug(obj);
        done();
      },
      error:function(obj,err){
        debug(obj);
        debug(err);
        done();
      }
    }
    );
  });

});
