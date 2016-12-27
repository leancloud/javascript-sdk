describe('AV utils', () => {
  describe('_encode', () => {
    it('should be pure', () => {
      const date = new Date();
      const object = { date };
      const array = [date];
      AV._encode(object);
      AV._encode(array);
      object.date.should.be.a.Date();
      object.date.should.be.exactly(date);
      array[0].should.be.a.Date();
      array[0].should.be.exactly(date);
    });
  });

  describe('_decode', () => {
    it('should be pure', () => {
      const value = '1970-01-01 08:00:00.000 +0800';
      const object = { date: value };
      const array = [value];
      AV._decode(object);
      AV._decode(array);
      object.date.should.be.a.String();
      object.date.should.be.exactly(value);
      array[0].should.be.a.String();
      array[0].should.be.exactly(value);
    });
  });
});
