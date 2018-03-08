describe('AV.init', () => {
  before(function() {
    this.originalAppId = AV.applicationId;
    AV.applicationId = undefined;
  });

  after(function() {
    AV.applicationId = this.originalAppId;
  });

  it('param check', () => {
    (() => AV.init()).should.throw(/must be a string/);
    (() => AV.init('aaa')).should.throw(/must be a string/);
    (() => AV.init('', '')).should.throw(/must be a string/);
  });
});

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

    it('should bypass with non-plain object', () => {
      const now = new Date();
      AV._decode(now).should.be.exactly(now);
      AV._decode(3.14).should.be.exactly(3.14);
      AV._decode(false).should.be.exactly(false);
      AV._decode('false').should.be.exactly('false');
    });

    it('should decode ACL', () => {
      AV._decode(new AV.ACL(), 'ACL').should.be.instanceof(AV.ACL);
      AV._decode(
        { '*': { read: true, write: true } },
        'ACL'
      ).should.be.instanceof(AV.ACL);
      AV._decode({ '*': { read: true, write: true } }).should.not.be.instanceof(
        AV.ACL
      );
    });

    it('should decode File', () => {
      const fileId = '1111111';
      const json = {
        mime_type: 'image/png',
        updatedAt: '2016-12-30T06:55:43.561Z',
        key: 'd7aaab5c477b289980fc.png',
        name: 'lc.png',
        objectId: fileId,
        createdAt: '2016-12-30T06:55:43.561Z',
        __type: 'File',
        url: '',
        bucket: 'rYAutyUJ',
      };
      const file = AV._decode(json);
      expect(file).to.be.a(AV.File);
      expect(file.id).to.be(fileId);
      expect(file.name()).to.be('lc.png');
      expect(file.get('mime_type')).to.be('image/png');
      expect(typeof file.url()).to.be('string');
      expect(file.createdAt).to.be.a(Date);
    });
  });
});
